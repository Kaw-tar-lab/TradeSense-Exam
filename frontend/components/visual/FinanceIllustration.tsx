import React from 'react';

type Variant = 'market' | 'live' | 'network' | 'education' | 'breaking' | 'ranking';

interface Props {
  variant?: Variant;
  className?: string;
}

// Inline SVG illustrations with finance colors and dark background
export const FinanceIllustration: React.FC<Props> = ({ variant = 'market', className }) => {
  const base = 'w-full h-[120px] rounded-lg bg-[#0f172a]';

  switch (variant) {
    case 'market':
      return (
        <div className={`w-full h-[140px] overflow-hidden rounded-xl border border-slate-800/50 shadow-2xl group/img relative bg-black`}>
          <img 
            src="/market_overview_v2.jpg" 
            alt="Real-time Market Data" 
            className="w-full h-full object-cover brightness-[0.85] contrast-110 group-hover/img:scale-110 transition-transform duration-1000 ease-out" 
          />
          {/* Professional Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
        </div>
      );
    case 'live':
      return (
        <svg className={`${base} ${className || ''}`} viewBox="0 0 600 120">
          <rect width="600" height="120" fill="#0f172a" />
          <g>
            <rect x="30" y="50" width="10" height="40" fill="#ef4444" />
            <rect x="50" y="40" width="10" height="50" fill="#22c55e" />
            <rect x="70" y="55" width="10" height="35" fill="#3b82f6" />
            <rect x="90" y="35" width="10" height="55" fill="#22c55e" />
            <rect x="110" y="60" width="10" height="30" fill="#ef4444" />
          </g>
          <path d="M160 90 L230 70 L300 85 L370 60 L440 75 L510 50" stroke="#22c55e" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'network':
      return (
        <svg className={`${base} ${className || ''}`} viewBox="0 0 600 120">
          <rect width="600" height="120" fill="#0f172a" />
          <circle cx="120" cy="60" r="14" fill="#3b82f6" />
          <circle cx="200" cy="40" r="12" fill="#22c55e" />
          <circle cx="260" cy="80" r="12" fill="#ef4444" />
          <circle cx="340" cy="50" r="13" fill="#eab308" />
          <circle cx="420" cy="75" r="12" fill="#3b82f6" />
          <circle cx="500" cy="45" r="14" fill="#22c55e" />
          <path d="M120 60 L200 40 L260 80 L340 50 L420 75 L500 45" stroke="#64748b" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'education':
      return (
        <div className={`${base} ${className || ''} overflow-hidden flex items-center justify-center bg-black`}>
          <img src="/learning_bg.png" alt="Education" className="w-full h-full object-cover opacity-80" />
        </div>
      );
    case 'breaking':
      return (
        <div className={`w-full h-[120px] overflow-hidden rounded-lg border border-slate-800/50 shadow-2xl group/img relative ${className || ''}`}>
          <img 
            src="/dashboard_bg.png" 
            alt="Breaking News" 
            className="w-full h-full object-cover brightness-[0.85] contrast-110 group-hover/img:scale-105 transition-transform duration-500 ease-out" 
          />
          {/* Professional Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
        </div>
      );
    case 'ranking':
      return (
        <div className={`w-full h-[120px] overflow-hidden rounded-lg border border-slate-800/50 shadow-2xl group/img relative ${className || ''}`}>
          <img 
            src="/dashboard_bg.png" 
            alt="Dashboard Overview" 
            className="w-full h-full object-cover brightness-[0.85] contrast-110 group-hover/img:scale-105 transition-transform duration-500 ease-out" 
          />
          {/* Professional Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
        </div>
      );
    default:
      return null;
  }
};

export default FinanceIllustration;