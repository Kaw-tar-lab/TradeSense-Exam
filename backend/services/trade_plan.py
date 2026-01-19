from typing import Dict, Optional

from .data import get_price, get_recent_closes
from models import Challenge


def _sma(values, window: int) -> Optional[float]:
    if not values or len(values) < window:
        return None
    return sum(values[-window:]) / window


def _momentum(values, lookback: int = 5) -> Optional[float]:
    if not values or len(values) <= lookback:
        return None
    return float(values[-1] - values[-1 - lookback])


def _volatility(values) -> Optional[float]:
    """Return recent volatility estimate as std of returns (percentage)."""
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
        # Simple std approx
        mean = sum(returns) / len(returns)
        var = sum((r - mean) ** 2 for r in returns) / max(1, len(returns) - 1)
        std = var ** 0.5
        return std
    except Exception:
        return None


def _rules_for_challenge(challenge: Challenge) -> Dict:
    """Return Prop Firm-like rules derived from challenge capital.
    This avoids DB migrations by computing policy dynamically.
    """
    capital = float(challenge.starting_balance) if challenge else 5000.0
    # Tiers: more capital → stricter drawdown, lower profit target targets
    if capital >= 10000:
        return {
            'max_daily_drawdown_pct': 0.03,  # 3%
            'profit_target_pct': 0.08,       # 8%
        }
    elif capital >= 5000:
        return {
            'max_daily_drawdown_pct': 0.035, # 3.5%
            'profit_target_pct': 0.09,       # 9%
        }
    else:
        return {
            'max_daily_drawdown_pct': 0.04,  # 4%
            'profit_target_pct': 0.10,       # 10%
        }


def compute_trade_plan(challenge_id: int, ticker: str) -> Dict:
    ticker_u = ticker.upper()
    # Capital from challenge
    ch = Challenge.query.get(challenge_id)
    capital = float(ch.starting_balance) if ch else 5000.0

    # Market data
    price = get_price(ticker_u)
    closes = get_recent_closes(ticker_u, limit=20) or []

    # Indicators
    sma_short = _sma(closes, 5)
    sma_long = _sma(closes, 14)
    mom = _momentum(closes, 5)
    vol = _volatility(closes)

    # Defaults / fallbacks
    if price is None and closes:
        price = closes[-1]
    if price is None:
        price = 0.0

    # Direction: trend and momentum
    direction = 'LONG'
    if sma_short is not None and sma_long is not None and mom is not None:
        if sma_short > sma_long and mom > 0:
            direction = 'LONG'
        elif sma_short < sma_long and mom < 0:
            direction = 'SHORT'
        else:
            direction = 'LONG' if mom >= 0 else 'SHORT'

    # Prop Firm rules derived from challenge
    rules = _rules_for_challenge(ch)
    max_daily_drawdown_pct = rules['max_daily_drawdown_pct']
    profit_target_pct = rules['profit_target_pct']

    # Risk percent per trade based on volatility and capital
    # Base 1%; reduce if volatility is high; increase slightly if very low
    vol_safe = vol if vol is not None else 0.01
    if vol_safe >= 0.03:
        risk_pct = 0.5
    elif vol_safe >= 0.015:
        risk_pct = 0.8
    elif vol_safe <= 0.005:
        risk_pct = 1.5
    else:
        risk_pct = 1.0

    # Bound risk by Prop Firm rules
    risk_pct = min(risk_pct, max_daily_drawdown_pct * 0.5 * 100)  # convert to percent
    # risk_pct here is percentage (e.g., 1.0 means 1%)

    # Stop/Take profit distances using volatility
    # Use k * vol as percentage distance, with floors
    k_stop = 2.5
    k_tp = 5.0
    vol_pct = max(0.005, vol_safe)  # at least 0.5%
    stop_dist_pct = k_stop * vol_pct
    tp_dist_pct = k_tp * vol_pct

    entry = float(price)
    if direction == 'LONG':
        stop_loss = entry * (1 - stop_dist_pct)
        take_profit = entry * (1 + tp_dist_pct)
    else:  # SHORT
        stop_loss = entry * (1 + stop_dist_pct)
        take_profit = entry * (1 - tp_dist_pct)

    # Rationale
    rationale_parts = []
    if sma_short is not None and sma_long is not None:
        rationale_parts.append('Trend haussier' if sma_short > sma_long else 'Trend baissier')
    else:
        rationale_parts.append('Trend indéterminé')
    if vol_safe <= 0.01:
        rationale_parts.append('faible volatilité')
    elif vol_safe <= 0.02:
        rationale_parts.append('volatilité modérée')
    else:
        rationale_parts.append('volatilité élevée')

    rationale = ' + '.join(rationale_parts)

    result = {
        'ticker': ticker_u,
        'direction': direction,
        'entry': round(entry, 4) if entry else entry,
        'stop_loss': round(stop_loss, 4) if stop_loss else stop_loss,
        'take_profit': round(take_profit, 4) if take_profit else take_profit,
        'risk_percent': round(risk_pct, 2),
        'rationale': rationale,
    }

    # Optionally include rules snapshot (useful for debugging/consumption later)
    result['rules'] = {
        'max_daily_drawdown_pct': max_daily_drawdown_pct,
        'profit_target_pct': profit_target_pct,
        'capital': capital,
    }
    return result