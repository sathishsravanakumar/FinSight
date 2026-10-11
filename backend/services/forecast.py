"""FinSight Rate Forecast — rolling feature + signal-based regression."""
import math
from typing import Optional
from services.rates import fetch_historical


def _roll_mean(values: list[float], window: int) -> list[Optional[float]]:
    result = []
    for i, _ in enumerate(values):
        if i < window - 1:
            result.append(None)
        else:
            result.append(sum(values[i - window + 1: i + 1]) / window)
    return result


def _roll_std(values: list[float], window: int) -> list[float]:
    result = []
    for i, _ in enumerate(values):
        if i < window - 1:
            result.append(0.0)
        else:
            chunk = values[i - window + 1: i + 1]
            mean = sum(chunk) / window
            variance = sum((x - mean) ** 2 for x in chunk) / window
            result.append(math.sqrt(variance))
    return result


def _compute_returns(rates: list[float]) -> list[float]:
    rets = [0.0]
    for i in range(1, len(rates)):
        prev = rates[i - 1]
        if prev != 0:
            rets.append((rates[i] - prev) / prev)
        else:
            rets.append(0.0)
    return rets


def _spread_regime(vol7_last: float, all_vols: list[float]) -> dict:
    nonzero = sorted(v for v in all_vols if v > 0)
    n = len(nonzero)
    if n == 0:
        return {"regime": "Standard", "spread_pct": 1.5, "css_class": "regime-std"}
    p30 = nonzero[int(n * 0.30)]
    p70 = nonzero[int(n * 0.70)]
    if vol7_last <= p30:
        return {"regime": "Tight",    "spread_pct": 1.3, "css_class": "regime-tight"}
    if vol7_last >= p70:
        return {"regime": "Wide",     "spread_pct": 1.8, "css_class": "regime-wide"}
    return     {"regime": "Standard", "spread_pct": 1.5, "css_class": "regime-std"}


def _inventory_signal(forecast_pct: float) -> dict:
    if forecast_pct > 0.20:
        return {"signal": "Accumulate", "reason": "Rate expected to rise — build foreign currency stock"}
    if forecast_pct < -0.20:
        return {"signal": "Reduce",     "reason": "Rate expected to fall — reduce foreign currency stock"}
    return     {"signal": "Hold",       "reason": "Rate change below threshold — maintain current position"}


async def run_forecast(currency: str, days: int = 120) -> dict:
    """
    Fetch historical rates and generate FinSight forecast.

    Model:
      - Features: lagged returns (t-1, t-3, t-7), MA7, MA21, rolling vol7, vol21
      - Signal: 35% mean-reversion + 15% momentum
      - Spread: volatility-adaptive (tight/standard/wide)
      - Inventory: direction-based (accumulate/hold/reduce)
    """
    points = await fetch_historical(currency, days=days)
    if len(points) < 30:
        raise ValueError(f"Insufficient historical data for {currency} (got {len(points)} points)")

    rates = [p["rate"] for p in points]
    rets = _compute_returns(rates)
    ma7 = _roll_mean(rates, 7)
    ma21 = _roll_mean(rates, 21)
    vol7 = _roll_std(rets, 7)

    n = len(rates)
    cur = rates[-1]
    ma7_last = ma7[-1] or cur
    ma21_last = ma21[-1] or cur
    ret_last = rets[-1]
    vol7_last = vol7[-1]

    # Signal computation
    mrev = (ma21_last - cur) / cur if cur != 0 else 0.0  # mean reversion
    mom = ret_last                                          # momentum
    combined = 0.35 * mrev + 0.15 * mom

    forecast_rate = cur * (1 + combined)
    forecast_pct = combined * 100
    direction = "UP" if combined > 0 else ("DOWN" if combined < 0 else "FLAT")

    spread_info = _spread_regime(vol7_last, vol7)
    inv_info = _inventory_signal(forecast_pct)
    sp = spread_info["spread_pct"] / 100

    return {
        "currency": currency,
        "current_rate": round(cur, 4),
        "forecast_rate": round(forecast_rate, 4),
        "forecast_pct": round(forecast_pct, 4),
        "direction": direction,
        "spread_regime": spread_info["regime"],
        "spread_pct": spread_info["spread_pct"],
        "buy_rate": round(cur * (1 + sp), 4),
        "sell_rate": round(cur * (1 - sp), 4),
        "inventory_signal": inv_info["signal"],
        "inventory_reason": inv_info["reason"],
        "ma7": round(ma7_last, 4),
        "ma21": round(ma21_last, 4),
        "vol7": round(vol7_last * 100, 4),  # as %
        "data_points": n,
        "historical": points[-60:],  # last 60 days for charting
    }
