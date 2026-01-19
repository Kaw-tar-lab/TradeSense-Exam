from datetime import datetime
from flask import Blueprint, jsonify, request

from extensions import db
from models import LessonProgress, QuizResult


academy_bp = Blueprint('academy', __name__)


# Static catalog definition (can be moved to DB later)
CATALOG = {
    'levels': [
        {
            'id': 'beginner', 'title': 'Niveau Débutant', 'prerequisites': [], 'objectives': ['Bases du trading', 'Mindset'],
            'modules': [
                {
                    'id': 'b1', 'title': 'Bases du Marché',
                    'lessons': [
                        { 'id': 'b1-l1', 'title': 'Introduction au Marché Boursier', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'trading', 'objectives': ['Comprendre les échanges'], 'prerequisites': [] },
                        { 'id': 'b1-l2', 'title': 'Les Chandeliers Japonais (Bases)', 'video_url': 'https://www.youtube.com/embed/P0C7H_xVqj0', 'pdf_url': '', 'category': 'trading', 'objectives': ['Lire les bougies'], 'prerequisites': [] },
                        { 'id': 'b1-l3', 'title': 'Supports et Résistances', 'video_url': 'https://www.youtube.com/embed/4M3dM9d9w9g', 'pdf_url': '', 'category': 'trading', 'objectives': ['Zones clés'], 'prerequisites': [] },
                        { 'id': 'b1-l4', 'title': 'Les Tendances', 'video_url': 'https://www.youtube.com/embed/Yd778p9L58Q', 'pdf_url': '', 'category': 'trading', 'objectives': ['Haut/Bas/Range'], 'prerequisites': [] },
                        { 'id': 'b1-l5', 'title': 'Introduction aux Courtiers', 'video_url': 'https://www.youtube.com/embed/8R4m_wV2F0Y', 'pdf_url': '', 'category': 'trading', 'objectives': ['Choisir son broker'], 'prerequisites': [] },
                    ]
                },
                {
                    'id': 'b2', 'title': 'Psychologie & Outils',
                    'lessons': [
                        { 'id': 'b2-l1', 'title': 'Le Mindset du Trader Succès', 'video_url': 'https://www.youtube.com/embed/GFE8yqPAPrM', 'pdf_url': '', 'category': 'trading', 'objectives': ['État d’esprit'], 'prerequisites': [] },
                        { 'id': 'b2-l2', 'title': 'Introduction au TradingView', 'video_url': 'https://www.youtube.com/embed/OQ06d6C_R54', 'pdf_url': '', 'category': 'trading', 'objectives': ['Outils d’analyse'], 'prerequisites': [] },
                        { 'id': 'b2-l3', 'title': 'Les Types d’Ordres', 'video_url': 'https://www.youtube.com/embed/wlBhEk0J0DA', 'pdf_url': '', 'category': 'trading', 'objectives': ['Market vs Limit'], 'prerequisites': [] },
                        { 'id': 'b2-l4', 'title': 'Glossaire du Trading', 'video_url': 'https://www.youtube.com/embed/7t-W1YrWuo0', 'pdf_url': '', 'category': 'trading', 'objectives': ['Vocabulaire'], 'prerequisites': [] },
                        { 'id': 'b2-l5', 'title': 'Premier Trade en Demo', 'video_url': 'https://www.youtube.com/embed/s-0EZOC5D44', 'pdf_url': '', 'category': 'trading', 'objectives': ['Pratique sans risque'], 'prerequisites': [] },
                    ]
                }
            ]
        },
        {
            'id': 'intermediate', 'title': 'Niveau Intermédiaire', 'prerequisites': ['beginner'], 'objectives': ['Indicateurs', 'Analyse Technique'],
            'modules': [
                {
                    'id': 'i1', 'title': 'Analyse Technique Avancée',
                    'lessons': [
                        { 'id': 'i1-l1', 'title': 'Les Moyennes Mobiles (SMA, EMA)', 'video_url': 'https://www.youtube.com/embed/u0nEwF2W198', 'pdf_url': '', 'category': 'technique', 'objectives': ['Lissage des prix'], 'prerequisites': [] },
                        { 'id': 'i1-l2', 'title': 'Le RSI : Divergences et Momentum', 'video_url': 'https://www.youtube.com/embed/L1mCRybS4Lg', 'pdf_url': '', 'category': 'technique', 'objectives': ['Surachat/Survente'], 'prerequisites': [] },
                        { 'id': 'i1-l3', 'title': 'Bandes de Bollinger et Volatilité', 'video_url': 'https://www.youtube.com/embed/4M3dM9d9w9g', 'pdf_url': '', 'category': 'technique', 'objectives': ['Amplitude des prix'], 'prerequisites': [] },
                        { 'id': 'i1-l4', 'title': 'Fibonacci : Retracements Clés', 'video_url': 'https://www.youtube.com/embed/a7w8jQ8q1fE', 'pdf_url': '', 'category': 'technique', 'objectives': ['Niveaux de correction'], 'prerequisites': [] },
                        { 'id': 'i1-l5', 'title': 'Patterns de Retournement (W, M)', 'video_url': 'https://www.youtube.com/embed/Qj_6z5F_GkE', 'pdf_url': '', 'category': 'technique', 'objectives': ['Double Top/Bottom'], 'prerequisites': [] },
                    ]
                },
                {
                    'id': 'i2', 'title': 'Analyse Fondamentale & Stratégies',
                    'lessons': [
                        { 'id': 'i2-l1', 'title': 'Calendrier Économique (CPI, NFP)', 'video_url': 'https://www.youtube.com/embed/t1_u2v3w4x5', 'pdf_url': '', 'category': 'fondamentale', 'objectives': ['Impact des annonces'], 'prerequisites': [] },
                        { 'id': 'i2-l2', 'title': 'Corrélation entre Devises (Forex)', 'video_url': 'https://www.youtube.com/embed/AJgpF3XHIMs', 'pdf_url': '', 'category': 'fondamentale', 'objectives': ['Paires liées'], 'prerequisites': [] },
                        { 'id': 'i2-l3', 'title': 'Corrélation Indices et Matières Premières', 'video_url': 'https://www.youtube.com/embed/uV84kDLUgZ4', 'pdf_url': '', 'category': 'fondamentale', 'objectives': ['Macro-finance'], 'prerequisites': [] },
                        { 'id': 'i2-l4', 'title': 'Introduction au Scalping', 'video_url': 'https://www.youtube.com/embed/uyXeL8X6fK0', 'pdf_url': '', 'category': 'trading', 'objectives': ['Trades ultra-courts'], 'prerequisites': [] },
                        { 'id': 'i2-l5', 'title': 'Introduction au Swing Trading', 'video_url': 'https://www.youtube.com/embed/7YGKLzRVyU4', 'pdf_url': '', 'category': 'trading', 'objectives': ['Trades sur plusieurs jours'], 'prerequisites': [] },
                    ]
                }
            ]
        },
        {
            'id': 'advanced', 'title': 'Niveau Avancé', 'prerequisites': ['intermediate'], 'objectives': ['Stratégies Complexes', 'Algo Trading'],
            'modules': [
                {
                    'id': 'a1', 'title': 'Stratégies Institutionnelles',
                    'lessons': [
                        { 'id': 'a1-l1', 'title': 'Order Block & Smart Money', 'video_url': 'https://www.youtube.com/embed/L4jK8Z4h5V0', 'pdf_url': '', 'category': 'trading', 'objectives': ['Traces des banques'], 'prerequisites': [] },
                        { 'id': 'a1-l2', 'title': 'Liquidité et Chasse aux Stops', 'video_url': 'https://www.youtube.com/embed/v2_t3rF9oGk', 'pdf_url': '', 'category': 'trading', 'objectives': ['Manipulation des prix'], 'prerequisites': [] },
                        { 'id': 'a1-l3', 'title': 'Wyckoff Theory', 'video_url': 'https://www.youtube.com/embed/JOWAFc5Ghy8', 'pdf_url': '', 'category': 'trading', 'objectives': ['Accumulation/Distribution'], 'prerequisites': [] },
                        { 'id': 'a1-l4', 'title': 'Elliott Waves : Bases', 'video_url': 'https://www.youtube.com/embed/aG3m0Y9K7S0', 'pdf_url': '', 'category': 'trading', 'objectives': ['Cycles de prix'], 'prerequisites': [] },
                        { 'id': 'a1-l5', 'title': 'Hedging : Couvrir ses Positions', 'video_url': 'https://www.youtube.com/embed/uyXeL8X6fK0', 'pdf_url': '', 'category': 'trading', 'objectives': ['Assurance de capital'], 'prerequisites': [] },
                    ]
                },
                {
                    'id': 'a2', 'title': 'IA et Automation',
                    'lessons': [
                        { 'id': 'a2-l1', 'title': 'Architecture d’un Algo de Trading', 'video_url': 'https://www.youtube.com/embed/Qj_6z5F_GkE', 'pdf_url': '', 'category': 'technique', 'objectives': ['Logique de programmation'], 'prerequisites': [] },
                        { 'id': 'a2-l2', 'title': 'Backtesting Rigoureux', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'technique', 'objectives': ['Valider sa stratégie'], 'prerequisites': [] },
                        { 'id': 'a2-l3', 'title': 'Utilisation des Signaux IA', 'video_url': 'https://www.youtube.com/embed/AJgpF3XHIMs', 'pdf_url': '', 'category': 'technique', 'objectives': ['Assistant IA'], 'prerequisites': [] },
                        { 'id': 'a2-l4', 'title': 'Introduction au Trading Automatisé', 'video_url': 'https://www.youtube.com/embed/UWKNLR4jOI0', 'pdf_url': '', 'category': 'technique', 'objectives': ['Bots de trading'], 'prerequisites': [] },
                        { 'id': 'a2-l5', 'title': 'Psychologie de la Haute Fréquence', 'video_url': 'https://www.youtube.com/embed/uyXeL8X6fK0', 'pdf_url': '', 'category': 'technique', 'objectives': ['Vitesse et stress'], 'prerequisites': [] },
                    ]
                }
            ]
        },
        {
            'id': 'risk', 'title': 'Risk Management', 'prerequisites': [], 'objectives': ['Protection Capital', 'Gestion Drawdown'],
            'modules': [
                {
                    'id': 'r1', 'title': 'Protection du Capital',
                    'lessons': [
                        { 'id': 'r1-l1', 'title': 'La Règle des 1%', 'video_url': 'https://www.youtube.com/embed/R9_S0T1U2V3', 'pdf_url': '', 'category': 'risque', 'objectives': ['Survie à long terme'], 'prerequisites': [] },
                        { 'id': 'r1-l2', 'title': 'Calcul du Lot et Levier', 'video_url': 'https://www.youtube.com/embed/ZfS0wJ3c4X5', 'pdf_url': '', 'category': 'risque', 'objectives': ['Sizing correct'], 'prerequisites': [] },
                        { 'id': 'r1-l3', 'title': 'Risk Reward Ratio (RR)', 'video_url': 'https://www.youtube.com/embed/QZZOsEGFksU', 'pdf_url': '', 'category': 'risque', 'objectives': ['Rentabilité'], 'prerequisites': [] },
                        { 'id': 'r1-l4', 'title': 'Breakeven et Trail Stop', 'video_url': 'https://www.youtube.com/embed/m9_b0c8d7eF', 'pdf_url': '', 'category': 'risque', 'objectives': ['Sécuriser les profits'], 'prerequisites': [] },
                        { 'id': 'r1-l5', 'title': 'Gestion du Drawdown', 'video_url': 'https://www.youtube.com/embed/4M3dM9d9w9g', 'pdf_url': '', 'category': 'risque', 'objectives': ['Récupération après perte'], 'prerequisites': [] },
                    ]
                },
                {
                    'id': 'r2', 'title': 'Psychologie & Discipline',
                    'lessons': [
                        { 'id': 'r2-l1', 'title': 'L’Overtrading : Le Tueur de Compte', 'video_url': 'https://www.youtube.com/embed/GFE8yqPAPrM', 'pdf_url': '', 'category': 'risque', 'objectives': ['Fréquence de trade'], 'prerequisites': [] },
                        { 'id': 'r2-l2', 'title': 'Revenge Trading et Discipline', 'video_url': 'https://www.youtube.com/embed/uyXeL8X6fK0', 'pdf_url': '', 'category': 'risque', 'objectives': ['Gérer ses émotions'], 'prerequisites': [] },
                        { 'id': 'r2-l3', 'title': 'Journal de Trading', 'video_url': 'https://www.youtube.com/embed/wlBhEk0J0DA', 'pdf_url': '', 'category': 'risque', 'objectives': ['Analyse de fautes'], 'prerequisites': [] },
                        { 'id': 'r2-l4', 'title': 'Simulation de Pertes Consécutives', 'video_url': 'https://www.youtube.com/embed/uyXeL8X6fK0', 'pdf_url': '', 'category': 'risque', 'objectives': ['Préparation mentale'], 'prerequisites': [] },
                        { 'id': 'r2-l5', 'title': 'Plan de Trading : Structure Finale', 'video_url': 'https://www.youtube.com/embed/uyXeL8X6fK0', 'pdf_url': '', 'category': 'risque', 'objectives': ['Règles claires'], 'prerequisites': [] },
                    ]
                }
            ]
        },
        {
            'id': 'webinars', 'title': 'Live Webinars', 'prerequisites': [], 'objectives': ['Sessions Directes', 'Q&A'],
            'modules': [
                {
                    'id': 'w1', 'title': 'Sessions de Trading en Direct',
                    'lessons': [
                        { 'id': 'w1-l1', 'title': 'Ouverture de New York', 'video_url': 'https://www.youtube.com/embed/KcTvUXZOd2c', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Analyse en live'], 'prerequisites': [] },
                        { 'id': 'w1-l2', 'title': 'Clôture Européenne', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Debrief de session'], 'prerequisites': [] },
                        { 'id': 'w1-l3', 'title': 'Debriefing des Signaux', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Statistiques hebdo'], 'prerequisites': [] },
                        { 'id': 'w1-l4', 'title': 'Session Q&A : Vos Questions IA', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Réponses en direct'], 'prerequisites': [] },
                        { 'id': 'w1-l5', 'title': 'Masterclass Live : Crypto', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Analyse Altcoins'], 'prerequisites': [] },
                    ]
                },
                {
                    'id': 'w2', 'title': 'Spécialistes & Communauté',
                    'lessons': [
                        { 'id': 'w2-l1', 'title': 'Interview : Trader Pro', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Expérience réelle'], 'prerequisites': [] },
                        { 'id': 'w2-l2', 'title': 'Analyse de vos Trades', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Coaching de groupe'], 'prerequisites': [] },
                        { 'id': 'w2-l3', 'title': 'Préparation de la Semaine', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Plan hebdo'], 'prerequisites': [] },
                        { 'id': 'w2-l4', 'title': 'Live Scalping sur Indices', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Action rapide'], 'prerequisites': [] },
                        { 'id': 'w2-l5', 'title': 'Gestion du Stress en Direct', 'video_url': 'https://www.youtube.com/embed/p7HKvqRI_Bo', 'pdf_url': '', 'category': 'pratique', 'objectives': ['Psychologie live'], 'prerequisites': [] },
                    ]
                }
            ]
        }
    ]
}


@academy_bp.get('/academy/catalog')
def catalog():
    return jsonify(CATALOG), 200


@academy_bp.get('/academy/recommendations')
def recommendations():
    recs = []
    # Try to filter by level in the future, but for now just show available lessons
    user_id = int(request.args.get('user_id', '0') or 1)
    completed = set()
    try:
        rows = LessonProgress.query.filter_by(user_id=user_id, status='completed').all()
        completed = set(r.lesson_id for r in rows)
    except Exception as e:
        print(f"Error fetching progress for recommendations: {e}")

    for level in CATALOG['levels']:
        for module in level['modules']:
            for lesson in module['lessons']:
                if lesson['id'] not in completed:
                    recs.append({ 
                        'lesson_id': lesson['id'], 
                        'title': lesson['title'], 
                        'level': level['id'], 
                        'module': module['id'] 
                    })
    
    # Sort recommendations to prioritize current level if possible
    recs.sort(key=lambda x: 0 if x['level'] == 'beginner' else 1)

    # Fallback to catalog if no recommendations (e.g. everything completed)
    if not recs:
        for level in CATALOG['levels']:
            for module in level['modules']:
                for lesson in module['lessons']:
                    recs.append({ 
                        'lesson_id': lesson['id'], 
                        'title': lesson['title'], 
                        'level': level['id'], 
                        'module': module['id'] 
                    })

    return jsonify({ 'user_id': user_id, 'recommendations': recs[:10] }), 200


@academy_bp.get('/academy/webinars')
def webinars():
    now = datetime.utcnow().isoformat(timespec='minutes')
    items = [
        { 'id': 'w1', 'title': 'Live: Indicateurs et setups', 'lesson_id': 'w1-l1', 'start': now, 'duration_min': 60, 'host': 'Mentor George', 'chat': True },
        { 'id': 'w2', 'title': 'Macro & marchés africains', 'lesson_id': 'w1-l2', 'start': now, 'duration_min': 45, 'host': 'Mentor Julia', 'chat': True },
        { 'id': 'w3', 'title': 'Risk management avancé', 'lesson_id': 'w1-l3', 'start': now, 'duration_min': 50, 'host': 'Mentor Diana', 'chat': True },
    ]
    return jsonify(items), 200


@academy_bp.get('/academy/quizzes/<lesson_id>')
def quiz_for_lesson(lesson_id: str):
    # Static quiz; difficulty inferred by lesson level
    questions = [
        { 'id': 'q1', 'type': 'mcq', 'text': 'RSI mesure…', 'choices': ['momentum', 'volume', 'volatilité'], 'answer': 0 },
        { 'id': 'q2', 'type': 'mcq', 'text': 'Support est…', 'choices': ['niveau de demande', 'niveau d’offre', 'aucune'], 'answer': 0 },
        { 'id': 'q3', 'type': 'mcq', 'text': 'Drawdown exprime…', 'choices': ['baisse du capital', 'hausse du capital', 'rendement'], 'answer': 0 },
    ]
    return jsonify({ 'lesson_id': lesson_id, 'questions': questions }), 200


@academy_bp.post('/academy/quizzes/<lesson_id>/submit')
def submit_quiz(lesson_id: str):
    data = request.get_json() or {}
    user_id = int(data.get('user_id', 0))
    answers = data.get('answers') or {}
    total = len(answers)
    correct = int(sum(1 for k, v in answers.items() if str(k).startswith('q') and int(v) == 0))
    diff = 'beginner' if lesson_id.startswith('b') else 'intermediate' if lesson_id.startswith('i') else 'advanced'

    result = QuizResult(user_id=user_id, lesson_id=lesson_id, total_questions=total, correct=correct, difficulty=diff)
    db.session.add(result)
    # Update progress
    prog = LessonProgress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not prog:
        prog = LessonProgress(user_id=user_id, lesson_id=lesson_id, status='started', score=0.0)
        db.session.add(prog)
    prog.status = 'completed' if correct >= max(1, total - 1) else 'started'
    prog.score = (correct / max(1, total)) * 100.0
    db.session.commit()

    return jsonify({ 'status': 'ok', 'correct': correct, 'total': total, 'score': prog.score }), 200


@academy_bp.get('/academy/progress')
def get_progress():
    user_id = int(request.args.get('user_id', '0') or 0)
    rows = LessonProgress.query.filter_by(user_id=user_id).all()
    return jsonify([{ 'lesson_id': r.lesson_id, 'status': r.status, 'score': r.score, 'updated_at': r.updated_at.isoformat() } for r in rows]), 200


@academy_bp.post('/academy/progress')
def set_progress():
    data = request.get_json() or {}
    user_id = int(data.get('user_id', 0))
    lesson_id = data.get('lesson_id')
    status = data.get('status', 'started')
    score = float(data.get('score', 0.0))
    if not user_id or not lesson_id:
        return jsonify({'error': 'user_id and lesson_id required'}), 400
    prog = LessonProgress.query.filter_by(user_id=user_id, lesson_id=lesson_id).first()
    if not prog:
        prog = LessonProgress(user_id=user_id, lesson_id=lesson_id, status=status, score=score)
        db.session.add(prog)
    else:
        prog.status = status
        prog.score = score
        prog.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'status': 'ok'}), 200


@academy_bp.get('/academy/gamification')
def gamification():
    user_id = int(request.args.get('user_id', '0') or 0)
    rows = LessonProgress.query.filter_by(user_id=user_id, status='completed').all()
    completed_count = len(rows)
    xp = completed_count * 25
    level = 'Bronze' if xp < 100 else 'Silver' if xp < 250 else 'Gold'
    badges = []
    if completed_count >= 1:
        badges.append('Starter')
    if completed_count >= 5:
        badges.append('Learner')
    if completed_count >= 10:
        badges.append('Pro')
    return jsonify({ 'user_id': user_id, 'xp': xp, 'level': level, 'badges': badges, 'completed': completed_count }), 200