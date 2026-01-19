import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import AIBadge from '../components/badges/AIBadge';
import TradingIcon from '../components/icons/TradingIcon';
import PageHeader from '../components/visual/PageHeader';

const Community: React.FC = () => {
  const [tab, setTab] = useState<'groupes' | 'chat'>('groupes');
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { user: 'Alice', time: 'il y a 5 min', content: 'Quelqu’un suit BTC aujourd’hui? Volatilité en hausse.' },
    { user: 'George', time: 'il y a 3 min', content: 'Oui, scalps sur les retours au VWAP, attention aux wick.' },
    { user: 'Julia', time: 'il y a 1 min', content: 'Je prépare un play sur NVDA post-earnings, idées bienvenues.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: 'Moi', time: 'à l\'instant', content: input }]);
    setInput('');
  };

  const handleInvite = () => {
    navigator.clipboard.writeText('https://tradesense.app/join/community');
    alert('Lien d\'invitation copié !');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#eab308] transition-colors">
            <span className="text-lg">←</span> Retour
          </button>
        </div>
        <PageHeader
          title="Communauté"
          subtitle="Groupes & chat des traders"
          emojiType="COMMUNITY"
          illustrationVariant="network"
        />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TradingIcon kind="achievement" size={20} />
            Communauté
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('groupes')}
              className={`text-sm px-3 py-1.5 rounded border transition-colors ${tab === 'groupes' ? 'bg-[#eab308] border-[#eab308] text-black font-bold' : 'bg-[#0c1322] border-slate-700 text-slate-400 hover:text-white'}`}
            >Groupes</button>
            <button
              onClick={() => setTab('chat')}
              className={`text-sm px-3 py-1.5 rounded border transition-colors ${tab === 'chat' ? 'bg-[#eab308] border-[#eab308] text-black font-bold' : 'bg-[#0c1322] border-slate-700 text-slate-400 hover:text-white'}`}
            >Chat</button>
            <button
              onClick={handleInvite}
              className="text-sm px-3 py-1.5 rounded border border-slate-700 bg-[#0c1322] hover:bg-slate-800 text-slate-300 transition-colors"
            >Inviter +</button>
          </div>
        </div>

        {tab === 'groupes' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm text-slate-400">Rejoignez des groupes thématiques, partagez vos stratégies et apprenez des autres.</p>
              <AIBadge variant="strategy" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <GroupCard name="Crypto Scalpers" members={324} description="Stratégies intraday crypto et risk management" tag="Crypto" />
              <GroupCard name="Swing Titans" members={198} description="Swing trading actions & indices" tag="Actions" />
              <GroupCard name="Tech Earnings Watch" members={256} description="Surveillance des résultats tech et plays post-earnings" tag="Tech" />
              <GroupCard name="Macro & Indices" members={173} description="Analyse macro, CPI/FOMC, SPY/QQQ" tag="Indices" />
              <GroupCard name="Options Lab" members={142} description="Découverte et stratégies options (débutants à avancés)" tag="Options" />
              <GroupCard name="AI Quant" members={88} description="Backtests, signaux IA, et recherche quantitative" tag="Recherche" />
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div>
            <p className="text-sm text-slate-400 mb-3">Chat communautaire (placeholder). Fonctionnalités temps réel à venir.</p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-slate-800 text-[12px] text-slate-400">#général</div>
              <div className="p-4 space-y-3 text-[13px] h-[400px] overflow-y-auto flex flex-col-reverse">
                {[...messages].reverse().map((msg, idx) => (
                  <div key={idx}>
                    <span className="font-bold">{msg.user}</span>
                    <span className="text-slate-500 text-[11px] ml-2">{msg.time}</span>
                    <p className="text-slate-300">{msg.content}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Écrire un message..."
                />
                <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded font-bold">
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;