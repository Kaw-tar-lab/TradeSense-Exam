
import { GoogleGenAI, Type } from "@google/genai";
import { AISignal, MarketData } from "../types";

// Manual fallback for API Key to ensure it works even if env loading fails
const FALLBACK_KEY = "YOUR_API_KEY_HERE";
const getApiKey = () => {
  try {
    return (import.meta as any).env.VITE_GEMINI_API_KEY || FALLBACK_KEY;
  } catch (e) {
    return FALLBACK_KEY;
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getAISignals = async (marketData: MarketData[]): Promise<AISignal[]> => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") return [];

  try {
    const prompt = `En tant qu'assistant de trading expert pour TradeSense AI, analyse les données de marché suivantes et fournis des signaux de trading (Achat/Vente/Neutre) pour chaque actif.
    Données: ${JSON.stringify(marketData)}
    
    Réponds uniquement au format JSON valide.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "BUY, SELL, or NEUTRAL" },
              asset: { type: Type.STRING },
              confidence: { type: Type.NUMBER, description: "0 to 1" },
              reason: { type: Type.STRING },
              stopLoss: { type: Type.NUMBER },
              takeProfit: { type: Type.NUMBER }
            },
            required: ["type", "asset", "confidence", "reason", "stopLoss", "takeProfit"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const getAIChatResponse = async (userMessage: string, context: any): Promise<string> => {
  const apiKey = getApiKey();
  const asset = context?.selectedAsset?.symbol || "the market";
  const msg = userMessage.toLowerCase();
  
  // Fallback for demo if no API key is provided
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Expert Simulator: Provide dynamic technical-sounding responses even in demo mode
    if (msg.includes("buy") || msg.includes("achat")) {
      return `Analysis for ${asset}: Bullish momentum detected on the M15 timeframe. RSI is at 62, suggesting room for further upside. However, ensure your Stop Loss is placed below the recent swing low for proper risk management.`;
    }
    if (msg.includes("sell") || msg.includes("vendre")) {
      return `Market update for ${asset}: Bearish pressure is mounting near the resistance zone. Volume profile shows high selling interest. If you enter a short position, targets should be aligned with the next major liquidity level.`;
    }
    if (msg.includes("risk") || msg.includes("risque")) {
      return `Risk Report: Your current equity is $${context?.challenge?.equity?.toLocaleString() || '---'}. To pass this challenge, I recommend a maximum risk of 0.5% per trade. Avoid high-impact news events scheduled for later today.`;
    }
    if (msg.includes("hello") || msg.includes("hey") || msg.includes("hi")) {
      return `Hello! I am monitoring ${asset} for you. Would you like a technical breakdown, a risk evaluation of your current balance, or a specific trade plan for this asset?`;
    }
    
    return `I am currently in Expert Simulator mode. Regarding ${asset}: I see a consolidated range. In a real setup with your API Key, I would provide a deep neural-link analysis of the order book and sentiment. What specific technical metric should I simulate for you?`;
  }

  try {
    const prompt = `Vous êtes TradeSense AI Assistant, un expert en trading et gestion des risques pour les traders africains.
    CONTEXTE ACTUEL (Challenge/Marché): ${JSON.stringify(context)}
    MESSAGE UTILISATEUR: ${userMessage}
    
    Répondez de manière concise, technique et encourageante. Si l'utilisateur demande des conseils de trading, basez-vous sur le contexte fourni.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Désolé, je ne peux pas répondre pour le moment.";
  } catch (error) {
    console.error("AIChat Error:", error);
    return "Erreur de connexion avec l'IA. Veuillez vérifier votre clé API.";
  }
};
