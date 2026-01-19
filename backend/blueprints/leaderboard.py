from datetime import datetime
from flask import Blueprint, jsonify
from sqlalchemy import func

from extensions import db
from models import Trade, Challenge, User


leaderboard_bp = Blueprint('leaderboard', __name__)


@leaderboard_bp.get('/leaderboard')
def leaderboard():
    # Current month filter
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    # Aggregate profits per user within current month
    q = (
        db.session.query(
            User.id.label('user_id'),
            User.name.label('name'),
            func.sum(Trade.profit).label('sum_profit'),
            func.min(Challenge.starting_balance).label('starting_balance'),
        )
        .join(Challenge, Trade.challenge_id == Challenge.id)
        .join(User, Challenge.user_id == User.id)
        .filter(Trade.timestamp >= month_start)
        .group_by(User.id, User.name)
        .order_by(func.sum(Trade.profit).desc())
        .limit(10)
    )

    results = []
    rows = q.all()
    for row in rows:
        starting = row.starting_balance or 5000.0
        pct_profit = (row.sum_profit or 0.0) / starting if starting else 0.0
        results.append({
            'user_id': row.user_id,
            'name': row.name,
            'pct_profit': pct_profit,
            'sum_profit': row.sum_profit or 0.0,
        })
    # Fallback mock when no trading data exists (dev/demo)
    if not results:
        results = [
            { 'user_id': 101, 'name': 'Amine Pro Trader', 'pct_profit': 0.245, 'sum_profit': 12250.00 },
            { 'user_id': 102, 'name': 'Sarah Markets',    'pct_profit': 0.182, 'sum_profit': 9100.50 },
            { 'user_id': 103, 'name': 'Karim Crypto',     'pct_profit': 0.154, 'sum_profit': 7700.25 },
            { 'user_id': 104, 'name': 'Yassine Scalp',    'pct_profit': 0.121, 'sum_profit': 6050.80 },
            { 'user_id': 105, 'name': 'Layla Swing',      'pct_profit': 0.095, 'sum_profit': 4750.30 },
            { 'user_id': 106, 'name': 'Mehdi Alpha',      'pct_profit': 0.084, 'sum_profit': 4200.00 },
            { 'user_id': 107, 'name': 'Sofia Gold',       'pct_profit': 0.072, 'sum_profit': 3600.15 },
            { 'user_id': 108, 'name': 'Omar FX',          'pct_profit': 0.061, 'sum_profit': 3050.40 },
            { 'user_id': 109, 'name': 'Hassan Indices',   'pct_profit': 0.055, 'sum_profit': 2750.90 },
            { 'user_id': 110, 'name': 'Nora Tech',        'pct_profit': 0.048, 'sum_profit': 2400.60 },
        ]

    return jsonify(results), 200