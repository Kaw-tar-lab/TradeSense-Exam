from __future__ import annotations

from datetime import datetime
from typing import Dict, Any, List

from extensions import db
from models import Challenge, Trade


def _percent(value: float) -> str:
    try:
        return f"{value:.1f}%"
    except Exception:
        return "0.0%"


def _safe_div(numerator: float, denominator: float) -> float:
    if denominator == 0:
        return 0.0
    return numerator / denominator


def _compute_consecutive_losers(trades: List[Trade]) -> int:
    losers = 0
    # Only count realized losing trades (sell with negative profit)
    for t in sorted(trades, key=lambda x: x.timestamp or datetime.utcnow(), reverse=True):
        # Profit is only set on sell side in current model
        if t.side == "sell" and (t.profit or 0) < 0:
            losers += 1
        elif t.side == "sell" and (t.profit or 0) > 0:
            break
        else:
            # ignore buys (profit == 0) for streak counting
            continue
    return losers


def compute_risk_alerts(challenge_id: int) -> Dict[str, Any]:
    challenge: Challenge | None = Challenge.query.get(challenge_id)
    if not challenge:
        return {
            "level": "NONE",
            "message": "Challenge introuvable",
            "metric": "Challenge",
            "current": "0.0%",
        }

    starting_balance = float(challenge.starting_balance or 0)

    trades: List[Trade] = (
        Trade.query.filter_by(challenge_id=challenge_id).all()
    )

    # Aggregate profits
    total_profit = sum(float(t.profit or 0) for t in trades)
    equity = starting_balance + total_profit

    # Daily metrics
    today = datetime.utcnow().date()
    trades_today = [t for t in trades if (t.timestamp or datetime.utcnow()).date() == today]
    daily_profit = sum(float(t.profit or 0) for t in trades_today)

    # Start-of-day equity approximated as current equity minus today's realized PnL
    start_of_day_equity = equity - daily_profit
    daily_drawdown_pct = 0.0
    if daily_profit < 0:
        daily_drawdown_pct = abs(daily_profit) * 100.0 * _safe_div(1.0, max(start_of_day_equity, 1e-9))

    # Total drawdown approximated vs starting balance (without peak tracking)
    total_drawdown_pct = 0.0
    if total_profit < 0:
        total_drawdown_pct = abs(total_profit) * 100.0 * _safe_div(1.0, max(starting_balance, 1e-9))

    consecutive_losers = _compute_consecutive_losers(trades)
    trades_today_count = len(trades_today)

    # Firm rules
    DAILY_MAX = 5.0
    TOTAL_MAX = 10.0
    DAILY_ALERT = 0.8 * DAILY_MAX  # 80% of rule
    TOTAL_ALERT = 0.8 * TOTAL_MAX

    # Determine alert candidates
    candidates: List[Dict[str, Any]] = []

    if daily_drawdown_pct >= DAILY_ALERT:
        level = "CRITICAL" if daily_drawdown_pct >= DAILY_MAX else "HIGH"
        remaining_pct = max(DAILY_MAX - daily_drawdown_pct, 0.0)
        message = (
            "Attention : vous êtes à 1 trade d’échouer le challenge"
            if remaining_pct <= 1.0 or consecutive_losers >= 3
            else "Alerte drawdown journalier élevé"
        )
        candidates.append({
            "level": level,
            "message": message,
            "metric": "Daily Drawdown",
            "current": f"-{_percent(daily_drawdown_pct)}",
        })

    if total_drawdown_pct >= TOTAL_ALERT:
        level = "CRITICAL" if total_drawdown_pct >= TOTAL_MAX else "HIGH"
        message = "Alerte drawdown total élevé"
        candidates.append({
            "level": level,
            "message": message,
            "metric": "Total Drawdown",
            "current": f"-{_percent(total_drawdown_pct)}",
        })

    # Overtrading heuristic: many trades today or long losing streak
    if trades_today_count >= 10 or consecutive_losers >= 3:
        level = "HIGH" if consecutive_losers >= 3 else "MEDIUM"
        message = (
            "Comportement de sur-trading détecté : réduisez la fréquence des trades"
        )
        candidates.append({
            "level": level,
            "message": message,
            "metric": "Overtrading",
            "current": str(trades_today_count),
        })

    # Choose highest severity; order: CRITICAL > HIGH > MEDIUM > NONE
    severity_rank = {"CRITICAL": 3, "HIGH": 2, "MEDIUM": 1, "NONE": 0}
    if candidates:
        best = sorted(candidates, key=lambda c: severity_rank.get(c["level"], 0), reverse=True)[0]
        return best

    # Default: no alert
    return {
        "level": "NONE",
        "message": "Aucune alerte de risque",
        "metric": "Risk",
        "current": _percent(0.0),
    }