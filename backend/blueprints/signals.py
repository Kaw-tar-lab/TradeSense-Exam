from flask import Blueprint, jsonify

from services.signals import generate_signal


signals_bp = Blueprint('signals', __name__)


@signals_bp.get('/signals/<ticker>')
def get_signal_route(ticker: str):
    try:
        data = generate_signal(ticker)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({
            'ticker': ticker.upper(),
            'signal': 'STOP',
            'confidence': 0.5,
            'reason': 'Internal error generating signal',
            'error': str(e)[:200]
        }), 500