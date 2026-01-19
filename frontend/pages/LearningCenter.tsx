import React from 'react';
import { useNavigate } from 'react-router-dom';
import AIBadge from '../components/badges/AIBadge';
import SignalBadge from '../components/badges/SignalBadge';
import TradingIcon from '../components/icons/TradingIcon';
import PageHeader from '../components/visual/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LearningCenter: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  React.useEffect(() => {
    document.body.classList.add('learning-theme');
    return () => {
      document.body.classList.remove('learning-theme');
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <span className="text-lg">←</span> {t('back')}
          </button>
          <LanguageSwitcher />
        </div>
        <PageHeader
          title={t('learning.title')}
          subtitle={t('learning.subtitle')}
          emojiType="LEARN"
          illustrationVariant="education"
        />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TradingIcon kind="learning" size={20} />
            {t('learning.title')}
          </h2>
          <AIBadge variant="learning" text="MasterClass" />
        </div>

        {/* MasterClass Levels (Row 1: 3 items) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Beginner */}
          <div onClick={() => navigate('/academy?level=beginner')} className="cursor-pointer bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-black/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2"><TradingIcon kind="learning" size={18} />{t('learning.beginner')}</h3>
              <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">🎓 Course</span>
            </div>
            <div className="mb-3 overflow-hidden rounded-lg">
              <img src="/course_advanced.png" alt="Beginner Course" className="w-full h-auto object-contain" />
            </div>
            <p className="text-sm text-slate-400">{t('learning.beginner_desc')}</p>
          </div>

          {/* Intermediate */}
          <div onClick={() => navigate('/academy?level=intermediate')} className="cursor-pointer bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-black/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2"><TradingIcon kind="learning" size={18} />{t('learning.intermediate')}</h3>
              <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">🎓 Course</span>
            </div>
            <div className="mb-3 overflow-hidden rounded-lg">
              <img src="/course_intermediate.png" alt="Intermediate Course" className="w-full h-auto object-contain" />
            </div>
            <p className="text-sm text-slate-400">{t('learning.intermediate_desc')}</p>
          </div>

          {/* Advanced */}
          <div onClick={() => navigate('/academy?level=advanced')} className="cursor-pointer bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-black/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2"><TradingIcon kind="learning" size={18} />{t('learning.advanced')}</h3>
              <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">🎓 Course</span>
            </div>
            <div className="mb-3 overflow-hidden rounded-lg">
              <img src="/course_risk.jpg" alt="Advanced Course" className="w-full h-auto object-contain" />
            </div>
            <p className="text-sm text-slate-400">{t('learning.advanced_desc')}</p>
          </div>
        </div>

        {/* MasterClass Extras (Row 2: 3 items) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Management */}
          <div onClick={() => navigate('/academy?level=risk')} className="cursor-pointer bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-black/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2"><TradingIcon kind="risk" size={18} />{t('learning.risk')}</h3>
              <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">🎓 Course</span>
            </div>
            <div className="mb-3 overflow-hidden rounded-lg">
              <img src="/course_risk_v2.png" alt="Risk Management" className="w-full h-auto object-contain" />
            </div>
            <p className="text-sm text-slate-400">{t('learning.risk_desc')}</p>
          </div>

          {/* Live Webinars */}
          <div onClick={() => navigate('/academy?level=webinars')} className="cursor-pointer bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-black/60 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2"><TradingIcon kind="achievement" size={18} />{t('learning.webinars')}</h3>
              <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">🎓 Course</span>
            </div>
            <div className="mb-3 overflow-hidden rounded-lg">
              <img src="/course_new_webinar_v2.png" alt="Live Webinars" className="w-full h-auto object-contain" />
            </div>
            <p className="text-sm text-slate-400">{t('learning.webinars_desc')}</p>
          </div>

          {/* Exclusive Content */}
          <div onClick={() => navigate('/academy?view=exclusive')} className="cursor-pointer bg-yellow-500/5 backdrop-blur-sm border border-[#eab308]/20 rounded-xl p-4 hover:bg-yellow-500/10 transition-colors shadow-lg shadow-yellow-500/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm flex items-center gap-2 text-[#eab308]"><TradingIcon kind="premium" size={18} />{t('learning.exclusive')}</h3>
              <span className="text-[10px] bg-[#eab308] text-black px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">⭐ Premium</span>
            </div>
            <div className="mb-3 overflow-hidden rounded-lg">
              <img src="/exclusive_thumb.png" alt="Exclusive Content" className="w-full h-auto object-contain brightness-110" />
            </div>
            <p className="text-sm text-[#eab308]/70">{t('learning.exclusive_desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningCenter;