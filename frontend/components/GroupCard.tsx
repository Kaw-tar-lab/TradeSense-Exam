import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreativeImage from './CreativeImage';
import Illustration, { IllustrationProps } from './Illustration';
import Icon, { IconProps } from './Icon';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type GroupCardProps = {
  name: string;
  members: number;
  description?: string;
  tag?: string;
  imageUrl?: string;
};

const topicForTag = (tag?: string, name?: string): string[] => {
  const t = (tag || '').toLowerCase();
  if (t.includes('crypto')) return ['crypto', 'bitcoin', 'ethereum', 'candlestick', 'trading'];
  if (t.includes('actions') || t.includes('stocks')) return ['stocks', 'wall street', 'market', 'trading', 'chart'];
  if (t.includes('indices')) return ['indices', 'sp500', 'nasdaq', 'market', 'chart'];
  if (t.includes('options') || t.includes('dérivés') || t.includes('derivatives')) return ['options', 'derivatives', 'volatility', 'risk', 'trading'];
  if (t.includes('tech')) return ['technology', 'ai', 'quant', 'algorithms', 'trading'];
  if (t.includes('recherche') || t.includes('quant')) return ['quant', 'backtesting', 'data', 'algorithms', 'charts'];
  // fallback: use name to bias finance theme
  return ['finance', 'trading', 'market', 'chart', 'portfolio'];
};

const GroupCard: React.FC<GroupCardProps> = ({ name, members, description, tag, imageUrl }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const darkMode = theme === 'dark';
  const iconForTag = (t?: string): IconProps['name'] => {
    const s = (t || '').toLowerCase();
    if (s.includes('crypto')) return 'trend';
    if (s.includes('stocks') || s.includes('actions')) return 'chart';
    if (s.includes('indices')) return 'chart';
    if (s.includes('options') || s.includes('dérivés') || s.includes('derivatives')) return 'risk';
    if (s.includes('quant') || s.includes('tech')) return 'assistant';
    return 'community';
  };
  const accentForTag = (t?: string): string => {
    const s = (t || '').toLowerCase();
    if (s.includes('crypto')) return '#10b981';
    if (s.includes('stocks') || s.includes('actions')) return '#2563eb';
    if (s.includes('indices')) return '#0ea5e9';
    if (s.includes('options') || s.includes('dérivés') || s.includes('derivatives')) return '#ef4444';
    if (s.includes('quant') || s.includes('tech')) return '#a78bfa';
    return '#38bdf8';
  };
  const typeForTag = (t?: string): IllustrationProps['type'] => {
    const s = (t || '').toLowerCase();
    if (s.includes('crypto')) return 'trends';
    if (s.includes('stocks') || s.includes('actions')) return 'charts';
    if (s.includes('indices')) return 'charts';
    if (s.includes('options') || s.includes('dérivés') || s.includes('derivatives')) return 'risk';
    if (s.includes('quant') || s.includes('tech')) return 'assistant';
    return 'community';
  };
  return (
    <div className={`transition-colors duration-300 border rounded-xl overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800/30' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
      }`}>
      {/* Illustration SVG toujours visible, couleurs accentuées pour contraste */}
      <div className="w-full h-28">
        <Illustration
          type={typeForTag(tag)}
          className="w-full h-full"
          accent={accentForTag(tag)}
          height={112}
          subtle={false}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-bold text-sm">{name}</h5>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">{members} {t('community_zone.members') || 'membres'}</span>
        </div>
        {description && (
          <p className={`text-[12px] mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${darkMode ? 'bg-slate-700/30 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
            <Icon name={iconForTag(tag)} size={12} color={darkMode ? '#93c5fd' : '#2563eb'} />
            {tag || t('community_zone.general') || 'Général'}
          </span>

          <button
            onClick={() => navigate(`/community/group/${encodeURIComponent(name)}`)}
            className={`text-[12px] px-3 py-1.5 rounded font-bold transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
              }`}
          >
            {t('community_zone.view') || 'Voir'}
          </button>
        </div>
      </div>
    </div >
  );
};

export default GroupCard;