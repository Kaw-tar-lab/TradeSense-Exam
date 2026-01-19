import os
import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify

from extensions import db, bcrypt
from models import User, Challenge, Trade


admin_bp = Blueprint('admin', __name__)


def _random_price(ticker: str) -> float:
    base = {
        'AAPL': 190.0, 'TSLA': 250.0, 'AMZN': 150.0, 'MSFT': 410.0,
        'NVDA': 500.0, 'SPY': 500.0, 'BTC-USD': 45000.0, 'ETH-USD': 2400.0
    }.get(ticker, 100.0)
    return round(base * (0.9 + random.random() * 0.2), 2)


@admin_bp.post('/admin/seed')
def seed_realistic_data():
    token = request.headers.get('X-Seed-Token') or (request.headers.get('Authorization') or '').replace('Bearer ', '')
    expected = os.getenv('SEED_TOKEN', 'dev-seed-token')
    if not token or token != expected:
        return jsonify({'error': 'Unauthorized'}), 401

    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    # Check for users instead of just trades to be more logical
    existing_users = User.query.count()
    if existing_users >= 5 and request.args.get('force') not in ('1', 'true', 'yes'):
        return jsonify({'status': 'skipped', 'reason': 'database already populated', 'user_count': existing_users}), 409

    names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia']
    tickers = ['AAPL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'SPY', 'BTC-USD', 'ETH-USD']

    users_created = 0
    challenges_created = 0
    trades_created = 0

    # Optimization: Hash once reuse for seeding
    common_password = bcrypt.generate_password_hash('secret123').decode('utf-8')

    for name in names:
        email = f"{name.lower()}@example.com"
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(name=name, email=email, password=common_password, balance=5000.0)
            db.session.add(user)
            db.session.flush()
            users_created += 1

        # Ensure a challenge exists for this month
        challenge = Challenge.query.filter_by(user_id=user.id).order_by(Challenge.created_at.desc()).first()
        if not challenge:
            challenge = Challenge(user_id=user.id, starting_balance=5000.0, status='active')
            db.session.add(challenge)
            db.session.flush()
            challenges_created += 1

        # Create realistic trades for current month
        num_trades = random.randint(10, 18)
        for _ in range(num_trades):
            tkr = random.choice(tickers)
            qty = random.randint(1, 5)
            price = _random_price(tkr)
            side = random.choice(['buy', 'sell'])

            # Spread timestamps over current month
            delta_days = random.randint(0, (now - month_start).days or 1)
            delta_secs = random.randint(0, 86399)
            ts = month_start + timedelta(days=delta_days, seconds=delta_secs)

            # Assign profit so leaderboard has signal; allow small losses too
            profit = round(random.uniform(-75.0, 220.0), 2)

            trade = Trade(
                challenge_id=challenge.id,
                ticker=tkr,
                quantity=qty,
                price=price,
                side=side,
                timestamp=ts,
                profit=profit,
            )
            db.session.add(trade)
            trades_created += 1

    db.session.commit()

    return jsonify({
        'status': 'ok',
        'users_created': users_created,
        'challenges_created': challenges_created,
        'trades_created': trades_created,
    }), 201


@admin_bp.get('/admin/users')
def get_all_users():
    users = User.query.all()
    output = []
    for user in users:
        # Get latest challenge
        challenge = Challenge.query.filter_by(user_id=user.id).order_by(Challenge.created_at.desc()).first()
        output.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'balance': user.balance,
            'challenge': {
                'id': challenge.id,
                'status': challenge.status,
                'starting_balance': challenge.starting_balance
            } if challenge else None
        })
    return jsonify(output), 200


@admin_bp.post('/admin/challenge/<int:challenge_id>/status')
def update_challenge_status(challenge_id: int):
    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ('active', 'failed', 'funded', 'passed'):
        return jsonify({'error': 'Invalid status'}), 400

    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404

    challenge.status = new_status
    db.session.commit()
    return jsonify({'status': 'ok', 'new_status': challenge.status}), 200