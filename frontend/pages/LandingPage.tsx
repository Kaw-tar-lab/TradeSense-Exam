
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CHALLENGE_TIERS } from '@/constants';
import CreativeImage from '@/components/CreativeImage';
import Illustration from '@/components/Illustration';
import Icon from '@/components/Icon';
import PageHeader from '@/components/visual/PageHeader';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import MarketTicker from '@/components/MarketTicker';
import { useState, useEffect } from 'react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Invalid user data', e);
      }
    }
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}
      style={{
        backgroundImage: `linear-gradient(${theme === 'dark' ? 'rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.85), rgba(248, 250, 252, 0.95)'}), url("/hero-bg.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#eab308] rounded-lg flex items-center justify-center font-bold text-black shadow-lg shadow-yellow-500/20">TS</div>
              <span className="text-xl font-bold tracking-tight">TradeSense <span className="text-[#eab308]">AI</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm font-medium hover:text-[#eab308] transition-colors">{t('nav.features')}</a>
              <a href="#pricing" className="text-sm font-medium hover:text-[#eab308] transition-colors">{t('nav.challenges')}</a>

              <button
                onClick={() => navigate('/learning')}
                className="text-sm font-medium hover:text-[#eab308] transition-colors"
              >{t('nav.learning')}</button>

              <LanguageSwitcher />

              <ThemeToggle />


              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-black border border-yellow-300 shadow-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className={`text-sm font-bold hidden lg:block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {user.name?.split(' ')[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#eab308] hover:bg-[#d9a306] text-black px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-yellow-500/20"
                  >
                    {t('nav.dashboard')}
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('user');
                      setUser(null);
                      navigate('/');
                    }}
                    className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'}`}
                    title="Déconnexion"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className={`px-4 py-2 text-sm font-bold border rounded-full transition-all hover:bg-yellow-500/10 ${theme === 'dark' ? 'border-white/20 text-white' : 'border-slate-300 text-slate-700'
                      }`}
                  >
                    {t('nav.login')}
                  </button>

                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-[#eab308] hover:bg-[#d9a306] text-black px-5 py-2 rounded-full text-sm font-extrabold transition-all hover:scale-105 shadow-lg shadow-yellow-500/20"
                  >
                    {t('nav.start_now') || 'Commencer'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Global Page Header */}
      <div className="pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title={t('market.title')}
            subtitle={t('market.subtitle')}
            emojiType="MARKET"
            illustrationVariant="market"
          />
          <MarketTicker />
        </div>
      </div>

      {/* Hero Section */}
      <header className="pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[#eab308] text-xs font-bold mb-6 animate-pulse uppercase tracking-wider">
            <span>🚀</span> {t('hero.badge')}
          </div>
          <h1 className={`text-5xl md:text-7xl font-extrabold mb-8 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-white via-white to-yellow-500' : 'from-slate-900 via-slate-800 to-yellow-600'
            }`}>
            {t('hero.title')}
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pricing" className="w-full sm:w-auto px-8 py-4 bg-[#eab308] hover:bg-[#d9a306] text-black rounded-xl font-black transition-all shadow-lg shadow-yellow-500/25">
              🚀 {t('hero.start')}
            </a>
            <button
              onClick={() => navigate('/learning')}
              className={`w-full sm:w-auto px-8 py-4 border rounded-xl font-bold transition-all ${theme === 'dark'
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-900 shadow-sm'
                }`}
            >
              {t('hero.masterclass')}
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div onClick={() => navigate('/dashboard')} className={`cursor-pointer p-8 rounded-2xl border transition-colors group ${theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-sm'
              }`}>
              <Illustration type="assistant" className="mb-6" />
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon name="assistant" color="#60a5fa" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('features.assistant')}</h3>
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{t('features.assistant_desc')}</p>
            </div>
            <div onClick={() => navigate('/dashboard')} className={`cursor-pointer p-8 rounded-2xl border transition-colors group ${theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-sm'
              }`}>
              <Illustration type="news" className="mb-6" />
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon name="news" color="#34d399" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('features.signals')}</h3>
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{t('features.signals_desc')}</p>
            </div>
            <div onClick={() => navigate('/academy')} className={`cursor-pointer p-8 rounded-2xl border transition-colors group ${theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-sm'
              }`}>
              <Illustration type="academy" className="mb-6" />
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon name="academy" color="#a78bfa" />
              </div>
              <h3 className="text-xl font-bold mb-4">{t('features.academy')}</h3>
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{t('features.academy_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose TradeSense AI */}
      <section id="why" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className={`md:col-start-2 p-8 rounded-2xl border shadow-2xl ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}>
              <h3 className="text-2xl font-bold mb-6">{t('features.why_title')}</h3>
              <Illustration type="platform" className="mb-6" />
              <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="flex items-start gap-3"><span className="text-emerald-400 text-lg leading-none">✔</span><span>{t('features.why_1')}</span></div>
                <div className="flex items-start gap-3"><span className="text-emerald-400 text-lg leading-none">✔</span><span>{t('features.why_2')}</span></div>
                <div className="flex items-start gap-3"><span className="text-emerald-400 text-lg leading-none">✔</span><span>{t('features.why_3')}</span></div>
                <div className="flex items-start gap-3"><span className="text-emerald-400 text-lg leading-none">✔</span><span>{t('features.why_4')}</span></div>
                <div className="flex items-start gap-3"><span className="text-emerald-400 text-lg leading-none">✔</span><span>{t('features.why_5')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('pricing.title')}</h2>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{t('pricing.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CHALLENGE_TIERS.map((tier) => (
              <div key={tier.name} className={`relative p-8 rounded-3xl backdrop-blur-sm border flex flex-col h-full transition-all hover:shadow-2xl ${theme === 'dark' ? 'bg-black/40 border-white/10 hover:shadow-yellow-500/10' : 'bg-white border-slate-200 hover:shadow-slate-200'
                }`}>
                {tier.name === 'Pro' && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#eab308] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase">{t('pricing.popular')}</span>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-4xl font-black mb-6 text-[#eab308]">{tier.price}</div>
                <div className="space-y-4 mb-10 flex-grow">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>{t('pricing.capital')}</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>${tier.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>{t('pricing.profit_target')}</span>
                    <span className="font-bold text-emerald-500">10% (${(tier.balance * 0.1).toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>{t('pricing.max_daily_loss')}</span>
                    <span className="font-bold text-red-500">5%</span>
                  </div>
                  <div className={`space-y-3 pt-6 border-t text-left ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    {tier.features.map(f => {
                      const featureKeyMap: { [key: string]: string } = {
                        'Accès IA basique': 'pricing.features.ai_basic',
                        'Support 24/7': 'pricing.features.support',
                        'Levier 1:10': 'pricing.features.leverage_10',
                        'Accès IA Avancé': 'pricing.features.ai_advanced',
                        'Signaux Prioritaires': 'pricing.features.ai_advanced',
                        'Levier 1:20': 'pricing.features.leverage_20',
                        'MasterClass Incluse': 'pricing.features.masterclass',
                        'Mentorat 1-on-1': 'pricing.features.mentor',
                        'Accès Early-stage': 'pricing.features.early_access',
                        'Levier 1:50': 'pricing.features.leverage_50',
                        'Frais Réduits': 'pricing.features.low_fees'
                      };
                      return (
                        <div key={f} className={`flex items-center gap-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          <span className="text-[#eab308]">✓</span> {featureKeyMap[f] ? t(featureKeyMap[f]) : f}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/checkout?tier=${tier.name}`)}
                  className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${theme === 'dark' ? 'bg-slate-50 text-slate-950 hover:bg-white' : 'bg-slate-900 text-white hover:bg-black'
                    }`}
                >
                  {t('pricing.choose')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-12 opacity-50 uppercase tracking-widest">{t('social.trust')}</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40">
            <span className="text-2xl font-bold">BINANCE</span>
            <span className="text-2xl font-bold">TRADINGVIEW</span>
            <span className="text-2xl font-bold">YFINANCE</span>
            <span className="text-2xl font-bold">METATRADER</span>
          </div>
        </div>
      </section>

      <footer className={`py-12 border-t text-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-6 h-6 bg-[#eab308] rounded flex items-center justify-center font-bold text-black text-xs">TS</div>
          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>TradeSense <span className="text-[#eab308]">AI</span></span>
        </div>
        <p className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400 text-sm'}>{t('footer.copy')}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
