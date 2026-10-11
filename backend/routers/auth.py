"""Authentication router — register, login, OTP."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from dependencies import hash_password, verify_password, create_access_token, get_current_active_user
from services.otp import generate_otp, otp_expiry, send_otp_email, MAX_ATTEMPTS

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=201)
async def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send verification OTP
    otp_code = generate_otp()
    otp_obj = models.OTP(
        user_id=user.id,
        email=user.email,
        otp_code=otp_code,
        purpose="register",
        expires_at=otp_expiry(),
    )
    db.add(otp_obj)
    db.commit()
    await send_otp_email(user.email, otp_code, "register", user.name)

    return user


@router.post("/login", response_model=schemas.TokenResponse)
async def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
    return schemas.TokenResponse(
        access_token=token,
        user_name=user.name,
        user_email=user.email,
        user_role=user.role.value,
    )


@router.post("/otp/send", response_model=schemas.OTPResponse)
async def send_otp(payload: schemas.OTPRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    name = user.name if user else "Customer"

    # Invalidate previous unused OTPs for same email+purpose
    db.query(models.OTP).filter(
        models.OTP.email == payload.email,
        models.OTP.purpose == payload.purpose,
        models.OTP.is_used == False,
    ).delete()
    db.commit()

    otp_code = generate_otp()
    otp_obj = models.OTP(
        user_id=user.id if user else None,
        email=payload.email,
        otp_code=otp_code,
        purpose=payload.purpose,
        expires_at=otp_expiry(),
    )
    db.add(otp_obj)
    db.commit()

    success = await send_otp_email(payload.email, otp_code, payload.purpose, name)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Check SMTP settings.")

    import os
    dev = os.getenv("DEV_MODE", "true").lower() == "true"
    return schemas.OTPResponse(
        message=f"OTP sent to {payload.email}",
        dev_otp=otp_code if dev else None,
    )


@router.post("/otp/verify", response_model=schemas.OTPResponse)
async def verify_otp(payload: schemas.OTPVerify, db: Session = Depends(get_db)):
    otp = db.query(models.OTP).filter(
        models.OTP.email == payload.email,
        models.OTP.purpose == payload.purpose,
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
        raise HTTPException(status_code=400, detail=f"Incorrect OTP. {remaining} attempt(s) remaining.")

    otp.is_used = True
    # Mark user email as verified on register OTP
    if payload.purpose == "register" and otp.user_id:
        user = db.query(models.User).filter(models.User.id == otp.user_id).first()
        if user:
            user.is_verified = True
    db.commit()

    return schemas.OTPResponse(message="OTP verified successfully.")


@router.get("/me", response_model=schemas.UserOut)
async def get_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user
