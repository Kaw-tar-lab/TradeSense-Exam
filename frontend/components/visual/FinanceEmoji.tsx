import React from 'react';

type FinanceEmojiType = 'BUY' | 'SELL' | 'HOLD' | 'RISK' | 'AI' | 'NEWS' | 'LEARN' | 'COMMUNITY' | 'WALLET' | 'MARKET' | 'STATS' | 'TROPHY';

export const FinanceEmoji: React.FC<{ type: FinanceEmojiType; className?: string }> = ({ type, className }) => {
  const map: Record<FinanceEmojiType, string> = {
    BUY: '📈',
    SELL: '📉',
    HOLD: '⏸',
    RISK: '⚠️',
    AI: '🤖',
    NEWS: '📰',
    LEARN: '🎓',
    COMMUNITY: '💬',
    WALLET: '💰',
    MARKET: '💹',
    STATS: '📊',
    TROPHY: '🏆',
  };

  return <span className={className}>{map[type]}</span>;
};

export default FinanceEmoji;