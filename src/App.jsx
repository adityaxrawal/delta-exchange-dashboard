import React from "react";
import TradeTable from "./components/TradeTable";
import MetricsDashboard from "./components/MetricsDashboard.jsx";
import useTradeData from "./hooks/useTradeData";
import Loader from "./components/Loader";
import ErrorPopup from "./components/ErrorPopup";
import InitialBalanceModal from "./components/InitialBalanceModal";
import FileUploadModal from "./components/FileUploadModal";
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
    handleUploadClick,
    handleFilesConfirm,
    handleFileUploadCancel,
    clearData,
    fileName,
    assetHistoryFileName,
    error,
    showError,
    setShowError,
    setError,
    initialBalance,
    showBalanceModal,
    showFileUploadModal,
    handleBalanceConfirm,
    handleBalanceCancel,
    suggestedBalance,
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
      <FileUploadModal
        isVisible={showFileUploadModal}
        onConfirm={handleFilesConfirm}
        onCancel={handleFileUploadCancel}
      />
      <InitialBalanceModal
        isVisible={showBalanceModal}
        onConfirm={handleBalanceConfirm}
        onCancel={handleBalanceCancel}
        suggestedBalance={suggestedBalance}
      />
      <Analytics />
      <div className="min-h-screen bg-background py-6">
        <header className="max-w-[1400px] mx-auto mb-8 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-6 rounded-xl shadow-sm border border-border/40">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                Delta Exchange Analytics Dashboard
              </h1>
              {fileName && (
                <p className="text-sm text-text-secondary mt-1">
                  Fill History: <span className="font-medium">{fileName}</span>
                </p>
              )}
              {assetHistoryFileName && (
                <p className="text-sm text-text-secondary mt-1">
                  Asset History:{" "}
                  <span className="font-medium">{assetHistoryFileName}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-0 text-sm font-semibold bg-primary text-black font-semibold hover:bg-primary/90 cursor-pointer transition-all shadow-lg shadow-primary/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {hasData ? "Upload New Files" : "Upload Files"}
              </button>
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

        <main className="max-w-[1400px] mx-auto space-y-6 relative px-6">
          {/* Blur Overlay when no data */}
          {!hasData && !loading && (
            <div
              onClick={handleUploadClick}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-start justify-center pt-10 cursor-pointer hover:bg-background/85 transition-colors"
            >
              <div className="text-center max-w-2xl mx-auto px-6">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 mx-auto text-primary/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  Upload Trading Data Files
                </h3>
                <p className="text-text-secondary mb-6">
                  Click anywhere to select both your Fill History and Asset
                  History CSV files from Delta Exchange
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-text-secondary bg-card px-4 py-2 rounded-lg border border-border/40">
                  <svg
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Both files are required for accurate balance calculations
                </div>
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
            <TradeTable trades={trades} kpis={kpis} />
          </section>
        </main>
      </div>
    </React.Fragment>
  );
}
