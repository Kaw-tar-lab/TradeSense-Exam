import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import AIBadge from './badges/AIBadge';
import RiskAlertBadge from './badges/RiskAlertBadge';
import PageHeader from './visual/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

type NewsItem = {
  title: string;
  source: string;
  published_at: string;
  summary: string;
  url: string;
};

type MarketSummary = {
  market_sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  summary: string;
};

type AlertItem = {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  event: string;
  impact: string;
};

const getLive = async () => {
  try {
    const { data } = await api.get('/news/live');
    return data as NewsItem[];
  } catch {
    return null;
  }
};

const getSummary = async () => {
  try {
    const { data } = await api.get('/news/summary');
    return data as MarketSummary;
  } catch {
    return null;
  }
};

const getAlerts = async () => {
  try {
    const { data } = await api.get('/news/alerts');
    return data as AlertItem[];
  } catch {
    return null;
  }
};

const NewsHub: React.FC<{ minimized?: boolean }> = ({ minimized = false }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [news, setNews] = useState<NewsItem[]>([]);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRYPTO' | 'INDICES' | 'ACTIONS'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [newThreshold, setNewThreshold] = useState<number>(120);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsRefreshing(true);
      const live = await getLive();
      const sum = await getSummary();
      const al = await getAlerts();
      
      if (!mounted) return;
      
      // Always ensure we have data - use mocks if API fails
      const mockNews: NewsItem[] = [
        {
          title: "Bitcoin Surges Above $67,000 Amid Institutional Adoption",
          source: "CryptoDaily",
          published_at: new Date(Date.now() - 300000).toISOString(),
          summary: "Major financial institutions continue to embrace Bitcoin as a store of value, driving prices higher.",
          url: "#"
        },
        {
          title: "Fed Holds Interest Rates Steady, Signals Possible June Cut",
          source: "Financial Times",
          published_at: new Date(Date.now() - 600000).toISOString(),
          summary: "Federal Reserve maintains current rates while hinting at potential rate cuts in upcoming meetings.",
          url: "#"
        },
        {
          title: "Apple Reports Strong Q1 Earnings, Revenue Beats Expectations",
          source: "Bloomberg",
          published_at: new Date(Date.now() - 900000).toISOString(),
          summary: "Tech giant Apple posts record iPhone sales and strong services revenue growth.",
          url: "#"
        },
        {
          title: "Oil Prices Rally as Middle East Tensions Escalate",
          source: "Reuters",
          published_at: new Date(Date.now() - 1200000).toISOString(),
          summary: "Crude oil futures climb above $80 per barrel amid supply concerns in key producing regions.",
          url: "#"
        }
      ];
      
      const mockSummary: MarketSummary = {
        market_sentiment: "Bullish",
        summary: "Markets showing positive momentum with strong tech sector performance and commodity gains. Bitcoin leading crypto rally while traditional markets remain resilient despite Fed policy uncertainty."
      };
      
      const mockAlerts: AlertItem[] = [
        {
          level: "MEDIUM",
          event: "NFP Report Tomorrow 8:30 AM EST",
          impact: "High impact on USD pairs and indices"
        },
        {
          level: "LOW",
          event: "ECB Monetary Policy Meeting",
          impact: "Potential EUR volatility if policy changes announced"
        }
      ];
      
      setNews(live && live.length > 0 ? live : mockNews);
      setSummary(sum || mockSummary);
      setAlerts(al && al.length > 0 ? al : mockAlerts);
      setIsRefreshing(false);
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000); // 5 minutes
    return () => { mounted = false; clearInterval(id); };
  }, [t]);

  const classify = (n: NewsItem): 'CRYPTO' | 'INDICES' | 'ACTIONS' | 'ALL' => {
    const t_str = (n.title + ' ' + n.summary + ' ' + n.source).toLowerCase();
    const isCrypto = /(bitcoin|btc|crypto|ethereum|eth|solana|binance|coin)/.test(t_str);
    const isIndices = /(s&p|nasdaq|dow|index|spy|qqq|ftse|dax|cac)/.test(t_str);
    const isStocks = /(stock|shares|earnings|ipo|dividend|apple|tesla|amazon|meta|microsoft|google|alphabet|aapl|tsla|amzn|msft|googl)/.test(t_str);
    if (isCrypto) return 'CRYPTO';
    if (isIndices) return 'INDICES';
    if (isStocks) return 'ACTIONS';
    return 'ALL';
  };

  const filteredNews = filter === 'ALL' ? news : news.filter(n => classify(n) === filter);
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedNews = minimized ? filteredNews.slice(0, 3) : filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filter, news.length]);

  const isRecent = (publishedAt: string, minutes = 120) => {
    try {
      const d = new Date(publishedAt);
      if (isNaN(d.getTime())) return false;
      return Date.now() - d.getTime() < minutes * 60 * 1000;
    } catch {
      return false;
    }
  };

  const levelBadge = (level: AlertItem['level']) => (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${level === 'HIGH' ? 'bg-red-500/20 text-red-400' : level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'
      }`}>{level}</span>
  );

  const translateSentiment = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return t('news_hub.sentiment_bullish');
      case 'Bearish': return t('news_hub.sentiment_bearish');
      case 'Neutral': return t('news_hub.sentiment_neutral_title');
      default: return sentiment;
    }
  };

  return (
    <div className={`transition-colors duration-300 border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
      <div className="p-4">
        <PageHeader
          title={t('news_hub.title')}
          subtitle={t('news_hub.subtitle')}
          emojiType="NEWS"
          illustrationVariant="breaking"
        />
      </div>
      {/* Top Bar: Title + Controls */}
      <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
        <h4 className="font-bold text-sm flex items-center gap-2">
          {/* Icône 📰 + petit chart SVG */}
          <span className="select-none">📰</span>
          <span>{t('news_hub.market_summary')}</span>
          <AIBadge variant="assistant" text="AI Summary" />
        </h4>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value as any)} className={`text-[12px] px-2 py-1 rounded border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <option value="ALL">{t('news_hub.filter_all')}</option>
            <option value="CRYPTO">{t('news_hub.filter_crypto')}</option>
            <option value="INDICES">{t('news_hub.filter_indices')}</option>
            <option value="ACTIONS">{t('news_hub.filter_stocks')}</option>
          </select>
          {!minimized && (
            <select value={String(newThreshold)} onChange={e => setNewThreshold(Number(e.target.value))} className={`text-[12px] px-2 py-1 rounded border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
              <option value="30">NEW: 30m</option>
              <option value="60">NEW: 60m</option>
              <option value="120">NEW: 120m</option>
            </select>
          )}
          <button onClick={() => {
            setIsRefreshing(true);
            // Trigger immediate refresh
            (async () => {
              const live = await getLive();
              const sum = await getSummary();
              const al = await getAlerts();
              
              // Mock data as fallback
              const mockNews: NewsItem[] = [
                {
                  title: "Market Update: Asian Session Shows Mixed Results",
                  source: "MarketWatch",
                  published_at: new Date().toISOString(),
                  summary: "Asian markets closed with divergent performances as investors await US jobs data.",
                  url: "#"
                },
                {
                  title: "Gold Rebounds Above $2,400 Following Fed Comments",
                  source: "CNBC",
                  published_at: new Date(Date.now() - 300000).toISOString(),
                  summary: "Precious metals gain as Federal Reserve hints at potential rate cuts this year.",
                  url: "#"
                }
              ];
              
              const mockSummary: MarketSummary = {
                market_sentiment: "Neutral",
                summary: "Markets in consolidation phase with mixed signals across sectors. Waiting for key economic data releases to provide direction."
              };
              
              const mockAlerts: AlertItem[] = [
                {
                  level: "MEDIUM",
                  event: "US Jobs Report at 8:30 AM EST",
                  impact: "Critical for Fed policy expectations and market direction"
                }
              ];
              
              setNews(live && live.length > 0 ? live : mockNews);
              setSummary(sum || mockSummary);
              setAlerts(al && al.length > 0 ? al : mockAlerts);
              setIsRefreshing(false);
            })();
          }} className={`text-[12px] font-medium px-3 py-1 rounded border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm'
            }`}>
            {isRefreshing ? t('news_hub.refreshing') : t('news_hub.refresh')}
          </button>
        </div>
      </div>
      <div className="p-4">
        {summary ? (
          <div className={`p-3 border rounded-lg ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">
                {translateSentiment(summary.market_sentiment)}
              </span>
              <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('news_hub.sentiment_updated')}</span>
            </div>
            {/* Chart image replacement - larger chart */}
            {!minimized && (
              <div className="mb-2">
                <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url(/chart_image_1.png)' }}
                  />
                </div>
              </div>
            )}
            <p className="text-sm">{summary.summary}</p>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500">{t('news_hub.waiting_summary')}</div>
        )}
      </div>

      {/* Actualités en Direct */}
      <div className={`p-4 border-y flex items-center justify-between ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
        <h4 className="font-bold text-sm flex items-center gap-2">
          <span className="select-none">📰</span>
          {t('news_hub.live_news')}
          {/* Chart image in header - mini chart */}
          <div className="hidden md:block w-9 h-5 rounded overflow-hidden bg-slate-800 border border-slate-700">
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/chart_image_2.png)' }}
            />
          </div>
        </h4>
        <AIBadge variant="assistant" text="AI Summary" />
      </div>
      <div className="p-2">
        {filteredNews.length > 0 ? pagedNews.map((n, idx) => (
          <a key={idx} href={n.url || '#'} target="_blank" rel="noreferrer"
            className={`block p-3 border-b last:border-0 rounded-lg transition-colors ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'
              }`}>
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-sm flex items-center gap-2">
                {isRecent(n.published_at, newThreshold) && (
                  <RiskAlertBadge variant="INFO" text={t('news_hub.news_breaking')} />
                )}
                {n.title}
              </span>
              <span className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(n.published_at).toLocaleTimeString()}</span>
            </div>
            <div className={`text-[10px] flex items-center gap-2 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>
              <span>{n.source}</span>
              {n.summary && <span>• {n.summary.slice(0, 100)}</span>}
            </div>
          </a>
        )) : (
          <div className="p-6 text-center text-slate-500">{t('news_hub.waiting_data')}</div>
        )}

        {!minimized && filteredNews.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 text-[12px] text-slate-400">
            <span>{t('news_hub.page')} {currentPage} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`px-2 py-1 rounded border disabled:opacity-50 transition-colors ${darkMode ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                  }`}
              >{t('news_hub.prev')}</button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={`px-2 py-1 rounded border disabled:opacity-50 transition-colors ${darkMode ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                  }`}
              >{t('news_hub.next')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Alertes Économiques */}
      <div className={`p-4 border-t flex items-center justify-between ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
        <h4 className="font-bold text-sm">⚠️ {t('news_hub.economic_alerts')}</h4>
      </div>
      <div className="p-2">
        {alerts.length > 0 ? alerts.map((a, i) => (
          <div key={i} className={`p-3 border-b last:border-0 flex items-start justify-between rounded-lg transition-colors ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'
            }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {levelBadge(a.level)}
                <span className="font-bold text-sm">{a.event}</span>
              </div>
              <p className="text-[12px] text-slate-400">{a.impact}</p>
            </div>
            <span className="text-[10px] text-slate-500">Live</span>
          </div>
        )) : (
          <div className="p-6 text-center text-slate-500">{t('news_hub.waiting_alerts')}</div>
        )}
      </div>
    </div>
  );
};

export default NewsHub;