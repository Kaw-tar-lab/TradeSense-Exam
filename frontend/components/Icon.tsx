import React from 'react';

export type IconProps = {
  name:
  | 'chart'
  | 'buy'
  | 'sell'
  | 'risk'
  | 'trend'
  | 'assistant'
  | 'academy'
  | 'community'
  | 'news'
  | 'platform';
  size?: number;
  className?: string;
  color?: string;
};

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', color = '#94a3b8' }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24' } as any;
  if (name === 'chart') {
    return (
      <svg {...common} className={className}>
        <path d="M3 3v18h18" stroke={color} strokeWidth={2} fill="none" />
        <path d="M6 15l3-4 3 2 4-6 2 3" stroke={color} strokeWidth={2} fill="none" />
      </svg>
    );
  }
  if (name === 'buy') {
    return (
      <svg {...common} className={className}>
        <circle cx={12} cy={12} r={9} fill="#10b981" opacity={0.2} />
        <path d="M8 12h8M12 8v8" stroke="#10b981" strokeWidth={2} />
      </svg>
    );
  }
  if (name === 'sell') {
    return (
      <svg {...common} className={className}>
        <circle cx={12} cy={12} r={9} fill="#ef4444" opacity={0.2} />
        <path d="M8 12h8" stroke="#ef4444" strokeWidth={2} />
      </svg>
    );
  }
  if (name === 'risk') {
    return (
      <svg {...common} className={className}>
        <polygon points="12,3 21,20 3,20" fill="#ef4444" opacity={0.2} />
        <path d="M12 8v6M12 16v2" stroke="#ef4444" strokeWidth={2} />
      </svg>
    );
  }
  if (name === 'trend') {
    return (
      <svg {...common} className={className}>
        <path d="M3 17l6-6 4 3 7-8" stroke="#22c55e" strokeWidth={2} fill="none" />
      </svg>
    );
  }
  if (name === 'assistant') {
    return (
      <svg {...common} className={className}>
        <rect x={4} y={5} width={16} height={12} rx={3} stroke={color} strokeWidth={2} fill="none" />
        <circle cx={9} cy={11} r={1} fill={color} />
        <circle cx={15} cy={11} r={1} fill={color} />
      </svg>
    );
  }
  if (name === 'academy') {
    return (
      <svg {...common} className={className}>
        <path d="M12 4l8 4-8 4-8-4 8-4z" stroke={color} strokeWidth={2} fill="none" />
        <path d="M4 12v6l8 4 8-4v-6" stroke={color} strokeWidth={2} fill="none" />
      </svg>
    );
  }
  if (name === 'community') {
    return (
      <svg {...common} className={className}>
        <circle cx={8} cy={11} r={3} stroke={color} strokeWidth={2} fill="none" />
        <circle cx={16} cy={11} r={3} stroke={color} strokeWidth={2} fill="none" />
        <path d="M5 18c1.5-2 3.5-3 7-3s5.5 1 7 3" stroke={color} strokeWidth={2} fill="none" />
      </svg>
    );
  }
  if (name === 'news') {
    return (
      <svg {...common} className={className}>
        <rect x={4} y={5} width={14} height={14} rx={2} stroke={color} strokeWidth={2} fill="none" />
        <rect x={6} y={7} width={10} height={3} fill={color} opacity={0.4} />
        <rect x={6} y={12} width={8} height={2} fill={color} opacity={0.3} />
      </svg>
    );
  }
  return (
    <svg {...common} className={className}>
      <path d="M3 3v18h18" stroke={color} strokeWidth={2} fill="none" />
    </svg>
  );
};

export default Icon;