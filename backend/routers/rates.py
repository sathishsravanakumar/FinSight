"""Rates router — live rates, historical, forecast."""
from fastapi import APIRouter, HTTPException, Query
from services.rates import fetch_live_rates, CURRENCY_META, FEATURED_CURRENCIES
from services.forecast import run_forecast

router = APIRouter(prefix="/rates", tags=["rates"])

NEWS_URL = "https://www.investing.com/rss/news_1.rss"
NEWS_FALLBACK = [
    "RBI keeps repo rate unchanged — forex markets stable",
    "India forex reserves remain near record highs — RBI data",
    "Gold prices rise as investors seek safe-haven assets",
    "RBI intervenes to stabilise rupee against dollar volatility",
    "Outward remittances from India continue to rise — RBI report",
    "LRS limit: USD 2,50,000 per year per individual",
    "TCS at 20% on LRS remittances above ₹7 lakh",
    "Forex card usage surges among Indian students abroad",
]
_news_cache = {"at": 0.0, "items": []}


@router.get("/news")
async def get_news():
    """Forex headlines for the site ticker (cached 10 min, static fallback)."""
    import time
    import httpx
    import xml.etree.ElementTree as ET

    if _news_cache["items"] and time.time() - _news_cache["at"] < 600:
        return {"items": _news_cache["items"]}
    items = []
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            r = await client.get(NEWS_URL, headers={"User-Agent": "Mozilla/5.0"})
            r.raise_for_status()
        for it in ET.fromstring(r.content).iter("item"):
            title = (it.findtext("title") or "").strip()
            if len(title) > 10:
                items.append({"title": title, "link": (it.findtext("link") or "#").strip()})
    except Exception:
        items = []
    if len(items) < 3:
        items = [{"title": t, "link": "#"} for t in NEWS_FALLBACK]
    else:
        items = items[:15]
        _news_cache.update(at=time.time(), items=items)
    return {"items": items}


@router.get("/live")
async def get_live_rates():
    """Fetch live INR-based exchange rates for all supported currencies."""
    try:
        data = await fetch_live_rates()
        currencies = []
        for code, meta in CURRENCY_META.items():
            mid = data["rates"].get(code)
            if mid is None:
                continue
            from services.rates import SPREAD, DEFAULT_SPREAD
            spread_pct = SPREAD.get(code, DEFAULT_SPREAD)
            currencies.append({
                "code": code,
                "name": meta["name"],
                "flag": meta["flag"],
                "mid_rate": round(mid, 4),
                "buy_rate": round(mid * (1 + spread_pct / 100), 4),
                "sell_rate": round(mid * (1 - spread_pct / 100), 4),
                "spread_pct": spread_pct,
                "featured": code in FEATURED_CURRENCIES,
            })
        return {
            "currencies": currencies,
            "last_update": data["last_update"],
            "next_update": data["next_update"],
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch live rates: {str(e)}")


@router.get("/history/{currency}")
async def get_historical(currency: str, days: int = Query(default=90, ge=7, le=365)):
    """Fetch historical daily rates for a currency (INR per 1 unit)."""
    currency = currency.upper()
    if currency not in CURRENCY_META:
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {currency}")
    try:
        from services.rates import fetch_historical
        points = await fetch_historical(currency, days=days)
        return {
            "currency": currency,
            "name": CURRENCY_META[currency]["name"],
            "flag": CURRENCY_META[currency]["flag"],
            "points": points,
            "count": len(points),
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch historical data: {str(e)}")


@router.get("/forecast/{currency}")
async def get_forecast(currency: str, days: int = Query(default=120, ge=30, le=365)):
    """Run FinSight rate forecast for a currency."""
    currency = currency.upper()
    if currency not in CURRENCY_META:
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {currency}")
    try:
        result = await run_forecast(currency, days=days)
        result["name"] = CURRENCY_META[currency]["name"]
        result["flag"] = CURRENCY_META[currency]["flag"]
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Forecast failed: {str(e)}")


@router.get("/convert")
async def convert_currency(
    from_currency: str = Query(...),
    to_currency: str = Query(...),
    amount: float = Query(..., gt=0),
):
    """Convert between two currencies via INR as base."""
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    supported = set(CURRENCY_META.keys()) | {"INR"}
    if from_currency not in supported:
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {from_currency}")
    if to_currency not in supported:
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {to_currency}")

    try:
        data = await fetch_live_rates()
        rates = data["rates"]

        # Convert to INR first, then to target
        if from_currency == "INR":
            inr_amount = amount
        else:
            inr_amount = amount * rates.get(from_currency, 1)

        if to_currency == "INR":
            result = inr_amount
        else:
            result = inr_amount / rates.get(to_currency, 1)

        return {
            "from_currency": from_currency,
            "to_currency": to_currency,
            "amount": amount,
            "converted": round(result, 4),
            "rate": round(rates.get(from_currency, 1) / rates.get(to_currency, 1), 6),
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Conversion failed: {str(e)}")
