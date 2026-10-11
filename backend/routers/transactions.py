"""Transactions router — create, list, OTP verify, complete."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from dependencies import get_current_active_user, require_staff
from services.rates import fetch_live_rates, apply_spread, CURRENCY_META
from services.luhn import validate_card
from services.otp import generate_otp, otp_expiry, send_otp_email, MAX_ATTEMPTS

router = APIRouter(prefix="/transactions", tags=["transactions"])

# GST and TCS rates (India 2024)
GST_RATE = 0.0018        # 0.18% on exchange margin for forex
TCS_THRESHOLD = 700000   # ₹7 lakh per financial year for TCS
TCS_RATE = 0.005         # 0.5% TCS above threshold (LRS)


def _calc_gst(inr_amount: float, spread_pct: float) -> float:
    """GST is levied on the exchange margin (spread portion)."""
    margin = inr_amount * (spread_pct / 100)
    return round(margin * GST_RATE, 2)


def _calc_tcs(inr_amount: float) -> float:
    """TCS at 0.5% on transactions above ₹7 lakh (simplified — per-transaction check)."""
    if inr_amount > TCS_THRESHOLD:
        return round(inr_amount * TCS_RATE, 2)
    return 0.0


@router.post("/", response_model=schemas.TransactionOut, status_code=201)
async def create_transaction(
    payload: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Initiate a forex transaction (buy/sell).
    Validates card via Luhn, calculates rates + GST + TCS.
    Sends OTP for verification before completion.
    """
    currency = payload.currency_code.upper()
    if currency not in CURRENCY_META:
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {currency}")

    # Validate card
    is_valid, network, masked, last4, card_msg = validate_card(payload.card_number)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid card: {card_msg}")

    # Fetch live rate
    try:
        live = await fetch_live_rates()
        mid_rate = live["rates"].get(currency)
        if not mid_rate:
            raise ValueError("Rate unavailable")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Unable to fetch live rate: {str(e)}")

    from services.rates import SPREAD, DEFAULT_SPREAD
    spread_pct = SPREAD.get(currency, DEFAULT_SPREAD)
    applied_rate = apply_spread(mid_rate, currency, payload.transaction_type)

    # Amounts
    foreign_amount = payload.foreign_amount
    inr_amount = round(foreign_amount * applied_rate, 2)
    gst_amount = _calc_gst(inr_amount, spread_pct)
    tcs_amount = _calc_tcs(inr_amount)

    txn = models.Transaction(
        user_id=current_user.id,
        transaction_type=models.TransactionType(payload.transaction_type),
        currency_code=currency,
        foreign_amount=foreign_amount,
        inr_amount=inr_amount,
        rate_used=round(applied_rate, 4),
        spread_pct=spread_pct,
        gst_amount=gst_amount,
        tcs_amount=tcs_amount,
        card_last4=last4,
        card_type=network,
        card_valid=True,
        status=models.TransactionStatus.pending,
        otp_verified=False,
        purpose=payload.purpose,
        notes=payload.notes,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    # Send transaction OTP
    otp_code = generate_otp()
    otp_obj = models.OTP(
        user_id=current_user.id,
        email=current_user.email,
        otp_code=otp_code,
        purpose="transaction",
        expires_at=otp_expiry(),
    )
    db.add(otp_obj)
    db.commit()

    await send_otp_email(
        current_user.email, otp_code, "transaction", current_user.name
    )

    return txn


@router.get("/", response_model=schemas.TransactionListResponse)
async def list_transactions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(default=None),
    currency: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """List the current user's transactions with pagination."""
    query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    )
    if status:
        try:
            query = query.filter(
                models.Transaction.status == models.TransactionStatus(status)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    if currency:
        query = query.filter(
            models.Transaction.currency_code == currency.upper()
        )

    total = query.count()
    transactions = (
        query.order_by(models.Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return schemas.TransactionListResponse(
        total=total,
        page=page,
        page_size=page_size,
        transactions=transactions,
    )


@router.get("/{transaction_id}", response_model=schemas.TransactionOut)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Fetch a single transaction by ID."""
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@router.post("/{transaction_id}/verify-otp", response_model=schemas.TransactionOut)
async def verify_transaction_otp(
    transaction_id: int,
    payload: schemas.OTPVerify,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Verify OTP for a pending transaction.
    On success: marks transaction as otp_verified + completed.
    """
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn.status != models.TransactionStatus.pending:
        raise HTTPException(
            status_code=400,
            detail=f"Transaction is already {txn.status.value}",
        )

    otp = db.query(models.OTP).filter(
        models.OTP.email == current_user.email,
        models.OTP.purpose == "transaction",
        models.OTP.is_used == False,
    ).order_by(models.OTP.created_at.desc()).first()

    if not otp:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new one.")
    if datetime.utcnow() > otp.expires_at:
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    otp.attempts += 1
    if otp.attempts > MAX_ATTEMPTS:
        otp.is_used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Too many attempts. Please request a new OTP.")

    if otp.otp_code != payload.otp_code:
        db.commit()
        remaining = MAX_ATTEMPTS - otp.attempts
        raise HTTPException(
            status_code=400,
            detail=f"Incorrect OTP. {remaining} attempt(s) remaining.",
        )

    otp.is_used = True
    txn.otp_verified = True
    txn.status = models.TransactionStatus.completed
    db.commit()
    db.refresh(txn)
    return txn


@router.post("/{transaction_id}/cancel", response_model=schemas.TransactionOut)
async def cancel_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Cancel a pending transaction."""
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn.status != models.TransactionStatus.pending:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel a {txn.status.value} transaction",
        )
    txn.status = models.TransactionStatus.cancelled
    db.commit()
    db.refresh(txn)
    return txn


# Staff/Admin endpoints
@router.get("/admin/all", response_model=schemas.TransactionListResponse)
async def list_all_transactions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    status: Optional[str] = Query(default=None),
    currency: Optional[str] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    _staff: models.User = Depends(require_staff),
):
    """Admin/staff: list all transactions across all users."""
    query = db.query(models.Transaction)
    if status:
        query = query.filter(models.Transaction.status == models.TransactionStatus(status))
    if currency:
        query = query.filter(models.Transaction.currency_code == currency.upper())
    if user_id:
        query = query.filter(models.Transaction.user_id == user_id)

    total = query.count()
    transactions = (
        query.order_by(models.Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return schemas.TransactionListResponse(
        total=total,
        page=page,
        page_size=page_size,
        transactions=transactions,
    )
