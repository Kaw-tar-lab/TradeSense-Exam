import json
import os
import tempfile

from backend.app import create_app
from backend.extensions import db


def setup_app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.drop_all()
        db.create_all()
    return app


def test_endpoints():
    app = setup_app()
    client = app.test_client()

    # Register user
    r = client.post('/api/users/register', json={'name': 'Alice', 'email': 'alice@example.com', 'password': 'secret'})
    assert r.status_code == 201
    user_id = r.get_json()['id']

    # Login
    r = client.post('/api/users/login', json={'email': 'alice@example.com', 'password': 'secret'})
    assert r.status_code == 200

    # Start challenge
    r = client.post('/api/challenges/start', json={'user_id': user_id})
    assert r.status_code == 201
    challenge_id = r.get_json()['id']

    # Execute trade (buy)
    r = client.post(f'/api/challenges/{challenge_id}/trade', json={'ticker': 'AAPL', 'quantity': 1, 'price': 100, 'side': 'buy'})
    assert r.status_code == 201

    # Execute trade (sell) to realize profit
    r = client.post(f'/api/challenges/{challenge_id}/trade', json={'ticker': 'AAPL', 'quantity': 1, 'price': 110, 'side': 'sell'})
    assert r.status_code == 201

    # Status
    r = client.get(f'/api/challenges/{challenge_id}/status')
    assert r.status_code == 200

    # Payment
    r = client.post('/api/payments/checkout', json={'user_id': user_id, 'plan': 'starter', 'method': 'cmi'})
    assert r.status_code == 201

    # Price and signals
    r = client.get('/api/price/AAPL')
    assert r.status_code == 200
    r = client.get('/api/signals/AAPL')
    assert r.status_code == 200

    # Leaderboard
    r = client.get('/api/leaderboard')
    assert r.status_code == 200