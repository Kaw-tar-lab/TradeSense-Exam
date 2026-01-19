from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from extensions import db, bcrypt
from models import User


users_bp = Blueprint('users', __name__)


@users_bp.post('/register')
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not all([name, email, password]):
        return jsonify({'error': 'Missing fields'}), 400

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(name=name, email=email, password=hashed)
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({'id': user.id, 'name': user.name, 'email': user.email}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Email already exists'}), 409


@users_bp.post('/login')
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not all([email, password]):
        return jsonify({'error': 'Missing credentials'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({'status': 'ok', 'user': {'id': user.id, 'name': user.name, 'email': user.email}}), 200