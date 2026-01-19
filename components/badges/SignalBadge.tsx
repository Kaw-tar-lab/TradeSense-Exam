import React from 'react';

type Variant = 'BUY' | 'SELL' | 'HOLD';

const bgFor = (v: Variant) => (
  v === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
  v === 'SELL' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
  'bg-slate-600/20 text-slate-300 border-slate-500/30'
);

const emojiFor = (v: Variant) => (
  v === 'BUY' ? '📈' : v === 'SELL' ? '📉' : '⏸'
);

const SignalBadge: React.FC<{ variant: Variant; label?: string; className?: string }>=({ variant, label, className = '' }) => {
  const emoji = emojiFor(variant);
  const bg = bgFor(variant);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${bg} ${className}`}>
      <span className="select-none">{emoji}</span>
      {label || variant}
    </span>
  );
};

export default SignalBadge;