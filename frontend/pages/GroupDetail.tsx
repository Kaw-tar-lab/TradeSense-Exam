import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/visual/PageHeader';
import TradingIcon from '../components/icons/TradingIcon';

const GroupDetail: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('chat');
    const [messages, setMessages] = useState([
        { user: 'John Doe', time: '10:42', content: "Quelqu'un a vu le volume sur SPY ce matin ?" },
        { user: 'Alice Smith', time: '10:45', content: "Oui, grosse mèche de rejet sur le H1. Je reste prudent." }
    ]);
    const [input, setInput] = useState('');
    const [feedItems] = useState([
        { id: 1, author: 'Admin', time: '2h', content: 'Analyse technique de la semaine : Supports majeurs à surveiller.', likes: 45, comments: 12 },
        { id: 2, author: 'TradingBot', time: '4h', content: 'Signal d\'achat détecté sur BTC/USD (H4). RSI survendu.', likes: 89, comments: 34 }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        setMessages([...messages, { user: 'Moi', time: timeString, content: input }]);
        setInput('');
    };

    const groupName = decodeURIComponent(groupId || 'Groupe Inconnu');

    // Mock data based on group name logic or static map
    const getGroupInfo = (name: string) => {
        if (name.includes('Crypto')) return { members: 324, desc: "Stratégies intraday crypto et risk management", tag: "Crypto" };
        if (name.includes('Swing')) return { members: 198, desc: "Swing trading actions & indices", tag: "Actions" };
        if (name.includes('Tech')) return { members: 256, desc: "Surveillance des résultats tech et plays post-earnings", tag: "Tech" };
        if (name.includes('Macro')) return { members: 173, desc: "Analyse macro, CPI/FOMC, SPY/QQQ", tag: "Indices" };
        return { members: 0, desc: "Groupe de trading communautaire", tag: "Général" };
    };

    const info = getGroupInfo(groupName);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <button onClick={() => navigate(-1)} className="mb-4 text-sm text-slate-400 hover:text-white flex items-center gap-1">
                    ← Retour
                </button>

                <PageHeader
                    title={groupName}
                    subtitle={`${info.members} membres • ${info.desc}`}
                    emojiType="COMMUNITY"
                    illustrationVariant="network"
                />

                <div className="flex items-center gap-4 mb-6 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'feed' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Fil d'actualité
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        Chat en direct
                    </button>
                </div>

                {activeTab === 'chat' ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl h-[600px] flex flex-col">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <span className="font-bold text-sm">#général</span>
                            <span className="text-xs text-green-400 flex items-center gap-1">● {Math.floor(info.members * 0.15)} en ligne</span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.user === 'Moi' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.user === 'Moi' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                        {msg.user.charAt(0)}
                                    </div>
                                    <div className={msg.user === 'Moi' ? 'text-right' : ''}>
                                        <div className={`flex items-baseline gap-2 ${msg.user === 'Moi' ? 'justify-end' : ''}`}>
                                            <span className="font-bold text-sm">{msg.user}</span>
                                            <span className="text-[10px] text-slate-500">{msg.time}</span>
                                        </div>
                                        <p className={`text-sm p-2 rounded-lg mt-1 ${msg.user === 'Moi' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/50 text-slate-300 rounded-tl-none'}`}>
                                            {msg.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={`Envoyer un message dans #${groupName.toLowerCase().replace(/\s/g, '-')}`}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors">
                                    <TradingIcon kind="buy" size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                            {feedItems.map(post => (
                                <div key={post.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">{post.author[0]}</div>
                                            <div>
                                                <span className="font-bold text-sm block">{post.author}</span>
                                                <span className="text-[10px] text-slate-500">{post.time}</span>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-white">•••</button>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-3">{post.content}</p>
                                    <div className="flex gap-4 text-xs text-slate-500">
                                        <span className="cursor-pointer hover:text-blue-400">❤️ {post.likes}</span>
                                        <span className="cursor-pointer hover:text-blue-400">💬 {post.comments}</span>
                                        <span className="cursor-pointer hover:text-blue-400">↗️ Partager</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupDetail;
