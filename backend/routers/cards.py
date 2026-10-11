"""Card router — Luhn validation endpoint."""
from fastapi import APIRouter, HTTPException
import schemas
from services.luhn import validate_card

router = APIRouter(prefix="/cards", tags=["cards"])


@router.post("/validate", response_model=schemas.CardValidateResponse)
async def validate_card_endpoint(payload: schemas.CardValidateRequest):
    """
    Validate a card number using the Luhn algorithm and detect card network.
    Returns validation result, card network, masked number, last 4 digits.
    """
    raw = payload.card_number  # already stripped by schema validator

    if len(raw) < 13 or len(raw) > 19:
        raise HTTPException(
            status_code=400,
            detail=f"Card number must be 13-19 digits, got {len(raw)}",
        )
    if not raw.isdigit():
        raise HTTPException(status_code=400, detail="Card number must contain digits only")

    is_valid, network, masked, last4, message = validate_card(raw)

    return schemas.CardValidateResponse(
        is_valid=is_valid,
        card_type=network,
        card_network=network,
        masked_number=masked,
        last4=last4,
        message=message,
    )
