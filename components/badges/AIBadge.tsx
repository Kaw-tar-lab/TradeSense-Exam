import React from 'react';

type Variant = 'assistant' | 'learning' | 'strategy';

const config: Record<Variant, { bg: string; emoji: string; label: string }> = {
  assistant: { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', emoji: '🤖', label: 'AI' },
  learning: { bg: 'bg-green-500/20 text-green-300 border-green-500/30', emoji: '🎓', label: 'Learning' },
  strategy: { bg: 'bg-violet-500/20 text-violet-300 border-violet-500/30', emoji: '🧠', label: 'Strategy' },
};

const AIBadge: React.FC<{ variant?: Variant; text?: string; className?: string }>=({ variant = 'assistant', text, className = '' }) => {
  const { bg, emoji, label } = config[variant];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${bg} ${className}`}>
      <span className="select-none">{emoji}</span>
      {text || label}
    </span>
  );
};

export default AIBadge;