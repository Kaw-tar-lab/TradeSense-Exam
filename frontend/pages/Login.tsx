import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* import { loginUser } from '../services/api'; */ /* Ensure import is added or updated manually if needed, but here we assume it's available or we add it */

  // ... (inside component)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Real API Login
      const { loginUser } = await import('../services/api');
      const response = await loginUser(email, password);

      if (response.status === 'ok') {
        // Save user info
        localStorage.setItem('user', JSON.stringify(response.user));
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        alert('Erreur de connexion: ' + (response.error || 'Inconnue'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Erreur réseau ou mauvais identifiants');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="w-full max-w-md">
        {/* Logo / Back Link */}
        <div className="mb-8 flex flex-col items-center">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 text-sm mb-6 transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <span>←</span> {t('back')}
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#eab308] rounded-xl flex items-center justify-center font-bold text-black shadow-lg shadow-yellow-500/20 text-xl">TS</div>
            <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              TradeSense <span className="text-[#eab308]">AI</span>
            </span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('login.title')}
          </p>
        </div>

        {/* Login Card */}
        <div className={`p-8 rounded-2xl border shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('login.email_label')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-4 pr-4 py-3 rounded-xl border outline-none transition-all ${darkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]'
                    }`}
                  placeholder={t('login.email_placeholder')}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('login.password_label')}
                </label>
                <button type="button" className="text-xs text-[#eab308] hover:underline font-bold">
                  {t('login.forgot_password')}
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-4 pr-4 py-3 rounded-xl border outline-none transition-all ${darkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308]'
                    }`}
                  placeholder={t('login.password_placeholder')}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-[#eab308] focus:ring-[#eab308]"
              />
              <label htmlFor="remember" className={`ml-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('login.remember_me')}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-black transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${isLoading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-[#eab308] hover:bg-[#d9a306] text-black shadow-lg shadow-yellow-500/20'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {t('login.submitting')}
                </>
              ) : (
                t('login.submit_btn')
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('login.no_account')}
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              {t('login.signup.create_account')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
