from datetime import datetime
from typing import Dict, Optional

import math

from .data import get_price, get_recent_closes


def _sma(values, window: int) -> Optional[float]:
    if not values or len(values) < window:
        return None
    return sum(values[-window:]) / window


def _rsi(values, window: int = 14) -> Optional[float]:
    # Basic RSI implementation (SMA version)
    if not values or len(values) < window + 1:
        return None
    diffs = [values[i] - values[i - 1] for i in range(-window + len(values), len(values))]
    gains = [d for d in diffs if d > 0]
    losses = [-d for d in diffs if d < 0]
    avg_gain = (sum(gains) / window) if gains else 0.0
    avg_loss = (sum(losses) / window) if losses else 0.0
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100.0 - (100.0 / (1.0 + rs))


def _momentum(values, lookback: int = 5) -> Optional[float]:
    if not values or len(values) <= lookback:
        return None
    return float(values[-1] - values[-1 - lookback])


def _decide_signal(sma_short: Optional[float], sma_long: Optional[float], rsi: Optional[float], momentum: Optional[float]) -> Dict:
    reason_parts = []
    if sma_short is None or sma_long is None or rsi is None or momentum is None:
        return {
            'signal': 'STOP',
            'confidence': 0.5,
            'reason': 'Insufficient data to compute indicators'
        }

    bullish = sma_short > sma_long and momentum > 0
    bearish = sma_short < sma_long and momentum < 0
    oversold = rsi < 30
    overbought = rsi > 70

    # Build reason
    if sma_short > sma_long:
        reason_parts.append('bullish MA crossover')
    elif sma_short < sma_long:
        reason_parts.append('bearish MA crossover')
    else:
        reason_parts.append('neutral MA')

    if oversold:
        reason_parts.append('RSI oversold')
    elif overbought:
        reason_parts.append('RSI overbought')
    else:
        reason_parts.append('RSI neutral')

    if momentum > 0:
        reason_parts.append('momentum up')
    elif momentum < 0:
        reason_parts.append('momentum down')
    else:
        reason_parts.append('momentum flat')

    # Decide signal
    if bullish and (oversold or (rsi <= 60)):
        signal = 'BUY'
    elif bearish and (overbought or (rsi >= 40)):
        signal = 'SELL'
    else:
        signal = 'STOP'

    # Confidence heuristic
    align_count = 0
    if bullish:
        align_count += 1
    if bearish:
        align_count += 1
    if oversold or overbought:
        align_count += 1
    mom_strength = 0.0
    if sma_long and sma_long > 0 and momentum is not None:
        mom_strength = min(0.15, abs(momentum) / sma_long * 0.5)
    base = 0.6 if signal in ('BUY', 'SELL') else 0.5
    confidence = max(0.5, min(0.95, base + align_count * 0.1 + mom_strength))

    return {
        'signal': signal,
        'confidence': round(confidence, 2),
        'reason': ' + '.join(reason_parts)
    }


def generate_signal(ticker: str) -> Dict:
    ticker_u = ticker.upper()
    price = get_price(ticker_u)
    closes = get_recent_closes(ticker_u, limit=20)

    sma_short = _sma(closes, 5) if closes else None
    sma_long = _sma(closes, 14) if closes else None
    rsi_val = _rsi(closes, 14) if closes else None
    mom = _momentum(closes, 5) if closes else None

    decision = _decide_signal(sma_short, sma_long, rsi_val, mom)

    return {
        'ticker': ticker_u,
        'price': price,
        'signal': decision['signal'],
        'confidence': decision['confidence'],
        'reason': decision['reason'],
        'time': datetime.utcnow().isoformat()
    }