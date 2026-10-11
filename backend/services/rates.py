"""Rate fetching service — ExchangeRate-API v6 (live) + Frankfurter/ECB (historical)."""
import os
import httpx
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("EXCHANGE_RATE_API_KEY", "074a84758f5b9869803caa52")
FRANKFURTER_BASE = "https://api.frankfurter.dev/v1"

# Spread percentages applied to mid rates
SPREAD = {
    "USD": 1.5, "EUR": 1.5, "GBP": 1.6, "SGD": 1.7,
    "AED": 1.5, "SAR": 1.5, "JPY": 1.8, "CAD": 1.6,
    "CHF": 1.6, "AUD": 1.7, "HKD": 1.8, "NZD": 1.8,
}
DEFAULT_SPREAD = 2.0

# Currency display names and flag emojis
CURRENCY_META = {
    "USD": {"name": "US Dollar",          "flag": "🇺🇸"},
    "EUR": {"name": "Euro",               "flag": "🇪🇺"},
    "GBP": {"name": "British Pound",      "flag": "🇬🇧"},
    "SGD": {"name": "Singapore Dollar",   "flag": "🇸🇬"},
    "AED": {"name": "UAE Dirham",         "flag": "🇦🇪"},
    "SAR": {"name": "Saudi Riyal",        "flag": "🇸🇦"},
    "JPY": {"name": "Japanese Yen",       "flag": "🇯🇵"},
    "CAD": {"name": "Canadian Dollar",    "flag": "🇨🇦"},
    "CHF": {"name": "Swiss Franc",        "flag": "🇨🇭"},
    "AUD": {"name": "Australian Dollar",  "flag": "🇦🇺"},
    "HKD": {"name": "Hong Kong Dollar",   "flag": "🇭🇰"},
    "NZD": {"name": "New Zealand Dollar", "flag": "🇳🇿"},
}

FEATURED_CURRENCIES = ["USD", "EUR", "GBP", "SGD", "AED", "SAR", "JPY"]


async def fetch_live_rates() -> dict:
    """
    Fetch live INR-based rates from ExchangeRate-API v6.
    Returns: {currency: rate_per_inr, ...} — i.e. how many INR per 1 unit of foreign currency.
    """
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        # Fetch USD/INR as base first, then derive
        url = f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD"
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    if data.get("result") != "success":
        raise ValueError(f"ExchangeRate-API error: {data.get('error-type', 'unknown')}")

    usd_rates = data["conversion_rates"]  # rates relative to USD
    inr_per_usd = usd_rates.get("INR", 83.5)

    # Derive INR per unit for each currency  =  INR/USD ÷ currency/USD
    inr_rates = {}
    for code in CURRENCY_META:
        if code == "USD":
            inr_rates["USD"] = inr_per_usd
        elif code in usd_rates and usd_rates[code] != 0:
            inr_rates[code] = inr_per_usd / usd_rates[code]

    return {
        "rates": inr_rates,
        "last_update": data.get("time_last_update_utc", ""),
        "next_update": data.get("time_next_update_utc", ""),
    }


def apply_spread(mid_rate: float, currency: str, transaction_type: str) -> float:
    """
    Apply buy/sell spread to mid rate.
    buy  = customer buys foreign currency from Venus → Venus sells at mid + spread
    sell = customer sells foreign currency to Venus  → Venus buys at mid - spread
    """
    spread_pct = SPREAD.get(currency, DEFAULT_SPREAD) / 100
    if transaction_type == "buy":
        return mid_rate * (1 + spread_pct)
    else:
        return mid_rate * (1 - spread_pct)


async def fetch_historical(currency: str, days: int = 90) -> list[dict]:
    """
    Fetch historical daily ECB rates via Frankfurter API.
    Returns list of {date: str, rate: float} for INR/currency.

    AED and SAR are pegged to USD, so we fetch USD/INR history and multiply.
    JPY is fetched as JPY/INR (×100 for display).
    """
    end = date.today()
    start = end - timedelta(days=days)
    start_str = start.isoformat()
    end_str = end.isoformat()

    fetch_code = currency
    peg_multiplier = 1.0
    if currency == "AED":
        fetch_code = "USD"
        peg_multiplier = 1 / 3.6725
    elif currency == "SAR":
        fetch_code = "USD"
        peg_multiplier = 1 / 3.75

    url = f"{FRANKFURTER_BASE}/{start_str}..{end_str}?from={fetch_code}&to=INR"
    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    points = []
    for dt, vals in sorted(data.get("rates", {}).items()):
        rate = vals.get("INR", 0)
        if currency == "JPY":
            rate = rate * 100  # display per 100 JPY
        elif peg_multiplier != 1.0:
            rate = rate * peg_multiplier
        if rate > 0:
            points.append({"date": dt, "rate": round(rate, 4)})

    return points
