from datetime import datetime
from typing import List, Dict

import requests
from flask import Blueprint, jsonify

from services.data import get_recent_closes


news_bp = Blueprint('news', __name__)


def _parse_rss(url: str, source_name: str, limit: int = 10) -> List[Dict]:
    try:
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        text = resp.text
        # Very light RSS parsing without external dependencies
        items: List[Dict] = []
        # Split by <item> tags
        chunks = text.split('<item')
        for chunk in chunks[1:]:
            # Extract fields by naive tag search
            def _extract(tag: str) -> str:
                start = chunk.find(f'<{tag}>')
                end = chunk.find(f'</{tag}>')
                if start != -1 and end != -1:
                    return chunk[start + len(tag) + 2:end].strip()
                return ''

            title = _extract('title')
            link = _extract('link')
            pub = _extract('pubDate') or _extract('published') or _extract('dc:date')
            desc = _extract('description')
            # Normalize published_at
            try:
                published_at = datetime.strptime(pub[:25], '%a, %d %b %Y %H:%M:%S').isoformat(timespec='minutes') if pub else datetime.utcnow().isoformat(timespec='minutes')
            except Exception:
                try:
                    published_at = datetime.fromisoformat(pub).isoformat(timespec='minutes')
                except Exception:
                    published_at = datetime.utcnow().isoformat(timespec='minutes')

            if title:
                items.append({
                    'title': title,
                    'source': source_name,
                    'published_at': published_at,
                    'summary': desc[:280] if desc else '',
                    'url': link or ''
                })
            if len(items) >= limit:
                break
        return items
    except Exception:
        return []


def _fetch_live_news() -> List[Dict]:
    sources = [
        ('https://feeds.reuters.com/reuters/businessNews', 'Reuters'),
        ('https://feeds.reuters.com/reuters/worldNews', 'Reuters'),
        ('https://www.investing.com/rss/news_25.rss', 'Investing'),
    ]
    all_items: List[Dict] = []
    for url, name in sources:
        items = _parse_rss(url, name, limit=10)
        all_items.extend(items)
    # Fallback mock if empty
    if not all_items:
        now = datetime.utcnow().isoformat(timespec='minutes')
        all_items = [
            {
                'title': 'CPI Inflation data exceeds expectations; markets volatile',
                'source': 'MockNews',
                'published_at': now,
                'summary': 'Consumer price index rose 0.4% last month, higher than predicted.',
                'url': ''
            },
            {
                'title': 'FOMC meeting minutes hint at higher-for-longer rates',
                'source': 'MockNews',
                'published_at': now,
                'summary': 'Fed officials expressed concerns over persistent inflation.',
                'url': ''
            },
            {
                'title': 'Bitcoin spikes on institutional ETF inflows',
                'source': 'MockNews',
                'published_at': now,
                'summary': 'Crypto market sees strong demand; volatility elevated.',
                'url': ''
            },
            {
                'title': 'Morocco Telecom (IAM) reports strong Q3 growth',
                'source': 'TradeSense Local',
                'published_at': now,
                'summary': 'Expansion in sub-Saharan Africa drives revenue increases.',
                'url': ''
            },
            {
                'title': 'Global supply chain shifts impact tech sector',
                'source': 'MockNews',
                'published_at': now,
                'summary': 'Semiconductor demand remains robust despite geopolitical shifts.',
                'url': ''
            },
        ]
    return all_items[:25]


def _simple_sentiment_from_titles(titles: List[str]) -> str:
    score = 0
    pos = ['rally', 'cooling', 'beat', 'growth', 'record', 'advance', 'rise', 'surge']
    neg = ['fall', 'drop', 'selloff', 'concern', 'inflation', 'war', 'risk', 'decline']
    for t in titles:
        low = t.lower()
        score += sum(1 for k in pos if k in low)
        score -= sum(1 for k in neg if k in low)
    if score > 1:
        return 'Bullish'
    if score < -1:
        return 'Bearish'
    return 'Neutral'


@news_bp.route('/news/live', methods=['GET'])
def news_live():
    print('News live endpoint called')
    items = _fetch_live_news()
    return jsonify(items), 200


@news_bp.route('/news/summary', methods=['GET'])
def news_summary():
    print('News summary endpoint called')
    items = _fetch_live_news()
    titles = [i.get('title', '') for i in items]
    sentiment = _simple_sentiment_from_titles(titles)
    if sentiment == 'Bullish':
        sentence = "Les marchés sont soutenus par des signaux positifs et la tech."
    elif sentiment == 'Bearish':
        sentence = "Les marchés montrent des signes de faiblesse, prudence sur le risque."
    else:
        sentence = "Les marchés restent mitigés, aucun biais clair à court terme."
    return jsonify({
        'market_sentiment': sentiment,
        'summary': sentence
    }), 200


@news_bp.route('/news/alerts', methods=['GET'])
def news_alerts():
    print('News alerts endpoint called')
    items = _fetch_live_news()
    titles = ' '.join(i.get('title', '') for i in items).lower()
    alerts: List[Dict] = []

    econ_keywords = [
        ('cpi', 'HIGH', 'CPI Report Released'),
        ('fomc', 'HIGH', 'FOMC Interest Rate Decision'),
        ('rate', 'MEDIUM', 'Interest Rate Commentary'),
        ('central bank', 'MEDIUM', 'Central Bank Statement'),
        ('inflation', 'MEDIUM', 'Inflation Data'),
    ]
    for kw, level, event in econ_keywords:
        if kw in titles:
            alerts.append({
                'level': level,
                'event': event,
                'impact': 'Potential high volatility on USD and crypto markets' if level == 'HIGH' else 'Market impact likely; consider risk management'
            })

    # Volatility check using recent closes
    def _vol(values) -> float:
        try:
            returns = []
            for i in range(1, len(values)):
                prev, cur = float(values[i-1]), float(values[i])
                if prev > 0:
                    returns.append((cur - prev) / prev)
            if not returns:
                return 0.0
            mean = sum(returns) / len(returns)
            var = sum((r - mean) ** 2 for r in returns) / max(1, len(returns) - 1)
            return var ** 0.5
        except Exception:
            return 0.0

    btc_closes = get_recent_closes('BTC-USD', limit=30) or []
    spy_closes = get_recent_closes('SPY', limit=30) or []
    btc_vol = _vol(btc_closes)
    spy_vol = _vol(spy_closes)

    if btc_vol >= 0.05:  # ~5% std
        alerts.append({
            'level': 'HIGH',
            'event': 'BTC High Volatility',
            'impact': 'Elevated crypto volatility; widen stops or reduce size'
        })
    elif btc_vol >= 0.03:
        alerts.append({
            'level': 'MEDIUM',
            'event': 'BTC Elevated Volatility',
            'impact': 'Crypto volatility elevated; caution advised'
        })

    if spy_vol >= 0.02:  # ~2% std
        alerts.append({
            'level': 'MEDIUM',
            'event': 'Equity Index Volatility',
            'impact': 'Equity volatility rising; possible wider intraday swings'
        })

    if not alerts:
        alerts.append({
            'level': 'LOW',
            'event': 'No major alerts',
            'impact': 'No significant economic or volatility events detected'
        })

    return jsonify(alerts), 200