import React from "react";
import TradeTable from "./components/TradeTable";
import MetricsDashboard from "./components/MetricsDashboard.jsx";
import useTradeData from "./hooks/useTradeData";
import Loader from "./components/Loader";
import ErrorPopup from "./components/ErrorPopup";
import InitialBalanceModal from "./components/InitialBalanceModal";
import CumulativePnLChart from "./components/Charts/CumalativePnLChart";
import MonthlyPerformanceChart from "./components/Charts/MonthlyPerformaceChart";
import ProfitLossChart from "./components/Charts/ProfitLossChart";
import WinRateChart from "./components/Charts/WinRateChart";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const {
    loading,
    progress,
    trades,
    kpis,
    handleFile,
    clearData,
    fileName,
    error,
    showError,
    setShowError,
    setError,
    initialBalance,
    showBalanceModal,
    handleBalanceConfirm,
    handleBalanceCancel,
  } = useTradeData();

  const hasData = trades.length > 0;

  return (
    <React.Fragment>
      <ErrorPopup
        message={error}
        isVisible={showError}
        onClose={() => {
          setShowError(false);
          setError(null);
        }}
      />
      <InitialBalanceModal
        isVisible={showBalanceModal}
        onConfirm={handleBalanceConfirm}
        onCancel={handleBalanceCancel}
      />
      <Analytics />
      <div className="min-h-screen bg-background p-6">
        <header className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-6 rounded-xl shadow-sm border border-border/40">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                Delta Exchange Analytics Dashboard
              </h1>
              {fileName && (
                <p className="text-sm text-text-secondary mt-1">
                  Loaded: <span className="font-medium">{fileName}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    e.target.files && handleFile(e.target.files[0])
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 rounded-full border-0 text-sm font-semibold bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer transition-colors"
                >
                  {hasData ? "Upload New File" : "Upload File"}
                </label>
              </div>
              {hasData && !loading && (
                <button
                  onClick={clearData}
                  className="inline-flex items-center px-4 py-2 rounded-full border-0 text-sm font-semibold bg-red-500/20 text-red-600 hover:bg-red-500/30 cursor-pointer transition-colors"
                >
                  Clear Data
                </button>
              )}
              {loading && (
                <div className="w-48">
                  <Loader progress={progress} />
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto space-y-6 relative">
          {/* Blur Overlay when no data */}
          {!hasData && !loading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-start justify-center pt-10">
              <div className="text-center">
                <h3 className="text-xl  text-text-primary mb-2">
                  Upload &nbsp;
                  <span className="text-3xl font-semibold">
                    Delta Exchange Fill History
                  </span>
                  &nbsp;File
                </h3>
                <p className="text-text-secondary">
                  Select a CSV file to view your trading analytics
                </p>
              </div>
            </div>
          )}

          <section
            className={`rounded-xl shadow-sm ${!hasData ? "blur-sm" : ""}`}
          >
            <MetricsDashboard kpis={kpis} />
          </section>

          <section
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[500px] ${
              !hasData ? "blur-sm" : ""
            }`}
          >
            <div className="h-full bg-card rounded-xl border border-border/40">
              <CumulativePnLChart
                trades={trades.map((t) => ({
                  ...t,
                  netPnl: t.net_pnl,
                  exitTime: t.exit_time,
                }))}
                kpis={kpis}
              />
            </div>
            <div className="h-full bg-card rounded-xl border border-border/40">
              <ProfitLossChart
                trades={trades.map((t) => ({
                  ...t,
                  netPnl: t.net_pnl,
                  exitTime: t.exit_time,
                }))}
                kpis={kpis}
              />
            </div>
            <div className="h-full bg-card rounded-xl border border-border/40">
              <MonthlyPerformanceChart
                trades={trades.map((t) => ({
                  ...t,
                  netPnl: t.net_pnl,
                  exitTime: t.exit_time,
                }))}
              />
            </div>
            <div className="h-full bg-card rounded-xl border border-border/40">
              <WinRateChart
                trades={trades.map((t) => ({ ...t, netPnl: t.net_pnl }))}
              />
            </div>
          </section>

          <section
            className={`bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden ${
              !hasData ? "blur-sm" : ""
            }`}
          >
            <div className="p-6 border-b border-border/40">
              <h2 className="text-lg font-semibold text-text-primary">
                Trade History
              </h2>
              <p className="text-sm text-text-secondary">
                Detailed record of all trading activities
              </p>
            </div>
            <TradeTable trades={trades} />
          </section>
        </main>
      </div>
    </React.Fragment>
  );
}
