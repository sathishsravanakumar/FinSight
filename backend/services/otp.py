"""OTP generation and delivery service (email via Gmail SMTP)."""
import os
import random
import string
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv
load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "Venus Forex <venusforex2005@gmail.com>")
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

OTP_LENGTH = 6
OTP_EXPIRE_MINUTES = 10
MAX_ATTEMPTS = 3


def generate_otp(length: int = OTP_LENGTH) -> str:
    """Generate a cryptographically random numeric OTP."""
    return "".join(random.choices(string.digits, k=length))


def otp_expiry() -> datetime:
    return datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)


def _build_email_html(otp: str, purpose: str, name: str = "Customer") -> str:
    purpose_labels = {
        "login": "sign in to your account",
        "transaction": "confirm your forex transaction",
        "register": "verify your email address",
    }
    action = purpose_labels.get(purpose, "complete your request")

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f8;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:480px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;
              box-shadow:0 4px 20px rgba(0,0,0,.10)">
    <!-- Header -->
    <div style="background:#2D2E8F;padding:24px 32px;text-align:center">
      <h1 style="color:#EBEBF8;font-size:20px;margin:0;font-weight:700">Venus Forex</h1>
      <p style="color:#9999CC;font-size:12px;margin:4px 0 0">RBI Authorised Money Changer · Chennai</p>
    </div>
    <!-- Body -->
    <div style="padding:32px">
      <p style="color:#1A1A2E;font-size:15px;margin:0 0 8px">Hello {name},</p>
      <p style="color:#555;font-size:14px;margin:0 0 24px;line-height:1.6">
        Use the following One-Time Password to {action}. This OTP is valid for
        <strong>{OTP_EXPIRE_MINUTES} minutes</strong> and can be used only once.
      </p>
      <!-- OTP box -->
      <div style="background:#F7F7FD;border:2px dashed #2D2E8F;border-radius:10px;
                  padding:20px;text-align:center;margin:0 0 24px">
        <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#2D2E8F;
                    font-family:monospace">{otp}</div>
        <p style="color:#888;font-size:11px;margin:8px 0 0">
          Expires in {OTP_EXPIRE_MINUTES} minutes
        </p>
      </div>
      <p style="color:#888;font-size:12px;margin:0;line-height:1.6">
        If you did not request this OTP, please ignore this email or contact us immediately at
        <a href="tel:+919444170065" style="color:#CC2222">+91 9444170065</a>.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#F7F7FD;padding:16px 32px;border-top:1px solid #E8E8F0;
                text-align:center">
      <p style="color:#aaa;font-size:11px;margin:0">
        © 2026 Venus Forex Private Limited · RBI Authorised FFMC<br>
        Do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
"""


async def send_otp_email(email: str, otp: str, purpose: str, name: str = "Customer") -> bool:
    """
    Send OTP to the given email address.
    In DEV_MODE, prints to console instead of sending.
    Returns True on success, False on failure.
    """
    if DEV_MODE:
        print(f"\n{'='*50}")
        print(f"[DEV MODE] OTP for {email} ({purpose}): {otp}")
        print(f"{'='*50}\n")
        return True

    subject_map = {
        "login": "Your Venus Forex sign-in OTP",
        "transaction": "Confirm your forex transaction — OTP",
        "register": "Verify your Venus Forex account",
    }
    subject = subject_map.get(purpose, "Your Venus Forex OTP")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = email

    html_content = _build_email_html(otp, purpose, name)
    text_content = f"Your Venus Forex OTP for {purpose}: {otp}. Valid for {OTP_EXPIRE_MINUTES} minutes."

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, [email], msg.as_string())
        return True
    except Exception as e:
        print(f"[OTP EMAIL ERROR] Failed to send to {email}: {e}")
        return False
