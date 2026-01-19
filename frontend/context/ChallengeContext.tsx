
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserChallenge, ChallengeStatus, Trade, MarketData } from '../types';
import { startChallengeBackend, postTrade } from '../services/api';

interface ChallengeContextType {
  challenge: UserChallenge | null;
  startChallenge: (tierName: string) => void;
  executeTrade: (asset: MarketData, type: 'BUY' | 'SELL', amount: number) => void;
  closeTrade: (tradeId: string, currentPrice: number) => void;
  resetChallenge: () => void;
  updateEquity: (marketPrices: Record<string, number>) => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [challenge, setChallenge] = useState<UserChallenge | null>(() => {
    try {
      const saved = localStorage.getItem('trade_sense_challenge');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Defensive check for required fields to prevent crashes on corrupted/old localStorage data
      if (parsed && typeof parsed === 'object') {
        if (!Array.isArray(parsed.trades)) parsed.trades = [];
        if (typeof parsed.equity !== 'number') parsed.equity = parsed.currentBalance || 0;
        if (!parsed.status) parsed.status = ChallengeStatus.ACTIVE;
        return parsed as UserChallenge;
      }
      return null;
    } catch (e) {
      console.error('Error parsing saved challenge:', e);
      return null;
    }
  });
  const [backendChallengeId, setBackendChallengeId] = useState<number | null>(() => {
    const saved = localStorage.getItem('trade_sense_backend_challenge_id');
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    if (challenge) {
      localStorage.setItem('trade_sense_challenge', JSON.stringify(challenge));
    } else {
      localStorage.removeItem('trade_sense_challenge');
    }
  }, [challenge]);

  useEffect(() => {
    if (backendChallengeId) {
      localStorage.setItem('trade_sense_backend_challenge_id', String(backendChallengeId));
    } else {
      localStorage.removeItem('trade_sense_backend_challenge_id');
    }
  }, [backendChallengeId]);

  const startChallenge = async (tierName: string) => {
    const balanceMap: Record<string, number> = { 'Starter': 5000, 'Pro': 25000, 'Elite': 100000 };
    const balance = balanceMap[tierName] || 5000;
    
    const newChallenge: UserChallenge = {
      id: Math.random().toString(36).substr(2, 9),
      tier: tierName as any,
      initialBalance: balance,
      currentBalance: balance,
      equity: balance,
      status: ChallengeStatus.ACTIVE,
      maxDailyLoss: balance * 0.05,
      maxTotalLoss: balance * 0.10,
      profitTarget: balance * 0.10,
      dailyStartingEquity: balance,
      trades: [],
      startDate: Date.now()
    };
    setChallenge(newChallenge);
    try {
      // Simple user_id mock = 1; replace with real auth user id later
      const backend = await startChallengeBackend(1, balance);
      setBackendChallengeId(backend.id);
    } catch (err) {
      console.error('Backend start challenge error:', err);
    }
  };

  const executeTrade = async (asset: MarketData, type: 'BUY' | 'SELL', size: number) => {
    if (!challenge || challenge.status !== ChallengeStatus.ACTIVE) return;

    const entryPrice = typeof asset.price === 'number' && !isNaN(asset.price) ? asset.price : 0;
    if (entryPrice <= 0) {
      console.warn('Cannot execute trade with zero or invalid price');
      return;
    }

    const newTrade: Trade = {
      id: Math.random().toString(36).slice(2, 11),
      asset: asset.symbol,
      type,
      entryPrice: entryPrice,
      size: size,
      pnl: 0,
      timestamp: Date.now(),
      status: 'OPEN'
    };

    // Update state synchronously for immediate UI feedback
    setChallenge(prev => {
      if (!prev) return null;
      const currentTrades = Array.isArray(prev.trades) ? prev.trades : [];
      return {
        ...prev,
        trades: [...currentTrades, newTrade]
      };
    });

    // Send to backend for official record and killer rules evaluation
    if (backendChallengeId && typeof backendChallengeId === 'number') {
      try {
        await postTrade(backendChallengeId, {
          ticker: asset.symbol,
          quantity: size,
          price: entryPrice,
          side: type.toLowerCase() as 'buy' | 'sell',
        });
      } catch (err) {
        console.error('Backend trade error:', err);
        // We don't throw here to avoid crashing the UI if the backend is down
      }
    }
  };

  const closeTrade = (tradeId: string, currentPrice: number) => {
    setChallenge(prev => {
      if (!prev || !Array.isArray(prev.trades)) return prev;
      
      const trades = prev.trades.map(trade => {
        if (trade.id === tradeId && trade.status === 'OPEN') {
          const entry = trade.entryPrice || 0;
          const size = trade.size || 0;
          const pnl = trade.type === 'BUY' 
            ? (currentPrice - entry) * size 
            : (entry - currentPrice) * size;
          return { ...trade, exitPrice: currentPrice, pnl: isNaN(pnl) ? 0 : pnl, status: 'CLOSED' as const };
        }
        return trade;
      });

      const closedTrade = trades.find(t => t.id === tradeId);
      const profitContribution = closedTrade && typeof closedTrade.pnl === 'number' ? closedTrade.pnl : 0;
      const newBalance = (prev.currentBalance || 0) + profitContribution;

      return {
        ...prev,
        trades,
        currentBalance: newBalance,
        equity: newBalance // Simplified for MVP
      };
    });
  };

  const updateEquity = useCallback((marketPrices: Record<string, number>) => {
    if (!marketPrices) return;

    setChallenge(prev => {
      if (!prev || prev.status !== ChallengeStatus.ACTIVE) return prev;

      let unrealizedPnl = 0;
      const trades = Array.isArray(prev.trades) ? prev.trades : [];
      
      trades.forEach(trade => {
        if (trade.status === 'OPEN') {
          const currentPrice = marketPrices[trade.asset];
          if (typeof currentPrice === 'number' && !isNaN(currentPrice)) {
            unrealizedPnl += trade.type === 'BUY' 
              ? (currentPrice - trade.entryPrice) * trade.size 
              : (trade.entryPrice - currentPrice) * trade.size;
          }
        }
      });

      const currentEquity = prev.currentBalance + unrealizedPnl;
      
      // Ensure we don't have NaN values
      if (isNaN(currentEquity)) return prev;

      const dailyStartingEquity = typeof prev.dailyStartingEquity === 'number' ? prev.dailyStartingEquity : prev.initialBalance;
      const dailyLoss = dailyStartingEquity - currentEquity;
      const totalLoss = prev.initialBalance - currentEquity;
      const profit = currentEquity - prev.initialBalance;

      let newStatus = ChallengeStatus.ACTIVE;
      if (dailyLoss >= prev.maxDailyLoss || totalLoss >= prev.maxTotalLoss) {
        newStatus = ChallengeStatus.FAILED;
      } else if (profit >= prev.profitTarget) {
        newStatus = ChallengeStatus.PASSED;
      }

      return {
        ...prev,
        equity: currentEquity,
        status: newStatus
      };
    });
  }, []);

  const resetChallenge = () => setChallenge(null);

  return (
    <ChallengeContext.Provider value={{ 
      challenge, 
      startChallenge, 
      executeTrade, 
      closeTrade, 
      resetChallenge,
      updateEquity
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (!context) throw new Error('useChallenge must be used within ChallengeProvider');
  return context;
};
