import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
}

interface DiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussionTitle: string;
  initialMessage: string;
}

const DiscussionModal: React.FC<DiscussionModalProps> = ({ 
  isOpen, 
  onClose, 
  discussionTitle, 
  initialMessage 
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'TraderPro2024',
      content: initialMessage,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      likes: 24
    },
    {
      id: '2',
      author: 'CryptoKing',
      content: 'Amazing setup! What timeframe were you looking at?',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      likes: 8
    },
    {
      id: '3',
      author: 'ScalpMaster',
      content: 'Looks like the 5-minute chart breakout. Did you use any specific indicators?',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      likes: 12
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    
    // Simulate network delay
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        author: 'You',
        content: newMessage,
        timestamp: new Date(),
        likes: 0
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setIsSending(false);
      
      // Simulate other users responding
      setTimeout(() => {
        const responses = [
          'Great insight! Which exchange did you use?',
          'Thanks for sharing! Did you set stop loss?',
          'Impressive gain! What was your risk/reward ratio?'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          author: ['TraderBot', 'MarketGuru', 'ProfitSeeker'][Math.floor(Math.random() * 3)],
          content: randomResponse,
          timestamp: new Date(),
          likes: Math.floor(Math.random() * 15)
        };
        
        setMessages(prev => [...prev, botMessage]);
      }, 2000 + Math.random() * 3000);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Header */}
        <div className={`sticky top-0 z-20 flex items-center justify-between p-4 border-b backdrop-blur-md ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-white/80'}`}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>🔥</span>
              {discussionTitle}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {messages.length} messages • Live discussion
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-grow p-4 overflow-y-auto max-h-[50vh] custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className="mb-4 group">
              <div className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-slate-800/50 hover:bg-slate-800/70' : 'bg-slate-50 hover:bg-slate-100'} transition-colors`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${message.author === 'You' ? 'bg-blue-500 text-white' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'}`}>
                  {message.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${message.author === 'You' ? 'text-blue-400' : darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                      {message.author}
                    </span>
                    <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {message.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <button className={`flex items-center gap-1 text-[11px] transition-colors ${darkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-500'}`}>
                      <span>👍</span>
                      <span>{message.likes}</span>
                    </button>
                    <button className={`text-[11px] transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-500 hover:text-green-500'}`}>
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex gap-2">
            <div className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`w-full bg-transparent outline-none resize-none text-sm ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'}`}
                rows={2}
                disabled={isSending}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className={`self-end px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                !newMessage.trim() || isSending
                  ? 'bg-slate-500 text-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Send
                </>
              )}
            </button>
          </div>
          <p className={`text-[10px] mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscussionModal;