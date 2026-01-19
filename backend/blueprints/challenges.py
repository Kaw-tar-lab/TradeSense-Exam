from datetime import datetime
from flask import Blueprint, request, jsonify, current_app

from extensions import db
from models import Challenge, Trade
from services.tasks import evaluate_async


challenges_bp = Blueprint('challenges', __name__)


@challenges_bp.post('/start')
def start_challenge():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    starting = float(data.get('starting_balance', 5000.0))
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400
    ch = Challenge(user_id=user_id, starting_balance=starting, status='active')
    db.session.add(ch)
    db.session.commit()
    return jsonify({'id': ch.id, 'user_id': ch.user_id, 'starting_balance': ch.starting_balance, 'status': ch.status}), 201


@challenges_bp.post('/<int:challenge_id>/trade')
def execute_trade(challenge_id: int):
    data = request.get_json() or {}
    ticker = data.get('ticker')
    quantity = int(data.get('quantity', 0))
    price = float(data.get('price', 0))
    side = (data.get('side') or '').lower()

    if not all([ticker, quantity > 0, price > 0, side in ['buy', 'sell']]):
        return jsonify({'error': 'Invalid trade payload'}), 400

    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    if challenge.status != 'active':
        return jsonify({'error': f'Challenge status is {challenge.status}'}), 400

    profit = 0.0
    if side == 'sell':
        # Compute profit against average buy price in this challenge for this ticker
        buys = Trade.query.filter_by(challenge_id=challenge_id, ticker=ticker, side='buy').all()
        total_qty = sum(b.quantity for b in buys)
        total_cost = sum(b.quantity * b.price for b in buys)
        avg_buy = (total_cost / total_qty) if total_qty > 0 else price
        profit = (price - avg_buy) * quantity

    trade = Trade(challenge_id=challenge_id, ticker=ticker, quantity=quantity, price=price, side=side, profit=profit)
    db.session.add(trade)
    db.session.commit()

    # Evaluate rules asynchronously with app context
    evaluate_async(current_app._get_current_object(), challenge_id)

    return jsonify({
        'id': trade.id,
        'challenge_id': trade.challenge_id,
        'ticker': trade.ticker,
        'quantity': trade.quantity,
        'price': trade.price,
        'side': trade.side,
        'profit': trade.profit,
        'timestamp': trade.timestamp.isoformat()
    }), 201


@challenges_bp.get('/<int:challenge_id>/status')
def challenge_status(challenge_id: int):
    ch = Challenge.query.get(challenge_id)
    if not ch:
        return jsonify({'error': 'Challenge not found'}), 404
    return jsonify({'id': ch.id, 'user_id': ch.user_id, 'status': ch.status, 'starting_balance': ch.starting_balance, 'created_at': ch.created_at.isoformat()}), 200