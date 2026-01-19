from flask import Blueprint, request, jsonify

from extensions import db
from models import Payment, Challenge


PLANS = {
    'starter': 200,
    'pro': 500,
    'elite': 1000,
}


payments_bp = Blueprint('payments', __name__)


@payments_bp.post('/checkout')
def checkout():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    plan = (data.get('plan') or '').lower()
    method = data.get('method', 'mock')  # cmi or crypto or paypal (future)
    if not user_id or plan not in PLANS:
        return jsonify({'error': 'Invalid payload'}), 400

    amount = PLANS[plan]
    payment = Payment(user_id=user_id, plan=plan, amount=amount, status='success')
    db.session.add(payment)
    db.session.commit()

    # Create an active challenge upon payment success
    ch = Challenge(user_id=user_id, starting_balance=5000.0, status='active')
    db.session.add(ch)
    db.session.commit()

    return jsonify({'status': 'success', 'payment_id': payment.id, 'challenge_id': ch.id}), 201


@payments_bp.post('/paypal/setup')
def paypal_setup():
    # Placeholder for SUPERADMIN configuration
    data = request.get_json() or {}
    return jsonify({'status': 'ok', 'message': 'PayPal integration placeholder configured', 'config': data}), 200