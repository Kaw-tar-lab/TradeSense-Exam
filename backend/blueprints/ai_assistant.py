from flask import Blueprint, jsonify

from services.signals import generate_signal
from services.trade_plan import compute_trade_plan
from services.risk_alerts import compute_risk_alerts
from services.trade_validation import validate_trade
from services.data import get_price


ai_assistant_bp = Blueprint('ai_assistant', __name__)


@ai_assistant_bp.get('/ai-assistant/<int:challenge_id>/<ticker>')
def ai_assistant(challenge_id: int, ticker: str):
    try:
        ticker_u = ticker.upper()

        # 1) Signal IA
        sig = generate_signal(ticker_u)
        signal = sig.get('signal', 'STOP')
        confidence = sig.get('confidence', 0.5)

        # 2) Plan de trade
        plan = compute_trade_plan(challenge_id, ticker_u)

        # 3) Alertes de risque
        risk = compute_risk_alerts(challenge_id)
        risk_alert = risk if risk.get('level') != 'NONE' else None

        # 4) Validation pré-exécution (heuristique rapide)
        # Choisir le sens à valider: prioriser le signal; sinon utiliser direction du plan
        side = 'BUY' if signal == 'BUY' else ('SELL' if signal == 'SELL' else ('BUY' if plan.get('direction') == 'LONG' else 'SELL'))

        # Prix de référence: entry du plan si disponible, sinon prix actuel
        price = plan.get('entry') or get_price(ticker_u) or 0.0

        # Quantité par défaut (simplifiée): petite taille pour validation rapide
        # Peut être affinée côté frontend selon l’instrument
        default_qty = 0.1 if '-' in ticker_u or 'USD' in ticker_u else 1.0

        if price and price > 0:
            val = validate_trade({
                'challenge_id': challenge_id,
                'ticker': ticker_u,
                'side': side,
                'quantity': default_qty,
                'price': price,
            })
        else:
            val = {
                'approved': False,
                'reason': 'Données marché indisponibles',
                'suggested_quantity': 0.0,
            }

        approved = bool(val.get('approved', False))

        # Politique d’autorisation globale: valider + pas de alerte de niveau élevé
        level = (risk or {}).get('level', 'NONE')
        trade_allowed = approved and (level in ('NONE', 'MEDIUM'))

        # Message assistant
        if trade_allowed:
            assistant_message = 'Conditions favorables, risque maîtrisé'
        else:
            if risk_alert:
                assistant_message = f"Risque élevé ({risk_alert.get('metric')}): {risk_alert.get('message')}"
            else:
                assistant_message = val.get('reason', 'Non approuvé')

        payload = {
            'signal': signal,
            'confidence': confidence,
            'trade_plan': plan,
            'risk_alert': risk_alert,
            'trade_allowed': trade_allowed,
            'assistant_message': assistant_message,
        }

        return jsonify(payload), 200
    except Exception as e:
        return jsonify({'error': 'Assistant aggregation failed', 'detail': str(e)[:200]}), 500