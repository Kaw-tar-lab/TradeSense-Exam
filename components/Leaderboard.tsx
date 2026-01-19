import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardItem } from '../services/api';
import TradingIcon from './icons/TradingIcon';
import PageHeader from './visual/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Leaderboard: React.FC<{ minimized?: boolean }> = ({ minimized = false }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [items, setItems] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await getLeaderboard();
        if (mounted) setItems(data);
      } catch (err) {
        console.error('Leaderboard error:', err);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className={`transition-colors duration-300 border rounded-xl overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
      <div className="p-4">
        <PageHeader
          title={t('leaderboard.title')}
          subtitle={t('leaderboard.subtitle')}
          emojiType="TROPHY"
          illustrationVariant="ranking"
        />
      </div>
      <div className={`p-4 border-b ${darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'
        }`}>
        <h4 className="font-bold text-sm">{t('leaderboard.top_10')}</h4>
      </div>
      <table className="w-full text-left text-sm">
        <thead className={darkMode ? 'text-slate-500 bg-slate-950/50' : 'text-slate-400 bg-slate-50'}>
          <tr>
            <th className="p-4 font-medium">{t('leaderboard.rank')}</th>
            <th className="p-4 font-medium">{t('leaderboard.trader')}</th>
            <th className="p-4 font-medium">{t('leaderboard.profit_pct')}</th>
            <th className="p-4 font-medium">{t('leaderboard.total_profit')}</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
          {(minimized ? items.slice(0, 5) : items).map((it, idx) => (
            <tr key={it.user_id} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
              <td className="p-4 w-10">
                {idx < 3 ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold">
                    {idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <TradingIcon kind={it.pct_profit >= 0 ? 'buy' : 'sell'} size={16} />
                )}
              </td>
              <td className="p-4 font-bold">{it.name}</td>
              <td className={`p-4 font-mono font-bold ${it.pct_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(it.pct_profit * 100).toFixed(2)}%</td>
              <td className={`p-4 font-mono ${it.sum_profit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>${it.sum_profit.toFixed(2)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-slate-500">{t('leaderboard.waiting_data')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;