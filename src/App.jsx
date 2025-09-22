import React from "react";
import TradeTable from "./components/TradeTable";
import MetricsDashboard from "./components/MetricsDashboard.jsx";
import useTradeData from "./hooks/useTradeData";
import Loader from "./components/Loader";
import CumulativePnLChart from "./components/Charts/CumalativePnLChart";
import MonthlyPerformanceChart from "./components/Charts/MonthlyPerformaceChart";
import ProfitLossChart from "./components/Charts/ProfitLossChart";
import WinRateChart from "./components/Charts/WinRateChart";

export default function App() {
  const { loading, progress, trades, kpis, handleFile } = useTradeData();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Delta Exchange Trade History Analyzer ---ChatGPT
        </h1>
      </header>

      <main className="max-w-6xl mx-auto">
        <section className="mb-4 flex gap-4 items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="border rounded p-2"
          />
          {loading && (
            <div className="w-1/2">
              <Loader progress={progress} />
            </div>
          )}
        </section>

        <MetricsDashboard kpis={kpis} />

        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CumulativePnLChart
            trades={trades.map((t) => ({
              ...t,
              netPnl: t.net_pnl,
              exitTime: t.exit_time,
            }))}
          />
          <ProfitLossChart
            trades={trades.map((t) => ({
              ...t,
              netPnl: t.net_pnl,
              exitTime: t.exit_time,
            }))}
          />
          <MonthlyPerformanceChart
            trades={trades.map((t) => ({
              ...t,
              netPnl: t.net_pnl,
              exitTime: t.exit_time,
            }))}
          />
          <WinRateChart
            trades={trades.map((t) => ({ ...t, netPnl: t.net_pnl }))}
          />
        </section>

        <section className="mt-6">
          <TradeTable trades={trades} />
        </section>
      </main>
    </div>
  );
}
