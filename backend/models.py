"""SQLAlchemy ORM models for Venus Forex application."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from database import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    staff = "staff"
    admin = "admin"


class TransactionStatus(str, enum.Enum):
    pending = "pending"
    otp_verified = "otp_verified"
    completed = "completed"
    cancelled = "cancelled"
    failed = "failed"


class TransactionType(str, enum.Enum):
    buy = "buy"    # Customer buys foreign currency
    sell = "sell"  # Customer sells foreign currency


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(256), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    otps = relationship("OTP", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user")


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email = Column(String(200), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False)  # "login" | "transaction" | "register"
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="otps")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Currency details
    transaction_type = Column(Enum(TransactionType), nullable=False)
    currency_code = Column(String(10), nullable=False)   # e.g. "USD"
    foreign_amount = Column(Float, nullable=False)       # Amount in foreign currency
    inr_amount = Column(Float, nullable=False)           # Amount in INR
    rate_used = Column(Float, nullable=False)            # Exchange rate applied
    spread_pct = Column(Float, nullable=False)           # Spread % applied
    gst_amount = Column(Float, default=0.0)              # GST (18% on service fee)
    tcs_amount = Column(Float, default=0.0)              # TCS if applicable

    # Payment card details (hashed / masked)
    card_last4 = Column(String(4), nullable=True)
    card_type = Column(String(20), nullable=True)        # "visa" | "mastercard" | "rupay" | "amex"
    card_valid = Column(Boolean, default=False)          # Luhn validation passed

    # Status & OTP
    status = Column(Enum(TransactionStatus), default=TransactionStatus.pending)
    otp_verified = Column(Boolean, default=False)

    # Metadata
    purpose = Column(String(200), nullable=True)         # "travel" | "education" | "medical" etc.
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
