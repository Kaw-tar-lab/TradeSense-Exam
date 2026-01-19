from typing import Dict, Any, Optional

from models import Challenge
from .data import get_recent_closes


def _sma(values, window: int) -> Optional[float]:
    if not values or len(values) < window:
        return None
    return sum(values[-window:]) / window


def _momentum(values, lookback: int = 5) -> Optional[float]:
    if not values or len(values) <= lookback:
        return None
    return float(values[-1] - values[-1 - lookback])


def _volatility(values) -> Optional[float]:
    try:
        if not values or len(values) < 6:
            return None
        returns = []
        for i in range(1, len(values)):
            prev = values[i - 1]
            cur = values[i]
            if prev and prev > 0:
                returns.append((cur - prev) / prev)
        if not returns:
            return None
        mean = sum(returns) / len(returns)
        var = sum((r - mean) ** 2 for r in returns) / max(1, len(returns) - 1)
        return var ** 0.5
    except Exception:
        return None


def validate_trade(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Validate a trade request using quick heuristics: risk, trend, volatility.
    Returns a fast, explainable decision without changing any challenge state.
    """
    challenge_id = int(payload.get('challenge_id', 0))
    ticker = (payload.get('ticker') or '').upper()
    side = (payload.get('side') or '').upper()
    quantity = float(payload.get('quantity', 0))
    price = float(payload.get('price', 0))

    if not all([challenge_id > 0, ticker, side in ('BUY', 'SELL'), quantity > 0, price > 0]):
        return {
            'approved': False,
            'reason': 'Invalid payload',
            'suggested_quantity': 0.0
        }

    ch = Challenge.query.get(challenge_id)
    capital = float(ch.starting_balance) if ch else 5000.0

    closes = get_recent_closes(ticker, limit=20) or []
    sma_short = _sma(closes, 5)
    sma_long = _sma(closes, 14)
    mom = _momentum(closes, 5)
    vol = _volatility(closes)

    # Fallbacks
    vol_safe = vol if vol is not None else 0.01  # assume 1% std if unknown

    # Determine trend alignment
    trend = 'NEUTRAL'
    if sma_short is not None and sma_long is not None and mom is not None:
        if sma_short > sma_long and mom > 0:
            trend = 'BULLISH'
        elif sma_short < sma_long and mom < 0:
            trend = 'BEARISH'
        else:
            trend = 'NEUTRAL'

    warnings = []
    if side == 'BUY' and trend == 'BEARISH':
        warnings.append('Trade contre la tendance (bearish)')
    if side == 'SELL' and trend == 'BULLISH':
        warnings.append('Trade contre la tendance (bullish)')

    # Extreme volatility → block
    EXTREME_VOL_THRESHOLD = 0.05  # 5% std of returns
    if vol_safe >= EXTREME_VOL_THRESHOLD:
        return {
            'approved': False,
            'reason': 'Volatilité extrême : blocage',
            'suggested_quantity': 0.0
        }

    # Estimate risk per trade using volatility-derived stop distance
    stop_dist_pct = max(0.005, 2.5 * vol_safe)  # at least 0.5%
    estimated_loss = price * quantity * stop_dist_pct
    risk_pct = (estimated_loss / capital) * 100.0 if capital > 0 else 100.0

    if risk_pct > 2.0:
        # Suggest lower quantity to meet 2% risk
        factor = 2.0 / risk_pct if risk_pct > 0 else 0.0
        suggested_qty = max(0.0, round(quantity * factor, 6))
        return {
            'approved': False,
            'reason': 'Risk per trade too high',
            'suggested_quantity': suggested_qty
        }

    # Approved with potential warnings
    reason = 'Approved'
    if warnings:
        reason = 'Warning: ' + '; '.join(warnings)

    return {
        'approved': True,
        'reason': reason,
        'suggested_quantity': round(quantity, 6)
    }