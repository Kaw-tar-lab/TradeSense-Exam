import React from 'react';

type Variant = 'INFO' | 'WARNING' | 'DANGER';

const config = {
  INFO: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', emoji: '🔔', label: 'Info' },
  WARNING: { bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', emoji: '⚠️', label: 'Risk' },
  DANGER: { bg: 'bg-red-500/20 text-red-300 border-red-500/30', emoji: '🛡️', label: 'Alert' },
} as const;

const RiskAlertBadge: React.FC<{ variant: Variant; text?: string; className?: string }>=({ variant, text, className = '' }) => {
  const { bg, emoji, label } = config[variant];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${bg} ${className}`}>
      <span className="select-none">{emoji}</span>
      {text || label}
    </span>
  );
};

export default RiskAlertBadge;