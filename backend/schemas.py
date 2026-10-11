"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
import re


# ── Auth ────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v):
        if v and not re.match(r"^\+?[0-9]{10,15}$", v.replace(" ", "")):
            raise ValueError("Invalid phone number format")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_email: str
    user_role: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── OTP ─────────────────────────────────────────────────────

class OTPRequest(BaseModel):
    email: EmailStr
    purpose: str  # "login" | "transaction" | "register"


class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str
    purpose: str


class OTPResponse(BaseModel):
    message: str
    dev_otp: Optional[str] = None  # Only returned in DEV_MODE=true


# ── Card Validation ──────────────────────────────────────────

class CardValidateRequest(BaseModel):
    card_number: str  # raw 16-19 digit number (spaces/dashes stripped server-side)

    @field_validator("card_number")
    @classmethod
    def strip_formatting(cls, v):
        return re.sub(r"[\s\-]", "", v)


class CardValidateResponse(BaseModel):
    is_valid: bool           # Luhn algorithm result
    card_type: str           # "Visa" | "Mastercard" | "RuPay" | "Amex" | "Unknown"
    card_network: str        # IIN-based network detection
    masked_number: str       # **** **** **** 1234
    last4: str
    message: str


# ── Rates ────────────────────────────────────────────────────

class LiveRateItem(BaseModel):
    currency: str
    name: str
    flag: str
    mid_rate: float
    buy_rate: float
    sell_rate: float
    spread_pct: float
    change_pct: Optional[float] = None


class LiveRatesResponse(BaseModel):
    base: str
    rates: List[LiveRateItem]
    fetched_at: str
    source: str


class HistoricalRatePoint(BaseModel):
    date: str
    rate: float


class HistoricalRatesResponse(BaseModel):
    currency: str
    base: str
    data: List[HistoricalRatePoint]
    source: str


class ForecastResponse(BaseModel):
    currency: str
    current_rate: float
    forecast_rate: float
    forecast_pct: float
    direction: str         # "UP" | "DOWN" | "FLAT"
    spread_regime: str     # "Tight" | "Standard" | "Wide"
    spread_pct: float
    buy_rate: float
    sell_rate: float
    inventory_signal: str  # "Accumulate" | "Hold" | "Reduce"
    ma7: float
    ma21: float
    vol7: float
    data_points: int


# ── Transactions ─────────────────────────────────────────────

class TransactionCreate(BaseModel):
    transaction_type: str   # "buy" | "sell"
    currency_code: str
    foreign_amount: float
    card_number: str        # Will be Luhn-validated server-side
    purpose: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("foreign_amount")
    @classmethod
    def positive_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

    @field_validator("card_number")
    @classmethod
    def strip_card(cls, v):
        return re.sub(r"[\s\-]", "", v)


class TransactionOTPVerify(BaseModel):
    transaction_id: int
    otp_code: str


class TransactionOut(BaseModel):
    id: int
    transaction_type: str
    currency_code: str
    foreign_amount: float
    inr_amount: float
    rate_used: float
    spread_pct: float
    gst_amount: float
    tcs_amount: float
    card_last4: Optional[str]
    card_type: Optional[str]
    card_valid: bool
    status: str
    otp_verified: bool
    purpose: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    transactions: List[TransactionOut]
