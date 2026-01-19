from flask import Blueprint, request, jsonify

from services.trade_validation import validate_trade


trade_validation_bp = Blueprint('trade_validation', __name__)


@trade_validation_bp.post('/trade/validate')
def trade_validate():
    try:
        data = request.get_json() or {}
        result = validate_trade(data)
        # Always 200: decision is advisory (pre-execution) and fast
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'approved': False,
            'reason': 'Internal error during validation',
            'suggested_quantity': 0.0,
            'error': str(e)[:200]
        }), 200