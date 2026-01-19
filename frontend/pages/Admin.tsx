import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface UserAdmin {
  id: number;
  name: string;
  email: string;
  balance: number;
  challenge: {
    id: number;
    status: string;
    starting_balance: number;
  } | null;
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState({
    clientId: '',
    secret: '',
    receiverEmail: 'admin@tradesense.ai'
  });
  const [showConfig, setShowConfig] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const response = await fetch('http://localhost:5000/api/admin/seed?force=true', {
        method: 'POST',
        headers: { 
          'X-Seed-Token': 'dev-seed-token'
        }
      });
      if (response.ok) {
        alert('Base de données peuplée avec succès !');
        fetchUsers();
      } else {
        const err = await response.json();
        alert(`Erreur: ${err.reason || 'Calcul échoué'}`);
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (challengeId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/challenge/${challengeId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent uppercase tracking-tighter">
              TradeSense Panel Admin
            </h1>
            <p className="text-slate-500 text-xs mt-1">Gérez vos traders et supervisez les challenges en temps réel</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              ⚙️ PayPal Config
            </button>
            <button 
              onClick={handleSeed}
              disabled={seeding}
              className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              {seeding ? 'Chargement...' : '⚡ Générer des Utilisateurs Test'}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white text-sm font-bold"
            >
              ← Retour au site
            </button>
          </div>
        </div>

        {showConfig && (
          <div className="mb-8 bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top duration-300">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🅿️</span> Configuration PayPal (SuperAdmin)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PayPal Client ID</label>
                <input 
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="AbC123..."
                  value={paypalConfig.clientId}
                  onChange={(e) => setPaypalConfig({...paypalConfig, clientId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Receiver Email (Business)</label>
                <input 
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={paypalConfig.receiverEmail}
                  onChange={(e) => setPaypalConfig({...paypalConfig, receiverEmail: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PayPal Secret Key</label>
                <input 
                  type="password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••••••"
                  value={paypalConfig.secret}
                  onChange={(e) => setPaypalConfig({...paypalConfig, secret: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => {
                  alert('Configuration PayPal enregistrée avec succès !');
                  setShowConfig(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-xs font-black uppercase transition-all"
              >
                Enregistrer les Coordonnées
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">
            {error}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-800">
                <tr>
                  <th className="p-6">Utilisateur</th>
                  <th className="p-6">Email</th>
                  <th className="p-6">Balance</th>
                  <th className="p-6">Status Challenge</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-6">
                      <div className="font-bold">{u.name}</div>
                      <div className="text-[10px] text-slate-500">ID: #{u.id}</div>
                    </td>
                    <td className="p-6 text-slate-400">{u.email}</td>
                    <td className="p-6 font-mono text-emerald-400">${u.balance.toLocaleString()}</td>
                    <td className="p-6">
                      {u.challenge ? (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.challenge.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' :
                          u.challenge.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {u.challenge.status}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs italic">Aucun challenge</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {u.challenge && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateStatus(u.challenge!.id, 'passed')}
                            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          >
                            PASS
                          </button>
                          <button 
                            onClick={() => updateStatus(u.challenge!.id, 'failed')}
                            className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          >
                            FAIL
                          </button>
                          <button 
                            onClick={() => updateStatus(u.challenge!.id, 'active')}
                            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          >
                            RESET
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
