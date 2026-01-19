from flask import Blueprint, jsonify, request

from services.trade_plan import compute_trade_plan


trade_plan_bp = Blueprint('trade_plan', __name__)


@trade_plan_bp.get('/trade-plan/<int:challenge_id>/<ticker>')
def get_trade_plan(challenge_id: int, ticker: str):
    try:
        plan = compute_trade_plan(challenge_id, ticker)
        return jsonify(plan), 200
    except Exception as e:
        return jsonify({
            'ticker': ticker.upper(),
            'error': 'Internal error generating trade plan',
            'detail': str(e)[:200]
        }), 500


@trade_plan_bp.get('/trade-plan/<int:challenge_id>/batch')
def get_trade_plan_batch(challenge_id: int):
    tickers_param = (request.args.get('tickers') or '').strip()
    if not tickers_param:
        return jsonify({'error': 'tickers query param required, e.g., ?tickers=AAPL,BTC-USD'}), 400
    tickers = [t.strip() for t in tickers_param.split(',') if t.strip()]
    if not tickers:
        return jsonify({'error': 'no valid tickers provided'}), 400
    plans = []
    for t in tickers:
        try:
            p = compute_trade_plan(challenge_id, t)
            # Compute simple risk-reward ratio for ranking
            entry = p.get('entry') or 0.0
            sl = p.get('stop_loss') or 0.0
            tp = p.get('take_profit') or 0.0
            rr = 0.0
            if entry and sl and tp and entry > 0:
                risk = abs(entry - sl)
                reward = abs(tp - entry)
                rr = (reward / risk) if risk > 0 else 0.0
            p['rr_ratio'] = round(rr, 3)
            plans.append(p)
        except Exception:
            continue
    if not plans:
        return jsonify({'error': 'could not compute any plans'}), 500
    sorted_plans = sorted(plans, key=lambda x: x.get('rr_ratio', 0.0), reverse=True)
    return jsonify({'best': sorted_plans[0], 'plans': sorted_plans}), 200