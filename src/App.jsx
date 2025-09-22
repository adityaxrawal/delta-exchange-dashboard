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
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Delta Exchange Analytics Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {loading && (
              <div className="w-48">
                <Loader progress={progress} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <MetricsDashboard kpis={kpis} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[500px]">
          <div className="h-full">
            <CumulativePnLChart
              trades={trades.map((t) => ({
                ...t,
                netPnl: t.net_pnl,
                exitTime: t.exit_time,
              }))}
            />
          </div>
          <div className="h-full">
            <ProfitLossChart
              trades={trades.map((t) => ({
                ...t,
                netPnl: t.net_pnl,
                exitTime: t.exit_time,
              }))}
            />
          </div>
          <div className="h-full">
            <MonthlyPerformanceChart
              trades={trades.map((t) => ({
                ...t,
                netPnl: t.net_pnl,
                exitTime: t.exit_time,
              }))}
            />
          </div>
          <div className="h-full">
            <WinRateChart
              trades={trades.map((t) => ({ ...t, netPnl: t.net_pnl }))}
            />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Trade History
            </h2>
            <p className="text-sm text-gray-500">
              Detailed record of all trading activities
            </p>
          </div>
          <TradeTable trades={trades} />
        </section>
      </main>
    </div>
  );
}
