import React from 'react';
import FinanceEmoji from './FinanceEmoji';
import FinanceIllustration from './FinanceIllustration';

interface Props {
  title: string;
  subtitle?: string;
  emojiType: 'BUY' | 'SELL' | 'HOLD' | 'RISK' | 'AI' | 'NEWS' | 'LEARN' | 'COMMUNITY' | 'WALLET' | 'MARKET' | 'STATS' | 'TROPHY';
  illustrationVariant?: 'market' | 'live' | 'network' | 'education' | 'breaking' | 'ranking';
}

const PageHeader: React.FC<Props> = ({ title, subtitle, emojiType, illustrationVariant = 'market' }) => {
  return (
    <div className="w-full bg-gradient-to-br from-[#0c1322] to-[#111827] rounded-2xl border border-slate-800 shadow-2xl p-6 mb-2 relative overflow-hidden group">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-blue-500/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 blur-[80px] rounded-full -ml-24 -mb-24" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-inner group-hover:border-blue-500/30 transition-colors">
            <FinanceEmoji type={emojiType} className="text-3xl" />
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                {title}
              </h1>
              {illustrationVariant === 'market' && (
                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] group/live">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </span>
                  <span className="text-emerald-400 text-[12px] font-black uppercase tracking-[0.2em] drop-shadow-md">
                    Live
                  </span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-slate-400 text-sm mt-1.5 font-medium tracking-wide opacity-80">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <FinanceIllustration variant={illustrationVariant} />
    </div>
  );
};

export default PageHeader;