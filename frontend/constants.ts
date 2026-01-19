
export const CHALLENGE_TIERS = [
  {
    name: 'Starter',
    price: '200 DH',
    balance: 5000,
    dailyLoss: 0.05,
    totalLoss: 0.10,
    profitTarget: 0.10,
    features: ['Accès IA basique', 'Support 24/7', 'Levier 1:10']
  },
  {
    name: 'Pro',
    price: '500 DH',
    balance: 25000,
    dailyLoss: 0.05,
    totalLoss: 0.10,
    profitTarget: 0.10,
    features: ['Accès IA Avancé', 'Signaux Prioritaires', 'Levier 1:20', 'MasterClass Incluse']
  },
  {
    name: 'Elite',
    price: '1000 DH',
    balance: 100000,
    dailyLoss: 0.05,
    totalLoss: 0.10,
    profitTarget: 0.10,
    features: ['Mentorat 1-on-1', 'Accès Early-stage', 'Levier 1:50', 'Frais Réduits']
  }
];

export const PREMIUM_PRODUCTS = [
  {
    id: 'ebook-scalping',
    name: 'Master Scalping Ebook',
    price: '150 DH',
    description: 'The ultimate guide to dominate the order book (PDF)'
  },
  {
    id: 'dubai-seminar',
    name: 'Dubai Private Seminar 2024',
    price: '2500 DH',
    description: 'Institutional strategies and fund management (4K)'
  }
];

export const INITIAL_MARKET_DATA = [
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 65000.42, change: 120.5, changePercent: 0.18, type: 'CRYPTO' },
  { symbol: 'ETH-USD', name: 'Ethereum', price: 3450.12, change: -15.4, changePercent: -0.44, type: 'CRYPTO' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 2.3, changePercent: 1.2, type: 'STOCK_US' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.20, change: -4.1, changePercent: -2.3, type: 'STOCK_US' },
  { symbol: 'IAM', name: 'Maroc Telecom', price: 98.45, change: 0.25, changePercent: 0.25, type: 'STOCK_MA' },
  { symbol: 'ATW', name: 'Attijariwafa Bank', price: 455.00, change: 1.5, changePercent: 0.33, type: 'STOCK_MA' },
];
