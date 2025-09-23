import { useState, useCallback } from "react";
import { parseCSVToRows } from "../utils/csvProcessor";
import { processFillsToTrades, computeKPIs } from "../utils/tradeCalculations";

export default function useTradeData() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trades, setTrades] = useState([]);
  const [kpis, setKpis] = useState({});
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  const handleFile = useCallback(async (file) => {
    setLoading(true);
    setProgress(5);
    try {
      const rows = await parseCSVToRows(file, (p) => setProgress(p));
      console.log("Parsed rows:", rows);
      setProgress(45);
      const fills = rows; // keep entire array of fills
      const processedTrades = processFillsToTrades(fills, {
        lotSize: 0.001,
        multiplier: 1,
      });
      setProgress(80);
      const summary = computeKPIs(processedTrades);
      setTrades(processedTrades);
      setKpis(summary);
      setProgress(100);
      // Clear any existing errors on success
      setError(null);
      setShowError(false);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message);
      setShowError(true);
      // Reset the trades and KPIs on error
      setTrades([]);
      setKpis({});
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }
  }, []);

  return {
    loading,
    progress,
    trades,
    kpis,
    handleFile,
    error,
    showError,
    setShowError,
    setError,
  };
}
