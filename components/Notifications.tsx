import React from 'react';
import RiskAlertBadge from './badges/RiskAlertBadge';
import TradingIcon from './icons/TradingIcon';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export interface NotificationItem {
  id: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  message: string;
  time: number;
}

const Notifications: React.FC<{ items: NotificationItem[] }> = ({ items }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div 
          key={item.id} 
          className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top duration-300 ${
            item.type === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            item.type === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            item.type === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}
        >
          <span className="text-lg">
            {item.type === 'SUCCESS' ? '✅' : item.type === 'ERROR' ? '❌' : item.type === 'WARNING' ? '⚠️' : 'ℹ️'}
          </span>
          <div className="text-left">
            <p className="text-xs font-black uppercase tracking-tight leading-none mb-1">{item.type}</p>
            <p className="text-[11px] font-bold opacity-90">{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;