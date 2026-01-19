import React from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { ChallengeStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface BalanceStatusProps {
  onStatusClick?: () => void;
  darkMode?: boolean;
}

const BalanceStatus: React.FC<BalanceStatusProps> = ({ onStatusClick }) => {
  const { challenge } = useChallenge();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  if (!challenge) return null;

  const getStatusLabel = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.ACTIVE: return t('balance_status.active');
      case ChallengeStatus.PASSED: return t('balance_status.passed');
      case ChallengeStatus.FAILED: return t('balance_status.failed');
      default: return status;
    }
  };

  const formatCurrency = (val: any) => {
    if (typeof val !== 'number' || isNaN(val)) return '0.00';
    return val.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  };

  return (
    <div className="flex items-center gap-6">
      <div className="hidden sm:flex gap-6">
        <div>
          <p className={`text-[9px] uppercase font-black tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('balance_status.equity')}</p>
          <p className={`text-sm font-mono font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>${formatCurrency(challenge.equity)}</p>
        </div>
        <div>
          <p className={`text-[9px] uppercase font-black tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('balance_status.balance')}</p>
          <p className={`text-sm font-mono font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>${formatCurrency(challenge.currentBalance)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          onClick={onStatusClick}
          className={`text-[10px] px-3 py-1 rounded-lg inline-flex items-center gap-2 font-black uppercase tracking-tighter cursor-pointer hover:opacity-80 transition-all border ${
            challenge.status === ChallengeStatus.ACTIVE ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            challenge.status === ChallengeStatus.PASSED ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
            'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-current ${challenge.status === ChallengeStatus.ACTIVE ? 'animate-ping' : ''}`} />
          {getStatusLabel(challenge.status)}
        </div>
      </div>
    </div>
  );
};

export default BalanceStatus;