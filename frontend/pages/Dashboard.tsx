import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TradingChart from '../components/TradingChart';
import { useChallenge } from '../context/ChallengeContext';
import { INITIAL_MARKET_DATA } from '../constants';
import { MarketData, ChallengeStatus } from '../types';
import { getPrice } from '../services/api';
import SignalsPanel from '../components/SignalsPanel';
import TradeButtons from '../components/TradeButtons';
import Leaderboard from '../components/Leaderboard';
import BalanceStatus from '../components/BalanceStatus';
import Notifications, { NotificationItem } from '../components/Notifications';
import NewsHub from '../components/NewsHub';
import CommunityZone from '../components/CommunityZone';
import PageHeader from '../components/visual/PageHeader';
import Modal from '../components/Modal';
import AIChat from '../components/AIChat';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const { challenge, executeTrade, closeTrade, updateEquity, resetChallenge } = useChallenge();
  const [markets, setMarkets] = useState<MarketData[]>(INITIAL_MARKET_DATA);
  const [selectedAsset, setSelectedAsset] = useState<MarketData>(INITIAL_MARKET_DATA[0]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Auto-remove notifications after 5 seconds to prevent UI blocking
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(0, prev.length - 1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const [tradeSize, setTradeSize] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Positions' | 'News' | 'Social' | 'Leaderboard' | 'Alerts'>('Positions');

  // Seed one system notification to avoid empty panel in dev/demo
  useEffect(() => {
    setNotifications(prev => prev.length > 0 ? prev : [{
      id: 'welcome',
      type: 'INFO',
      message: t('dashboard.welcome_msg'),
      time: Date.now()
    }]);
  }, [t]);

  // Poll selected asset price via backend every 10s
  useEffect(() => {
    let mounted = true;
    const pollSelected = async () => {
      try {
        const data = await getPrice(selectedAsset.symbol);
        if (!mounted || data.price == null) return;

        setMarkets(prev => {
          return prev.map(m => m.symbol === selectedAsset.symbol ? {
            ...m,
            change: (data.price - m.price),
            changePercent: m.price ? ((data.price - m.price) / m.price) * 100 : 0,
            price: data.price,
          } : m);
        });
      } catch (err) {
        console.error('Price polling error:', err);
      }
    };
    pollSelected();
    const id = setInterval(pollSelected, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, [selectedAsset.symbol]);

  // Update selectedAsset when markets change
  useEffect(() => {
    const current = markets.find(m => m.symbol === selectedAsset.symbol);
    if (current && current.price !== selectedAsset.price) {
      setSelectedAsset(current);
    }

    // Update equity based on latest market prices
    const pricesMap: Record<string, number> = {};
    markets.forEach(m => pricesMap[m.symbol] = m.price);
    updateEquity(pricesMap);
  }, [markets, selectedAsset.symbol, updateEquity]);

  // Toggle dashboard-specific background and dark/light mode on body
  useEffect(() => {
    const baseClass = darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900';
    document.body.className = `${baseClass} dashboard-theme`;

    return () => {
      document.body.classList.remove('dashboard-theme');
    };
  }, [darkMode]);

  if (!challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-3xl font-bold mb-2">{t('dashboard.no_active')}</h2>
        <p className="text-slate-400 mb-6 max-w-md">{t('dashboard.no_active_desc')}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all mb-8"
        >
          {t('dashboard.view_plans')}
        </button>
        {/* Preview NewsHub even without active challenge to validate UI and API calls */}
        <div className="w-full max-w-3xl">
          <NewsHub />
          <CommunityZone />
        </div>
      </div>
    );
  }

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    if (!selectedAsset || isNaN(tradeSize) || tradeSize <= 0 || !challenge) return;

    try {
      setIsProcessing(true);
      // Removed the 400ms delay to ensure immediate and stable state transitions
      await executeTrade(selectedAsset, type, tradeSize);

      setNotifications(prev => ([
        {
          id: Math.random().toString(36).slice(2),
          type: 'SUCCESS',
          message: `${type === 'BUY' ? 'BUY' : 'SELL'} ${selectedAsset.symbol} x${tradeSize} ${t('dashboard.trade_executed')}`,
          time: Date.now()
        },
        ...prev
      ]));
    } catch (err) {
      console.error('Trade execution error:', err);
      setNotifications(prev => ([
        { id: Math.random().toString(36).slice(2), type: 'ERROR', message: `Trade error: ${err instanceof Error ? err.message : 'Unknown'}`, time: Date.now() },
        ...prev
      ]));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-transparent text-slate-100' : 'bg-slate-50/90 text-slate-900'} flex flex-col transition-colors duration-300`}>

      {/* Top Navbar */}
      <nav className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-[#eab308] rounded-lg flex items-center justify-center font-bold text-black shadow-lg shadow-yellow-500/20">TS</div>
            <span className="text-lg font-black tracking-tighter">TradeSense <span className="text-[#eab308]">AI</span></span>
          </div>
          <div className="hidden md:flex h-8 w-px bg-slate-800 mx-2" />
          <div className="hidden lg:flex items-center gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <BalanceStatus />
          <div className="hidden md:block h-8 w-px bg-slate-800 mx-2" />
          <button
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/');
            }}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${darkMode ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'}`}
          >
            {t('dashboard.logout') || 'Déconnexion'}
          </button>
        </div>
      </nav>

      <div className="flex flex-grow overflow-hidden">
        {/* Left Sidebar - Market Watch */}
        <aside className={`w-80 border-r hidden xl:flex flex-col ${darkMode ? 'border-slate-800 bg-[#0c1322]' : 'border-slate-200 bg-white'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t('dashboard.markets')}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black uppercase animate-pulse">Live</span>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {markets.map(m => (
              <button
                key={m.symbol}
                onClick={() => setSelectedAsset(m)}
                className={`w-full p-4 flex justify-between items-center border-b transition-all ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'
                  } ${selectedAsset.symbol === m.symbol ? (darkMode ? 'bg-[#eab308]/10 border-r-4 border-r-[#eab308]' : 'bg-blue-50 border-r-4 border-r-blue-500') : ''}`}
              >
                <div className="text-left">
                  <p className="font-bold text-sm leading-tight">{m.symbol}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{m.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">${m.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className={`text-[10px] font-bold ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {m.change >= 0 ? '▲' : '▼'} {Math.abs(m.changePercent).toFixed(2)}%
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className={`p-4 border-t transition-colors duration-300 ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('dashboard.challenge_status')}</span>
              {challenge.status !== ChallengeStatus.ACTIVE && (
                <button onClick={resetChallenge} className="text-[10px] text-[#eab308] font-black underline uppercase">{t('dashboard.new_challenge')}</button>
              )}
            </div>
            <div className={`text-xs w-full px-3 py-2 rounded-xl border flex items-center justify-center gap-2 font-black uppercase tracking-tighter shadow-sm transition-all ${challenge.status === ChallengeStatus.ACTIVE ? (darkMode ? 'bg-[#eab308]/10 border-[#eab308]/20 text-[#eab308]' : 'bg-[#eab308]/20 border-[#eab308]/30 text-yellow-700') :
                challenge.status === ChallengeStatus.PASSED ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') :
                  (darkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600')
              }`}>
              <div className={`w-2 h-2 rounded-full bg-current ${challenge.status === ChallengeStatus.ACTIVE ? 'animate-ping' : ''}`} />
              {challenge.status}
            </div>
          </div>
        </aside>

        {/* Main Terminal View */}
        <main className={`flex-grow flex flex-col overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>

          {/* Header & Chart Top Controls */}
          <div className={`px-6 py-4 flex items-center justify-between border-b transition-colors duration-300 ${darkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg text-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>{selectedAsset.symbol.includes('BTC') ? '₿' : '📈'}</div>
              <div>
                <h1 className="text-lg font-black leading-tight">{selectedAsset.symbol} <span className={`font-medium text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>/ USD</span></h1>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-bold">${selectedAsset.price.toLocaleString()}</span>
                  <span className={darkMode ? 'text-slate-600' : 'text-slate-400'}>Vol: 1.2M</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex p-1 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-slate-800/50 border-white/5' : 'bg-slate-200 border-slate-300'}`}>
                {['1m', '5m', '15m', '1h', '4h', '1D'].map(tf => (
                  <button key={tf} className={`px-3 py-1 text-[10px] font-black rounded transition-all ${tf === '15m' ? 'bg-[#eab308] text-black shadow-lg shadow-yellow-500/20' : (darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>{tf}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col p-4 overflow-y-auto space-y-4 custom-scrollbar">

            {/* Primary Grid: Chart & Order Entry */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[500px]">
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className={`flex-grow border rounded-2xl overflow-hidden relative group transition-colors duration-300 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <TradingChart symbol={selectedAsset.symbol} price={selectedAsset.price} />
                </div>
              </div>

              <div className="space-y-4">
                {/* Order Entry */}
                <div className={`border rounded-2xl p-4 shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className={`flex items-center gap-2 mb-4 border-b pb-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <span className="text-xs font-black uppercase text-slate-500">Execution</span>
                  </div>
                  <TradeButtons
                    tradeSize={tradeSize}
                    setTradeSize={setTradeSize}
                    canTrade={challenge.status === ChallengeStatus.ACTIVE}
                    isProcessing={isProcessing}
                    onBuy={() => handleTrade('BUY')}
                    onSell={() => handleTrade('SELL')}
                  />
                  {challenge.status !== ChallengeStatus.ACTIVE && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center uppercase tracking-tighter">
                      {challenge.status === ChallengeStatus.FAILED ? t('dashboard.failed_reason') : t('dashboard.passed_reason')}
                    </div>
                  )}
                </div>

                {/* AI Assistant Quick Access */}
                <div
                  onClick={() => setActiveModal('IA_CHAT')}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all group ${darkMode ? 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/20' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 shadow-sm'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">🤖</div>
                    <div>
                      <h4 className={`text-sm font-black uppercase ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Chat AI</h4>
                      <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expert Technical Analysis</p>
                    </div>
                  </div>
                  <div className={`h-1 w-full rounded-full mt-2 overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-indigo-200'}`}>
                    <div className="h-full bg-indigo-500 animate-pulse w-3/4" />
                  </div>
                </div>

                {/* Status Widgets */}
                <div className="grid grid-cols-2 gap-2">
                  <div onClick={() => setActiveModal('SIGNALS')} className={`border p-3 rounded-xl cursor-pointer transition-all text-center ${darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
                    <div className="text-lg mb-1">📡</div>
                    <div className="text-[10px] font-black uppercase text-slate-500">{t('dashboard.signals')}</div>
                  </div>
                  <div onClick={() => setActiveModal('RISK_ALERT')} className={`border p-3 rounded-xl cursor-pointer transition-all text-center ${darkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
                    <div className="text-lg mb-1">⚠️</div>
                    <div className="text-[10px] font-black uppercase text-slate-500">Risk</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Positions & Tabs */}
            <div className={`border rounded-2xl overflow-hidden flex flex-col min-h-[400px] transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className={`flex border-b transition-colors duration-300 ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                {(['Positions', 'News', 'Social', 'Leaderboard', 'Alerts'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-[#eab308] text-[#eab308] bg-[#eab308]/5' : (darkMode ? 'border-transparent text-slate-500 hover:text-slate-300' : 'border-transparent text-slate-400 hover:text-slate-600')
                      }`}
                  >
                    {tab === 'Social' ? t('dashboard.community') : tab === 'Alerts' ? t('dashboard.notifications') : tab}
                  </button>
                ))}
              </div>

              <div className="flex-grow overflow-x-auto p-4">
                {activeTab === 'Positions' && (
                  <table className="w-full text-left text-xs">
                    <thead className={`uppercase font-black tracking-tighter transition-colors duration-300 ${darkMode ? 'text-slate-500 bg-slate-950/30' : 'text-slate-400 bg-slate-100/50'}`}>
                      <tr>
                        <th className="p-4">{t('dashboard.asset')}</th>
                        <th className="p-4">{t('dashboard.type')}</th>
                        <th className="p-4">{t('dashboard.entry')}</th>
                        <th className="p-4">Size</th>
                        <th className="p-4">{t('dashboard.pnl')}</th>
                        <th className="p-4 text-right">{t('dashboard.action')}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors duration-300 ${darkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                      {challenge.trades.filter(trade => trade && trade.status === 'OPEN').map(trade => {
                        let currentPrice = trade.entryPrice || 0;
                        const marketAsset = markets.find(m => m.symbol === trade.asset);
                        if (marketAsset) currentPrice = marketAsset.price;

                        const entry = trade.entryPrice || 0;
                        const size = trade.size || 0;
                        const pnl = trade.type === 'BUY' ? (currentPrice - entry) * size : (entry - currentPrice) * size;
                        const safePnl = isNaN(pnl) ? 0 : pnl;

                        return (
                          <tr key={trade.id || Math.random()} className={`transition-colors group ${darkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50'}`}>
                            <td className={`p-4 font-black ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{trade.asset}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {trade.type}
                              </span>
                            </td>
                            <td className={`p-4 font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>${entry.toFixed(2)}</td>
                            <td className={`p-4 font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>x{size}</td>
                            <td className={`p-4 font-mono font-black text-sm ${safePnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${safePnl >= 0 ? '+' : ''}{safePnl.toFixed(2)}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => trade.id && closeTrade(trade.id, currentPrice)}
                                className={`px-4 py-1.5 rounded-lg font-bold transition-all active:scale-90 shadow-xl border ${darkMode ? 'bg-slate-800 hover:bg-red-600 text-white border-slate-700 hover:border-red-500' : 'bg-slate-100 hover:bg-red-600 hover:text-white border-slate-200 hover:border-red-500 text-slate-700'}`}
                              >
                                {t('dashboard.close')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {challenge.trades.filter(t => t.status === 'OPEN').length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-30">
                              <div className="text-4xl">📂</div>
                              <div className="font-black uppercase tracking-widest text-xs">{t('dashboard.no_positions')}</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === 'News' && <NewsHub minimized={false} />}
                {activeTab === 'Social' && <CommunityZone minimized={false} />}
                {activeTab === 'Leaderboard' && <Leaderboard minimized={false} />}
                {activeTab === 'Alerts' && <Notifications items={notifications} />}
              </div>
            </div>
          </div>
        </main>

        {/* Floating Notifications (Top Center - below Navbar) */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full pointer-events-none px-4">
          <div className="pointer-events-auto">
            <Notifications items={notifications.slice(0, 3)} />
          </div>
        </div>
      </div>


      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'NEWS' ? t('dashboard.news_hub') :
            activeModal === 'SIGNALS' ? t('dashboard.signals') :
              activeModal === 'LEADERBOARD' ? t('dashboard.leaderboard') :
                activeModal === 'COMMUNITY' ? t('dashboard.community') :
                  activeModal === 'IA_CHAT' ? t('dashboard.ia_chat') :
                    activeModal?.replace('_', ' ')
        }
        darkMode={darkMode}
      >
        {activeModal === 'NEWS' && <NewsHub minimized={false} />}
        {activeModal === 'SIGNALS' && <SignalsPanel tickers={markets.map(m => m.symbol)} minimized={false} />}
        {activeModal === 'LEADERBOARD' && <Leaderboard minimized={false} />}
        {activeModal === 'COMMUNITY' && <CommunityZone minimized={false} />}
        {activeModal === 'IA_CHAT' && (
          <AIChat
            darkMode={darkMode}
            contextData={{
              challenge,
              selectedAsset,
              marketCount: markets.length
            }}
          />
        )}

        {/* Placeholder content for other modals */}
        {['RISK_ALERT', 'STRATEGY', 'ALERT'].includes(activeModal || '') && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <h4 className="font-bold text-lg mb-2">{t('dashboard.modal_details')} {activeModal?.replace('_', ' ')}</h4>
              <p className="text-sm text-slate-400">{t('dashboard.modal_analysis')} {activeModal}.</p>
              <div className="mt-4 h-32 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="mt-2 space-y-2">
                <div className="h-4 w-3/4 bg-slate-800/50 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-800/50 rounded animate-pulse" />
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-colors">
              {t('dashboard.close_btn')}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;