import React, { useState, useRef, useEffect } from 'react';
import { getAIChatResponse } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import TradingIcon from './icons/TradingIcon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: number;
}

interface AIChatProps {
  contextData: any;
  darkMode?: boolean;
}

const AIChat: React.FC<AIChatProps> = ({ contextData, darkMode = true }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your TradeSense AI Assistant. How can I help you with your trades today?', time: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'fr' ? 'fr-FR' : (language === 'ar' ? 'ar-SA' : 'en-US');
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', content: textToSend, time: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    if (!customInput) setInput('');
    setIsTyping(true);

    try {
      const response = await getAIChatResponse(textToSend, contextData);
      const aiMsg: Message = { role: 'assistant', content: response, time: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      if (isCalling) speak(response);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real app, we'd use MediaRecorder and Speech-to-Text
    // For this demo, we simulate a voice recognition after 3s
    setTimeout(() => {
      setIsRecording(false);
      const simulatedText = "How is the BTC trend today?";
      handleSend(simulatedText);
    }, 3000);
  };

  if (isCalling) {
    return (
      <div className="flex flex-col h-[500px] rounded-2xl border overflow-hidden bg-slate-900 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.2)] animate-in zoom-in duration-500">
        <div className="flex-grow flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
          {/* Animated Ripples */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 bg-blue-500/10 rounded-full animate-ping" />
            <div className="absolute w-48 h-48 bg-blue-500/5 rounded-full animate-ping [animation-delay:0.5s]" />
          </div>

          <div className="relative">
            <div className={`w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center bg-slate-800 shadow-2xl transition-transform duration-500 ${isSpeaking ? 'scale-110 border-emerald-500 shadow-emerald-500/20' : ''}`}>
              <TradingIcon kind="assistant" size={60} color={isSpeaking ? "#10b981" : "#3b82f6"} />
            </div>
            {isSpeaking && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            )}
          </div>

          <div className="text-center z-10">
            <h3 className="text-xl font-black text-white mb-2">TradeSense AI Voice</h3>
            <p className="text-blue-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">
              {isSpeaking ? 'Assistant is speaking...' : 'Listening to your environment...'}
            </p>
          </div>

          {/* Audio Visualizer Mock */}
          <div className="flex gap-1 h-8 items-center">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${isSpeaking ? 'animate-h-random' : 'h-1 opacity-30'}`}
                style={{ height: isSpeaking ? `${Math.random() * 100}%` : '4px' }}
              />
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-950/50 flex justify-center gap-6">
          <button 
            onClick={() => { window.speechSynthesis.cancel(); setIsCalling(false); }}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 transition-all active:scale-90"
          >
            <span className="text-2xl text-white">✕</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[500px] rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TradingIcon kind="assistant" size={24} color="white" />
          </div>
          <div>
            <h3 className="font-black text-sm">TradeSense AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active • Expert Mode</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsCalling(true)}
          className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform inline-block">📞</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-transparent custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : (darkMode ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700' : 'bg-slate-100 text-slate-800 rounded-bl-none')
            }`}>
              {msg.content}
              <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {msg.role === 'assistant' && (
                <button 
                  onClick={() => speak(msg.content)}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-2xl rounded-bl-none flex gap-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex gap-2">
          <button 
            onClick={startRecording}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
          <input
            type="text"
            className={`flex-grow px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              darkMode ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-900'
            }`}
            placeholder="Ask anything about the market..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <span className="text-lg">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
