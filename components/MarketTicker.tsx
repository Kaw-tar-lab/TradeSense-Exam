import React, { useEffect, useState } from 'react';
import { INITIAL_MARKET_DATA } from '../constants';
import { useTheme } from '../context/ThemeContext';

const MarketTicker: React.FC = () => {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [prices, setPrices] = useState(INITIAL_MARKET_DATA);

  // Simulate small price movements for the ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() - 0.5) * 0.001),
        changePercent: item.changePercent + (Math.random() - 0.5) * 0.05
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full overflow-hidden whitespace-nowrap py-3 border-y mb-8 ${
      darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex animate-marquee gap-8 items-center px-4">
        {[...prices, ...prices].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="font-bold text-sm">{item.symbol}</span>
            <span className="font-mono text-sm">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`text-xs font-bold ${item.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {item.changePercent >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;
