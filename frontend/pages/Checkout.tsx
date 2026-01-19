
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useChallenge } from '../context/ChallengeContext';
import { CHALLENGE_TIERS, PREMIUM_PRODUCTS } from '../constants';
import { useLanguage } from '../context/LanguageContext';

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { startChallenge } = useChallenge();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    paypalEmail: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    walletAddress: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tierName = searchParams.get('tier');
  const productId = searchParams.get('product');

  const item = tierName 
    ? CHALLENGE_TIERS.find(t => t.name === tierName) 
    : PREMIUM_PRODUCTS.find(p => p.id === productId);

  // Fallback if nothing found
  const displayItem = item || CHALLENGE_TIERS[0];
  const isChallenge = !!tierName;

  const handlePayment = async () => {
    setLoading(true);
    // Simulate real gateway processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (isChallenge) {
      startChallenge(displayItem.name);
    }
    
    setLoading(false);
    setSuccess(true);
    
    // Auto-redirect after success message
    setTimeout(() => {
      navigate(isChallenge ? '/dashboard' : '/learning');
    }, 4000);
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.country;
  
  const isPaymentValid = () => {
    if (paymentMethod === 'PAYPAL') return paymentDetails.paypalEmail.includes('@');
    if (paymentMethod === 'CMI') return paymentDetails.cardNumber.length >= 16 && paymentDetails.expiry && paymentDetails.cvv;
    if (paymentMethod === 'CRYPTO') return paymentDetails.walletAddress.length > 20;
    return false;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.1)] animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <span className="text-4xl text-white">✓</span>
          </div>
          <h2 className="text-3xl font-black mb-4 text-white">Paiement Réussi !</h2>
          <p className="text-slate-400 mb-8">
            Félicitations ! Votre transaction a été approuvée. Vous allez être redirigé vers votre espace dans quelques secondes...
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full animate-progress-fast" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020617] pt-32 pb-20 px-4 text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-start">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#eab308] transition-colors">
            <span className={language === 'ar' ? 'rotate-180' : ''}>←</span> {t('back')}
          </button>
        </div>
        
        <h1 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
          {t('checkout.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Progress Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className={`p-4 rounded-xl border ${step === 1 ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${step === 1 ? 'border-blue-500' : 'border-slate-700'}`}>1</span>
                <span className="font-bold">{t('checkout.title')}</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${step === 2 ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${step === 2 ? 'border-blue-500' : 'border-slate-700'}`}>2</span>
                <span className="font-bold">{t('checkout.payment_method')}</span>
              </div>
            </div>

            {/* Order Summary in Sidebar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mt-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#eab308]">
                <span>📋</span> {t('checkout.order_summary')}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isChallenge ? t('checkout.selected_plan') : 'Produit'}</span>
                  <span className="font-bold">{displayItem.name}</span>
                </div>
                {isChallenge && 'balance' in displayItem && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('checkout.account_capital')}</span>
                    <span className="font-bold">${displayItem.balance.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold">{t('checkout.total_to_pay')}</span>
                  <span className="text-xl font-black text-white">{displayItem.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            {step === 1 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold mb-2">{t('checkout.title')}</h2>
                <p className="text-slate-400 mb-8">{t('checkout.subtitle')}</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('checkout.full_name')}</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('checkout.email')}</label>
                    <input
                      type="email"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">{t('checkout.phone')}</label>
                      <input
                        type="tel"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="+212 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">{t('checkout.country')}</label>
                      <input
                        type="text"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Maroc"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                      />
                    </div>
                  </div>

                  <button
                    disabled={!isFormValid}
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all mt-4"
                  >
                    {t('checkout.continue')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">{t('checkout.payment_method')}</h2>
                  <button onClick={() => { setStep(1); setPaymentMethod(null); }} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    {t('checkout.back_to_info')}
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 animate-pulse">{t('checkout.securing')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Method Selection */}
                    {!paymentMethod ? (
                      <div className="space-y-4">
                        <button
                          onClick={() => setPaymentMethod('PAYPAL')}
                          className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🅿️</span>
                            <span className="font-bold">PayPal</span>
                          </div>
                          <span className="text-slate-500">→</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('CMI')}
                          className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💳</span>
                            <span className="font-bold">Card / CMI (Maroc)</span>
                          </div>
                          <span className="text-slate-500">→</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('CRYPTO')}
                          className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">₿</span>
                            <span className="font-bold">Crypto (USDT/BTC)</span>
                          </div>
                          <span className="text-slate-500">→</span>
                        </button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* PayPal Inputs */}
                        {paymentMethod === 'PAYPAL' && (
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6 flex items-center gap-3">
                              <span className="text-xl">🅿️</span>
                              <div>
                                <p className="text-sm text-blue-400 font-bold">Système PayPal Sécurisé</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Connecté à TradeSense SuperAdmin</p>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email PayPal</label>
                              <input
                                type="email"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                                placeholder="votre-email@paypal.com"
                                value={paymentDetails.paypalEmail}
                                onChange={(e) => setPaymentDetails({...paymentDetails, paypalEmail: e.target.value})}
                              />
                            </div>
                            <div className="pt-2">
                              <p className="text-[10px] text-slate-500 italic">
                                * En cliquant sur Confirmer, vous serez dirigé vers l'API sécurisée configurée par nos administrateurs.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Card/CMI Inputs */}
                        {paymentMethod === 'CMI' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Numéro de Carte</label>
                              <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="**** **** **** ****"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Expiration</label>
                                <input
                                  type="text"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="MM/YY"
                                  value={paymentDetails.expiry}
                                  onChange={(e) => setPaymentDetails({...paymentDetails, expiry: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CVV</label>
                                <input
                                  type="password"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="***"
                                  value={paymentDetails.cvv}
                                  onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Crypto Inputs */}
                        {paymentMethod === 'CRYPTO' && (
                          <div className="space-y-4">
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
                              <p className="text-xs text-yellow-500">Envoyez exactement le montant en USDT (Network: TRC20) vers l'adresse ci-dessous.</p>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Votre Adresse de Portefeuille (Refund)</label>
                              <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="T..."
                                value={paymentDetails.walletAddress}
                                onChange={(e) => setPaymentDetails({...paymentDetails, walletAddress: e.target.value})}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-8 flex gap-3">
                          <button
                            onClick={() => setPaymentMethod(null)}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all"
                          >
                            Changer
                          </button>
                          <button
                            disabled={!isPaymentValid()}
                            onClick={handlePayment}
                            className="flex-[2] py-4 bg-gradient-to-r from-[#eab308] to-yellow-600 text-black rounded-xl font-black shadow-lg shadow-yellow-500/20 disabled:opacity-50 transition-all"
                          >
                            Confirmer & Payer
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-800/50 p-4 rounded-xl mt-4 flex gap-3 items-start">
                      <span className="text-blue-400">🛡️</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {t('checkout.secure_msg')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
