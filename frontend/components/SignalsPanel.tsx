import React, { useEffect, useState } from 'react';
import { getSignal } from '../services/api';
import SignalBadge from './badges/SignalBadge';
import RiskAlertBadge from './badges/RiskAlertBadge';
import AIBadge from './badges/AIBadge';
import TradingIcon from './icons/TradingIcon';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface SignalItem {
  ticker: string;
  price: number | null;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  time: string;
}

const SignalsPanel: React.FC<{ tickers: string[]; minimized?: boolean }> = ({ tickers, minimized = false }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [signals, setSignals] = useState<SignalItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          tickers.map(t_ticker => getSignal(t_ticker).catch(() => null))
        );
        if (!isMounted) return;
        const cleaned = results.filter(Boolean) as SignalItem[];
        // Fallback: if API returns nothing (errors/timeouts), seed neutral placeholders
        if (!cleaned || cleaned.length === 0) {
          const placeholders: SignalItem[] = tickers.map(t_ticker => ({
            ticker: t_ticker,
            price: null,
            signal: 'NEUTRAL',
            time: new Date().toISOString(),
          }));
          setSignals(placeholders);
        } else {
          setSignals(cleaned);
        }
      } catch (err) {
        console.error('Signals fetch error:', err);
        // On global error, still show placeholders to avoid empty panel
        const placeholders: SignalItem[] = tickers.map(t_ticker => ({
          ticker: t_ticker,
          price: null,
          signal: 'NEUTRAL',
          time: new Date().toISOString(),
        }));
        setSignals(placeholders);
      }
    };
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => { isMounted = false; clearInterval(id); };
  }, [tickers.join(',')]);

  return (
    <div className={`transition-colors duration-300 border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
      <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
        <h4 className="font-bold text-sm flex items-center gap-2">
          <TradingIcon kind="strategy" size={18} />
          {t('signals_panel.title')}
          <AIBadge variant="assistant" className="ml-1" />
        </h4>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">{t('signals_panel.real_time')}</span>
      </div>
      <div className="p-2">
        {(minimized ? signals.slice(0, 3) : signals).length > 0 ? (minimized ? signals.slice(0, 3) : signals).map((s) => (
          <div key={s.ticker} className={`p-3 border-b last:border-0 rounded-lg transition-colors ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'
            }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-sm flex items-center gap-2">
                <TradingIcon kind={s.signal === 'BUY' ? 'buy' : s.signal === 'SELL' ? 'sell' : 'stop'} size={18} />
                {s.ticker}
              </span>
              <div className="flex items-center gap-2">
                <SignalBadge variant={s.signal as any} />
                {/* Badge AI pour chaque signal du panel IA */}
                <AIBadge variant="assistant" />
                {/* Badge Risk visible quand risque élevé (prix manquant ou SELL) */}
                {(s.price === null || s.signal === 'SELL') && (
                  <RiskAlertBadge variant={s.price === null ? 'DANGER' : 'WARNING'} text={s.price === null ? t('signals_panel.high_risk') : t('signals_panel.risk')} />
                )}
              </div>
            </div>
            <div className={`flex justify-between text-[10px] font-mono ${darkMode ? '' : 'text-slate-600'}`}>
              <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>{t('signals_panel.price')}: {s.price ? `$${s.price.toFixed(2)}` : '—'}</span>
              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{new Date(s.time).toLocaleTimeString()}</span>
            </div>
          </div>
        )) : (
          <div className="p-6 text-center text-slate-500">{t('signals_panel.waiting_data')}</div>
        )}
      </div>
    </div>
  );
};

export default SignalsPanel;