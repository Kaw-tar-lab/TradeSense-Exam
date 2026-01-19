import os
import threading
from datetime import datetime
import dotenv

dotenv.load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS

from extensions import db, bcrypt
from models import User, Challenge, Trade, Payment
from blueprints.users import users_bp
from blueprints.challenges import challenges_bp
from blueprints.payments import payments_bp
from blueprints.dashboard import dashboard_bp
from blueprints.leaderboard import leaderboard_bp
from blueprints.signals import signals_bp
from blueprints.trade_plan import trade_plan_bp
from blueprints.risk_alerts import risk_alerts_bp
from blueprints.trade_validation import trade_validation_bp
from blueprints.ai_assistant import ai_assistant_bp
from blueprints.news import news_bp
from blueprints.admin import admin_bp
from blueprints.academy import academy_bp


def create_app():
    app = Flask(__name__)

    # MySQL Database Configuration
    database_url = os.getenv('DATABASE_URL')
    if database_url and database_url.startswith('mysql'):
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Fallback to SQLite for development
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tradesense.db'
    
    # Additional MySQL configurations
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'echo': False  # Set to True for SQL debugging
    }
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(challenges_bp, url_prefix='/api/challenges')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(leaderboard_bp, url_prefix='/api')
    app.register_blueprint(signals_bp, url_prefix='/api')
    app.register_blueprint(trade_plan_bp, url_prefix='/api')
    app.register_blueprint(risk_alerts_bp, url_prefix='/api')
    app.register_blueprint(trade_validation_bp, url_prefix='/api')
    app.register_blueprint(ai_assistant_bp, url_prefix='/api')
    app.register_blueprint(news_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(academy_bp, url_prefix='/api')

    @app.route('/api/health')
    def health():
        return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()}), 200

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)