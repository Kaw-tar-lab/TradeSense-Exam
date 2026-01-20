import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, LineSeries, CandlestickSeries, IChartApi, ISeriesApi, UTCTimestamp, CandlestickData } from 'lightweight-charts';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface TradingChartProps {
  symbol: string;
  price: number;
  timeframe: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, price, timeframe }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const maFastRef = useRef<ISeriesApi<"Line"> | null>(null);
  const maSlowRef = useRef<ISeriesApi<"Line"> | null>(null);
  const candlesRef = useRef<CandlestickData[]>([]);
  const [chartReady, setChartReady] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;
    let cancelled = false;
    let handleResize: (() => void) | null = null;

    const attemptInit = (retry = 0) => {
      if (cancelled) return;
      try {
        const width = container.clientWidth;
        if (!width && retry < 10) {
          setTimeout(() => attemptInit(retry + 1), 100);
          return;
        }
        const chart = createChart(container, {
          width: width || 600,
          height: 400,
          layout: {
            background: { color: darkMode ? '#0f172a' : '#ffffff' },
            textColor: darkMode ? '#94a3b8' : '#334155',
          },
          grid: {
            vertLines: { color: darkMode ? '#1e293b' : '#e2e8f0' },
            horzLines: { color: darkMode ? '#1e293b' : '#e2e8f0' },
          },
          crosshair: { mode: CrosshairMode.Normal },
          timeScale: { timeVisible: true, secondsVisible: false },
        });
        chartRef.current = chart;

        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#ef4444',
          borderUpColor: '#10b981',
          borderDownColor: '#ef4444',
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });
        candleSeriesRef.current = candleSeries as any;

        const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
        const candles: CandlestickData[] = [];
        let prevClose = price || 100;

        // Determine interval in seconds based on timeframe prop
        const timeframeMap: Record<string, number> = {
          '1m': 60,
          '5m': 300,
          '15m': 900,
          '1h': 3600,
          '4h': 14400,
          '1D': 86400,
        };
        const intervalSeconds = timeframeMap[timeframe] || 900; // Default to 15m if not found

        for (let i = 0; i < 120; i++) {
          const t_val = (now - (120 - i) * intervalSeconds) as UTCTimestamp;
          const open = prevClose * (1 + (Math.random() - 0.5) * 0.004);
          const close = open * (1 + (Math.random() - 0.5) * 0.01);
          const high = Math.max(open, close) * (1 + Math.random() * 0.004);
          const low = Math.min(open, close) * (1 - Math.random() * 0.004);
          candles.push({ time: t_val, open, high, low, close });
          prevClose = close;
        }
        candlesRef.current = candles;
        candleSeriesRef.current?.setData(candles);

        const makeSMA = (arr: CandlestickData[], len: number) => {
          const out: { time: UTCTimestamp; value: number }[] = [];
          const closes = arr.map(c => c.close);
          for (let i = 0; i < arr.length; i++) {
            const start = Math.max(0, i - len + 1);
            const slice = closes.slice(start, i + 1);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            out.push({ time: arr[i].time as UTCTimestamp, value: avg });
          }
          return out;
        };

        maFastRef.current = chart.addSeries(LineSeries, { color: '#10b981', lineWidth: 2 }) as any;
        maSlowRef.current = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 2 }) as any;
        maFastRef.current.setData(makeSMA(candles, 20));
        maSlowRef.current.setData(makeSMA(candles, 50));

        handleResize = () => {
          if (chartRef.current && chartContainerRef.current) {
            chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth || width || 600 });
          }
        };
        window.addEventListener('resize', handleResize);

        setChartReady(true);
        setChartError(null);
      } catch (e: any) {
        console.error('TradingChart init error:', e);
        setChartError(`${t('trading_chart.chart_error')}${e?.message ? `: ${e.message}` : ''}`);
        setChartReady(false);
      }
    };

    attemptInit();

    return () => {
      cancelled = true;
      if (handleResize) window.removeEventListener('resize', handleResize);
      try {
        chartRef.current?.remove?.();
      } catch { }
    };
  }, [symbol, darkMode, timeframe]);

  // Update chart options when dark mode changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        layout: {
          background: { color: darkMode ? '#0f172a' : '#ffffff' },
          textColor: darkMode ? '#94a3b8' : '#334155',
        },
        grid: {
          vertLines: { color: darkMode ? '#1e293b' : '#e2e8f0' },
          horzLines: { color: darkMode ? '#1e293b' : '#e2e8f0' },
        },
      });
    }
  }, [darkMode]);

  useEffect(() => {
    if (candleSeriesRef.current && candlesRef.current.length && typeof price === 'number') {
      const last = candlesRef.current[candlesRef.current.length - 1];
      const updated: CandlestickData = {
        time: last.time,
        open: last.open,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
        close: price,
      };
      candlesRef.current[candlesRef.current.length - 1] = updated;
      candleSeriesRef.current.update(updated);

      const closes = candlesRef.current.map(c => c.close);
      const sma = (len: number) => {
        const start = Math.max(0, closes.length - len);
        const slice = closes.slice(start);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
      };
      maFastRef.current?.update({ time: updated.time as UTCTimestamp, value: sma(20) });
      maSlowRef.current?.update({ time: updated.time as UTCTimestamp, value: sma(50) });
    }
  }, [price]);

  return (
    <div className={`border rounded-xl overflow-hidden shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 border-b flex justify-between items-center backdrop-blur-md ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">📈</span> {symbol}
          </h3>
          <p className="text-xs text-slate-400">{t('trading_chart.live_feed')}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-emerald-400">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{t('trading_chart.candlesticks_mas')}</span>
        </div>
      </div>
      {chartError && (
        <div className="p-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20">
          {chartError}. {t('trading_chart.chart_error_retry')}
        </div>
      )}
      <div ref={chartContainerRef} className="h-[400px] w-full" />
    </div>
  );
};

export default TradingChart;
