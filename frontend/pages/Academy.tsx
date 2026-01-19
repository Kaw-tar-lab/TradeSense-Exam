import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CreativeImage from '../components/CreativeImage';
import Illustration from '../components/Illustration';
import { fetchCatalog, fetchRecommendations, fetchWebinars, fetchProgress, fetchGamification, Level } from '../services/academy';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Academy: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const activeLevel = searchParams.get('level') || 'beginner';
  const isExclusiveView = searchParams.get('view') === 'exclusive';

  const [levels, setLevels] = useState<Level[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [gamify, setGamify] = useState<any | null>(null);
  const userId = 1; // TODO: Wire to auth user

  useEffect(() => {
    const load = async () => {
      try {
        const cat = await fetchCatalog();
        setLevels(cat.levels);
      } catch { }
      try { setRecommendations((await fetchRecommendations(userId)).recommendations); } catch { }
      try { setWebinars(await fetchWebinars()); } catch { }
      try { setProgress(await fetchProgress(userId)); } catch { }
      try { setGamify(await fetchGamification(userId)); } catch { }
    };
    load();
  }, []);

  // Ensure a module is selected when the active level changes
  useEffect(() => {
    const lvl = levels.find(l => l.id === activeLevel);
    const firstModuleId = lvl?.modules?.[0]?.id || null;
    setActiveModule(firstModuleId);
  }, [activeLevel, levels]);

  const levelObj = levels.find(l => l.id === activeLevel);
  const modules = levelObj?.modules || [];
  const pageTitle = levelObj?.title ? `MasterClass : ${levelObj.title}` : 'Académie MasterClass';

  const topicForCategory = (category?: string): string[] => {
    const c = (category || '').toLowerCase();
    if (c.includes('technique')) return ['technical analysis', 'indicators', 'candlestick', 'charts', 'trading'];
    if (c.includes('fondamentale')) return ['economics', 'macro', 'fundamental', 'news', 'calendar'];
    if (c.includes('risque')) return ['risk management', 'stop loss', 'portfolio', 'volatility', 'risk'];
    if (c.includes('pratique')) return ['backtesting', 'simulation', 'lab', 'strategy', 'charts'];
    if (c.includes('trading')) return ['trading', 'market', 'stocks', 'chart', 'signals'];
    return ['finance', 'trading', 'market', 'chart'];
  };

  const typeForCategory = (category?: string): 'charts' | 'risk' | 'trends' | 'academy' | 'signals' => {
    const c = (category || '').toLowerCase();
    if (c.includes('technique')) return 'charts';
    if (c.includes('fondamentale')) return 'trends';
    if (c.includes('risque')) return 'risk';
    if (c.includes('pratique')) return 'academy';
    return 'signals';
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <button
            onClick={() => navigate('/learning')}
            className="flex items-center gap-2 text-sm text-[#eab308] font-medium hover:underline mb-4"
          >
            <span className="text-lg">←</span> {t('academy.back_to_levels')}
          </button>
        </div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#eab308]">
            {isExclusiveView ? t('academy.exclusive_title') : pageTitle}
          </h2>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => {
                if (isExclusiveView) {
                  navigate(`/academy?level=${activeLevel}`);
                } else {
                  navigate('/academy?view=exclusive');
                }
              }}
              className={`text-sm px-4 py-1.5 rounded-full border transition-all font-bold ${isExclusiveView
                ? 'bg-[#eab308] border-[#eab308] text-black shadow-lg shadow-yellow-500/20'
                : 'text-slate-400 bg-white/5 border-white/10 hover:border-[#eab308] hover:text-[#eab308]'
                }`}
            >
              {isExclusiveView ? t('academy.all_courses') : t('academy.exclusive_content')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0c1322] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10 text-[12px] text-slate-400">{t('academy.modules')}</div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map(m => (
                  <button key={m.id} onClick={() => setActiveModule(m.id)} className={`text-left p-3 rounded border transition-all ${activeModule === m.id ? 'bg-[#eab308] border-[#eab308] text-black' : 'bg-[#020617] border-white/10 hover:border-white/20'}`}>
                    <Illustration type="academy" className="mb-2" />
                    <div className="font-bold text-sm">{m.title}</div>
                    <div className={`text-[12px] ${activeModule === m.id ? 'text-black/70' : 'text-slate-400'}`}>{m.lessons.length} {t('academy.lessons_count')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0c1322] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10 text-[12px] text-slate-400">
                {isExclusiveView ? t('academy.premium_exclusive_content') : t('academy.lessons')}
              </div>
              <div className="p-4 space-y-3">
                {isExclusiveView ? (
                  <div className="space-y-4">
                    <div className="p-6 border border-yellow-500/20 rounded-xl bg-yellow-500/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-xl flex items-center justify-center text-3xl">📚</div>
                        <div>
                          <h4 className="font-bold text-lg text-[#eab308]">{t('academy.ebook_master_scalping_title')}</h4>
                          <p className="text-sm text-slate-400">{t('academy.ebook_master_scalping_desc')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/checkout?product=ebook-scalping')}
                        className="bg-[#eab308] text-black px-6 py-2 rounded-lg font-black hover:scale-105 transition-all shadow-lg shadow-yellow-500/20"
                      >
                        {t('academy.download')}
                      </button>
                    </div>
                    <div className="p-6 border border-white/10 rounded-xl bg-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center text-3xl">🎥</div>
                        <div>
                          <h4 className="font-bold text-lg text-white">{t('academy.dubai_seminar_title')}</h4>
                          <p className="text-sm text-slate-400">{t('academy.dubai_seminar_desc')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/checkout?product=dubai-seminar')}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-bold transition-all"
                      >
                        {t('academy.watch')}
                      </button>
                    </div>
                    <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                      <p className="text-slate-500 italic text-sm">{t('academy.more_vip_content')}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {modules.find(m => m.id === activeModule)?.lessons.map(lesson => (
                      <div key={lesson.id} className="p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                        <Illustration type={typeForCategory(lesson.category)} className="mb-3" />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm">{lesson.title}</div>
                            <div className="text-[12px] text-slate-400">{t('academy.category')}: {lesson.category} • {t('academy.objectives')}: {lesson.objectives.join(', ')}</div>
                          </div>
                          <button className="text-[12px] bg-[#eab308] hover:bg-[#facc15] text-black px-3 py-1.5 rounded font-bold transition-colors" onClick={() => navigate(`/academy/lesson/${lesson.id}`)}>{t('academy.view')}</button>
                        </div>
                      </div>
                    ))}
                    {!modules.find(m => m.id === activeModule) && modules.length > 0 && (
                      <div className="p-6 text-center text-slate-500">{t('academy.select_module_to_see_lessons')}</div>
                    )}
                    {modules.length === 0 && (
                      <div className="p-6 text-center text-slate-500">{t('academy.no_modules_for_this_level')}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0c1322] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10 text-[12px] text-slate-400">{t('academy.ai_recommendations')}</div>
              <div className="p-4 text-[13px] space-y-2">
                {recommendations
                  .slice(0, 3)
                  .map(r => (
                    <div key={r.lesson_id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{r.title}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{r.module}</span>
                      </div>
                      <button className="text-[11px] bg-[#eab308] hover:bg-[#facc15] text-black px-2 py-1 rounded font-bold transition-colors" onClick={() => navigate(`/academy/lesson/${r.lesson_id}`)}>{t('academy.follow')}</button>
                    </div>
                  ))}
                {recommendations.length === 0 && <div className="text-slate-500">{t('academy.no_recommendations')}</div>}
              </div>
            </div>

            <div className="bg-[#0c1322] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10 text-[12px] text-slate-400">{t('academy.webinars')}</div>
              <div className="p-4 text-[13px] space-y-2">
                {webinars.map((w, idx) => (
                  <div key={w.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="flex flex-col">
                      <span className="font-medium text-white truncate max-w-[120px] group-hover:text-[#eab308] transition-colors">{w.title}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{w.host}</span>
                    </div>
                    <button
                      onClick={() => {
                        // Use lesson_id from backend or fallback to catalog
                        const lessonId = w.lesson_id || (idx === 0 ? 'w1-l1' : idx === 1 ? 'w1-l2' : 'w1-l3');
                        navigate(`/academy/lesson/${lessonId}`);
                      }}
                      className="text-[11px] bg-slate-800 hover:bg-[#eab308] hover:text-black text-white px-2 py-1 rounded border border-slate-700 font-bold transition-all hover:scale-110 active:scale-95 shadow-lg shadow-white/5"
                    >
                      {t('academy.join')}
                    </button>
                  </div>
                ))}
                {webinars.length === 0 && <div className="text-slate-500">{t('academy.no_webinars')}</div>}
              </div>
            </div>

            <div className="bg-[#0c1322] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10 text-[12px] text-slate-400">{t('academy.exclusive_content')}</div>
              <div className="p-4 text-[13px] space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#eab308]">{t('academy.ebook_pro_scalping_title')}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{t('academy.pdf_premium')}</span>
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = 'https://www.africau.edu/images/default/sample.pdf';
                      link.target = '_blank';
                      link.download = 'Ebook_Pro_Scalping_TradeSense.pdf';
                      link.click();
                    }}
                    className="text-[11px] bg-[#eab308] hover:bg-[#facc15] text-black px-2 py-1 rounded font-bold"
                  >
                    {t('academy.open')}
                  </button>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5 hover:border-[#eab308]/30 transition-all cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="font-medium text-white group-hover:text-[#eab308] transition-colors">{t('academy.dubai_conference_title')}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{t('academy.video_4k_45min')}</span>
                  </div>
                  <button
                    onClick={() => {
                      // Navigate to a special video or just alert for now with a specific intent
                      alert(t('academy.vip_access_granted'));
                      window.open("https://www.youtube.com/watch?v=uyXeL8X6fK0", "_blank");
                    }}
                    className="text-[10px] bg-[#eab308]/10 group-hover:bg-[#eab308] text-[#eab308] group-hover:text-black border border-[#eab308]/20 px-2 py-1 rounded font-black transition-all"
                  >
                    VIP
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0c1322] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/10 text-[12px] text-slate-400">{t('academy.gamification')}</div>
              <div className="p-4 text-[13px] space-y-4">
                {gamify ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center text-xl">🏆</div>
                        <div>
                          <div className="font-bold text-white text-sm">{t('academy.level')} {gamify.level}</div>
                          <div className="text-[11px] text-slate-400">{gamify.xp} {t('academy.total_xp')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#eab308] font-bold">{gamify.completed}</div>
                        <div className="text-[10px] text-slate-500">{t('academy.trainings')}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{t('academy.overall_progress')}</span>
                        <span className="text-white">75%</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-[#eab308] rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">{t('academy.recent_badges')}</div>
                      <div className="flex gap-2">
                        {gamify.badges.slice(0, 3).map((b: string) => (
                          <div key={b} className="text-lg bg-white/5 p-1.5 rounded-lg border border-white/5" title={b}>
                            {b === 'Explorer' ? '🔍' : b === 'Master' ? '👑' : '🔥'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-800 rounded"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Academy;