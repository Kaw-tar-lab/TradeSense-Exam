import axios from 'axios';

// Make API base URL dynamic to support access from other devices on the LAN.
// If VITE_API_BASE_URL is provided, use it; otherwise, infer from current hostname.
const HOST = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
const isProd = import.meta.env.PROD;
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || (isProd ? 'https://tradesense-exam.onrender.com/api' : `http://${HOST}:5000/api`);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const getPrice = async (ticker: string) => {
  const { data } = await api.get(`/price/${encodeURIComponent(ticker)}`);
  return data as { ticker: string; price: number; time: string };
};

export const getSignal = async (ticker: string) => {
  const { data } = await api.get(`/signals/${encodeURIComponent(ticker)}`);
  return data as { ticker: string; price: number; signal: 'BUY' | 'SELL' | 'NEUTRAL'; time: string };
};

export interface LeaderboardItem {
  user_id: number;
  name: string;
  pct_profit: number;
  sum_profit: number;
}

export const getLeaderboard = async () => {
  const { data } = await api.get('/leaderboard');
  return data as LeaderboardItem[];
};

export const startChallengeBackend = async (userId: number, startingBalance: number) => {
  const { data } = await api.post('/challenges/start', {
    user_id: userId,
    starting_balance: startingBalance,
  });
  return data as { id: number; user_id: number; starting_balance: number; status: string };
};

export const postTrade = async (
  challengeId: number,
  payload: { ticker: string; quantity: number; price: number; side: 'buy' | 'sell' }
) => {
  const { data } = await api.post(`/challenges/${challengeId}/trade`, payload);
  return data as {
    id: number;
    challenge_id: number;
    ticker: string;
    quantity: number;
    price: number;
    side: 'buy' | 'sell';
    profit: number;
    timestamp: string;
  };
};

export const getChallengeStatus = async (challengeId: number) => {
  const { data } = await api.get(`/challenges/${challengeId}/status`);
  return data as { id: number; user_id: number; status: string; starting_balance: number; created_at: string };
};