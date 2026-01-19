from datetime import datetime
from flask import Blueprint, jsonify

from services.data import get_price
from services.signals import generate_signal


dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.get('/price/<string:ticker>')
def price(ticker: str):
    price = get_price(ticker)
    return jsonify({'ticker': ticker.upper(), 'price': price, 'time': datetime.utcnow().isoformat()}), 200


@dashboard_bp.get('/signals/<string:ticker>')
def signals(ticker: str):
    payload = generate_signal(ticker)
    return jsonify(payload), 200