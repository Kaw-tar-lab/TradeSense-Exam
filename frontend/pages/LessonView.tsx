import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCatalog, Lesson } from '../services/academy';
import PageHeader from '../components/visual/PageHeader';
import TradingIcon from '../components/icons/TradingIcon';
import AIBadge from '../components/badges/AIBadge';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LessonView: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLesson = async () => {
            try {
                const catalog = await fetchCatalog();
                let found: Lesson | undefined;
                for (const level of catalog.levels) {
                    for (const module of level.modules) {
                        const hit = module.lessons.find(l => l.id === lessonId);
                        if (hit) {
                            found = hit;
                            break;
                        }
                    }
                    if (found) break;
                }
                setLesson(found || null);
            } catch (err) {
                console.error("Failed to load lesson", err);
            } finally {
                setLoading(false);
            }
        };
        if (lessonId) loadLesson();
    }, [lessonId]);

    if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">{t('lesson_view.loading')}</div>;
    if (!lesson) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">{t('lesson_view.not_found')}</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/academy')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <span className="text-lg">←</span> {t('lesson_view.back')}
                    </button>
                    <LanguageSwitcher />
                </div>

                <PageHeader
                    title={lesson ? lesson.title : t('lesson_view.lesson')}
                    subtitle={`${t('lesson_view.mastery')} ${lesson?.category || 'Trading'}`}
                    emojiType="LEARN"
                    illustrationVariant="education"
                />

                <div className="bg-[#0c1322] border border-white/10 rounded-xl p-8 mt-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <AIBadge variant="learning" text="Premium MasterClass" />
                    </div>
                    <div className="aspect-video bg-black/40 border border-white/5 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden group">
                        {lesson.video_url ? (
                            <iframe
                                src={lesson.video_url}
                                title={lesson.title}
                                className="w-full h-full absolute inset-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="text-center">
                                <TradingIcon kind="learning" size={48} />
                                <p className="mt-2 text-slate-400">{t('lesson_view.video_not_available')}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded uppercase font-bold">{lesson.category}</span>
                        {lesson.prerequisites?.map(p => (
                            <span key={p} className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700">{t('lesson_view.prereq')}: {p}</span>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>

                    <div className="space-y-4 text-slate-300 leading-relaxed">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <h3 className="font-bold text-white mb-2">{t('lesson_view.objectives')}</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {lesson.objectives?.map((obj, i) => (
                                    <li key={i}>{obj}</li>
                                ))}
                            </ul>
                        </div>

                        <p>
                            {t('lesson_view.welcome')} <strong>{lesson.title}</strong>.
                            {t('lesson_view.deep_dive')} {lesson.category}.
                            {t('lesson_view.prepare')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonView;
