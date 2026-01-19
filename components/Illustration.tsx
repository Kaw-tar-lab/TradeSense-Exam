import React from 'react';

export type IllustrationProps = {
  type:
  | 'dashboard'
  | 'charts'
  | 'signals'
  | 'risk'
  | 'trends'
  | 'assistant'
  | 'academy'
  | 'community'
  | 'news'
  | 'platform';
  width?: number;
  height?: number;
  className?: string;
  accent?: string;
  subtle?: boolean;
  rounded?: boolean;
};

const bg = (accent: string, subtle: boolean) => (
  <rect width="100%" height="100%" fill={subtle ? '#0f172a' : accent} opacity={subtle ? 1 : 0.12} />
);

const grid = () => (
  <g opacity="0.2">
    {Array.from({ length: 10 }).map((_, i) => (
      <line key={`v-${i}`} x1={(i + 1) * 40} y1={0} x2={(i + 1) * 40} y2={240} stroke="#475569" strokeWidth={0.5} />
    ))}
    {Array.from({ length: 6 }).map((_, i) => (
      <line key={`h-${i}`} x1={0} y1={(i + 1) * 40} x2={400} y2={(i + 1) * 40} stroke="#475569" strokeWidth={0.5} />
    ))}
  </g>
);

const pathLine = (color: string) => (
  <path
    d="M10 200 C 60 160, 100 140, 140 160 S 220 200, 260 140 S 340 100, 390 140"
    fill="none"
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
  />
);

const candles = (colorUp: string, colorDown: string) => (
  <g>
    {[0, 1, 2, 3, 4, 5, 6].map(i => {
      const x = 40 + i * 45;
      const up = i % 2 === 0;
      const bodyH = up ? 40 : 26;
      const bodyY = up ? 130 : 150;
      const wickY1 = up ? 110 : 140;
      const wickY2 = up ? 180 : 190;
      return (
        <g key={i}>
          <line x1={x + 12} y1={wickY1} x2={x + 12} y2={wickY2} stroke="#94a3b8" strokeWidth={2} />
          <rect x={x} y={bodyY} width={24} height={bodyH} rx={4} fill={up ? colorUp : colorDown} />
        </g>
      );
    })}
  </g>
);

const badge = (text: string, color: string) => (
  <g>
    <rect x={20} y={20} rx={12} width={180} height={32} fill={color} opacity={0.18} />
    <text x={30} y={41} fill={color} fontSize={14} fontWeight={700}>{text}</text>
  </g>
);

const Illustration: React.FC<IllustrationProps> = ({
  type,
  width = 400,
  height = 240,
  className = '',
  accent = '#2563eb',
  subtle = true,
  rounded = true,
}) => {
  const up = '#10b981';
  const down = '#ef4444';
  const accent2 = '#7c3aed';

  return (
    <div className={`overflow-hidden ${rounded ? 'rounded-xl' : ''} bg-slate-900 ${className}`} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {bg(accent, subtle)}
        {grid()}

        {type === 'dashboard' && (
          <g>
            {badge('Dashboard', accent)}
            {candles(up, down)}
            {pathLine('#38bdf8')}
          </g>
        )}

        {type === 'charts' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/academy_lesson_card.png" 
                alt="Academy Lesson" 
                className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md border border-blue-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  Charts & Analytics
                </div>
              </div>
            </div>
          </foreignObject>
        )}

        {type === 'signals' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/academy_lesson_card.png" 
                alt="Trading Signals" 
                className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-orange-600/80 backdrop-blur-md border border-orange-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  Buy / Sell Signals
                </div>
              </div>
            </div>
          </foreignObject>
        )}

        {type === 'risk' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/academy_lesson_card.png" 
                alt="Risk Management" 
                className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-md border border-red-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  Risk Management
                </div>
              </div>
            </div>
          </foreignObject>
        )}

        {type === 'trends' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/academy_lesson_card.png" 
                alt="Market Trends" 
                className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-emerald-600/80 backdrop-blur-md border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  Market Trends
                </div>
              </div>
            </div>
          </foreignObject>
        )}

        {type === 'assistant' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/ai_assistant_card.png" 
                alt="AI Assistant" 
                className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-indigo-600/80 backdrop-blur-md border border-indigo-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  AI Trading Assistant
                </div>
              </div>
            </div>
          </foreignObject>
        )}

        {type === 'academy' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/masterclass_card.png" 
                alt="Learning Academy" 
                className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-amber-600/80 backdrop-blur-md border border-amber-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  Learning Academy
                </div>
              </div>
            </div>
          </foreignObject>
        )}

        {type === 'community' && (
          <g>
            {badge('Social Trading', accent)}
            <circle cx={340} cy={180} r={16} fill="#38bdf8" opacity={0.6} />
            <circle cx={370} cy={180} r={16} fill="#10b981" opacity={0.6} />
            <circle cx={310} cy={180} r={16} fill="#f59e0b" opacity={0.6} />
          </g>
        )}

        {type === 'news' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/news_card.png" 
                alt="Market News" 
                className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-rose-600/80 backdrop-blur-md border border-rose-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  Market News
                </div>
              </div>
            </div>
          </foreignObject>
        )}

        {type === 'platform' && (
          <foreignObject x="0" y="0" width={width} height={height}>
            <div className="w-full h-full relative group">
              <img 
                src="/traders_community.png" 
                alt="TradeSense Platform" 
                className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md border border-blue-400/30 text-[10px] font-black uppercase tracking-wider shadow-lg">
                  All-in-one Platform
                </div>
              </div>
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
};

export default Illustration;