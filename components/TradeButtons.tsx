import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  tradeSize: number;
  setTradeSize: (v: number) => void;
  canTrade: boolean;
  isProcessing: boolean;
  onBuy: () => void;
  onSell: () => void;
}

const TradeButtons: React.FC<Props> = ({ tradeSize, setTradeSize, canTrade, isProcessing, onBuy, onSell }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  return (
    <div className={`transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
        <span className="text-[#eab308]">⚡</span> {t('trade_buttons.execution')}
      </h4>
      <div className="space-y-4">
        <div>
          <label className={`text-[10px] font-black mb-2 block uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('trade_buttons.quantity')}</label>
          <input
            type="number"
            value={tradeSize}
            min={1}
            onChange={(e) => setTradeSize(Number(e.target.value))}
            className={`w-full border rounded-xl p-3 font-mono text-sm transition-all focus:ring-2 focus:ring-[#eab308]/50 outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={!canTrade || isProcessing}
            onClick={onBuy}
            className="group relative bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 overflow-hidden shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <span className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-lg">📈</span>
              <span className="text-[10px] uppercase tracking-widest">{isProcessing ? t('trade_buttons.processing') : t('trade_buttons.buy')}</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            disabled={!canTrade || isProcessing}
            onClick={onSell}
            className="group relative bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 overflow-hidden shadow-lg shadow-red-500/20 active:scale-95"
          >
            <span className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-lg">📉</span>
              <span className="text-[10px] uppercase tracking-widest">{isProcessing ? t('trade_buttons.processing') : t('trade_buttons.sell')}</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeButtons;