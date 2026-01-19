
export enum ChallengeStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  FAILED = 'FAILED'
}

export interface Trade {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  pnl: number;
  timestamp: number;
  status: 'OPEN' | 'CLOSED';
}

export interface UserChallenge {
  id: string;
  tier: 'Starter' | 'Pro' | 'Elite';
  initialBalance: number;
  currentBalance: number;
  equity: number;
  status: ChallengeStatus;
  maxDailyLoss: number;
  maxTotalLoss: number;
  profitTarget: number;
  dailyStartingEquity: number;
  trades: Trade[];
  startDate: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'CRYPTO' | 'STOCK_US' | 'STOCK_MA';
}

export interface AISignal {
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  asset: string;
  confidence: number;
  reason: string;
  stopLoss: number;
  takeProfit: number;
}
