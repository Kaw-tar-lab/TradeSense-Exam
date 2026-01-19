from datetime import datetime, date
import threading
from typing import Optional

from extensions import db
from models import Challenge, Trade


def _evaluate_challenge_rules(app, challenge_id: int):
    with app.app_context():
        challenge = Challenge.query.get(challenge_id)
        if not challenge or challenge.status in ('passed', 'failed'):
            return

        starting = challenge.starting_balance or 5000.0
        trades = Trade.query.filter_by(challenge_id=challenge_id).all()
        total_pnl = sum(t.profit or 0.0 for t in trades)

        # Daily PnL (UTC)
        today = date.today()
        daily_trades = [t for t in trades if (t.timestamp.date() == today)]
        daily_pnl = sum(t.profit or 0.0 for t in daily_trades)

        # Killer rules strictly as requested:
        # 1. Daily Max Loss: 5% drop -> FAILED
        if daily_pnl <= -0.05 * starting:
            challenge.status = 'failed'
        # 2. Total Max Loss: 10% drop -> FAILED
        elif total_pnl <= -0.10 * starting:
            challenge.status = 'failed'
        # 3. Profit Target: 10% increase -> RÉUSSI (passed)
        elif total_pnl >= 0.10 * starting:
            challenge.status = 'passed'
        
        db.session.commit()


def evaluate_async(app, challenge_id: int):
    threading.Thread(target=_evaluate_challenge_rules, args=(app, challenge_id,), daemon=True).start()