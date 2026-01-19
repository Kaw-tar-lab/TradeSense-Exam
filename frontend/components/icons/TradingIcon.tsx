import React from 'react';

type TradingIconProps = {
  kind: 'buy' | 'sell' | 'hold' | 'stop' | 'risk' | 'ai' | 'protection' | 'alert' | 'strategy' | 'achievement' | 'learning' | 'premium';
  size?: number;
  className?: string;
};

const emojiMap: Record<TradingIconProps['kind'], string> = {
  buy: '📈',
  sell: '📉',
  hold: '⏸',
  stop: '🛑',
  risk: '⚠️',
  ai: '🤖',
  protection: '🛡️',
  alert: '🔔',
  strategy: '🧠',
  achievement: '🏆',
  learning: '🎓',
  premium: '💎',
};

const colorMap: Record<TradingIconProps['kind'], string> = {
  buy: '#10b981',
  sell: '#ef4444',
  hold: '#64748b',
  stop: '#ef4444',
  risk: '#f59e0b',
  ai: '#38bdf8',
  protection: '#60a5fa',
  alert: '#f59e0b',
  strategy: '#a78bfa',
  achievement: '#fbbf24',
  learning: '#22c55e',
  premium: '#eab308',
};

const TradingIcon: React.FC<TradingIconProps> = ({ kind, size = 20, className = '' }) => {
  const color = colorMap[kind];
  const emoji = emojiMap[kind];
  const radius = size / 2;
  return (
    <div className={`inline-flex items-center justify-center rounded-lg bg-slate-800 relative ${className}`} style={{ width: size + 12, height: size + 12 }}>
      <svg width={size + 12} height={size + 12}>
        <circle cx={(size + 12) / 2} cy={(size + 12) / 2} r={radius} fill="none" stroke={color} strokeWidth={2} />
      </svg>
      <span style={{ fontSize: size * 0.9 }} className="absolute select-none">{emoji}</span>
    </div>
  );
};

export default TradingIcon;