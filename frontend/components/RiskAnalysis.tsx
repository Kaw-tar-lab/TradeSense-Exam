import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useChallenge } from '../context/ChallengeContext';

const RiskAnalysis: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { challenge } = useChallenge();

    const darkMode = theme === 'dark';
    const balance = challenge?.balance || 5000;
    const initialBalance = challenge?.startingBalance || 5000;

    // Calculate Drawdown
    const drawdown = initialBalance - balance;
    const drawdownPercent = (drawdown / initialBalance) * 100;
    const maxDrawdown = 10; // 10% max allowed usually

    // Mock Risk Metrics
    const riskMetrics = [
        { label: 'Exposition Margin', value: '12.5%', status: 'GOOD' },
        { label: 'Levier Actuel', value: '1:5', status: 'GOOD' },
        { label: 'Volatilité (1h)', value: 'High', status: 'WARNING' },
        { label: 'Sharpe Ratio', value: '1.45', status: 'GOOD' }
    ];

    return (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-xl">
                    ⚠️
                </div>
                <div>
                    <h3 className="text-lg font-bold">Analyse de Risque IA</h3>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Surveillance en temps réel de votre compte</p>
                </div>
            </div>

            {/* Main Health Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2 font-bold">
                    <span>Drawdown Actuel</span>
                    <span className={drawdownPercent > 5 ? 'text-red-500' : 'text-emerald-500'}>{drawdownPercent.toFixed(2)}% <span className="text-xs text-slate-500">/ 10% Max</span></span>
                </div>
                <div className="h-4 w-full bg-slate-700/30 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${drawdownPercent > 8 ? 'bg-red-500' :
                                drawdownPercent > 5 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                        style={{ width: `${Math.max(2, (drawdownPercent / maxDrawdown) * 100)}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    Vous êtes à {Math.max(0, 10 - drawdownPercent).toFixed(2)}% de la limite de perte autorisée.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {riskMetrics.map((metric, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">{metric.label}</p>
                        <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-lg">{metric.value}</span>
                            <div className={`w-2 h-2 rounded-full ${metric.status === 'GOOD' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Recommendation */}
            <div className={`p-4 rounded-xl border-l-4 ${darkMode ? 'bg-blue-500/10 border-l-blue-500' : 'bg-blue-50 border-l-blue-500'}`}>
                <h4 className="font-bold text-sm text-blue-500 mb-1">💡 Conseil IA</h4>
                <p className="text-sm opacity-80">
                    Votre exposition est saine. Attention cependant à la volatilité actuelle sur le BTC/USD qui pourrait augmenter votre drawdown rapidement. Réduisez la taille de vos lots de 20%.
                </p>
            </div>
        </div>
    );
};

export default RiskAnalysis;
