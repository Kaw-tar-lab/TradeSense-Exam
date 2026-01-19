from flask import Blueprint, jsonify

from services.risk_alerts import compute_risk_alerts


risk_alerts_bp = Blueprint('risk_alerts', __name__)


@risk_alerts_bp.get('/risk-alerts/<int:challenge_id>')
def get_risk_alerts(challenge_id: int):
    try:
        alert = compute_risk_alerts(challenge_id)
        # Always return 200 with warning-only payload as per constraints
        return jsonify(alert), 200
    except Exception as e:
        return jsonify({
            'level': 'NONE',
            'message': 'Erreur interne lors du calcul des alertes',
            'metric': 'Risk',
            'current': '0.0%',
            'error': str(e)[:200]
        }), 200