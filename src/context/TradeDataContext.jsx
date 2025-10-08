// src/context/TradeDataContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { parseCSVToRows } from "../utils/csvProcessor";
import { processFillsToTrades, computeKPIs } from "../utils/tradeCalculations";
import {
  parseAssetHistoryCSV,
  extractFinancialSummary,
} from "../utils/assetHistoryProcessor";

const TradeDataContext = createContext();

const LOCALSTORAGE_KEY = "delta_exchange_csv_data";
const LOCALSTORAGE_FILENAME_KEY = "delta_exchange_csv_filename";
const LOCALSTORAGE_INITIAL_BALANCE_KEY = "delta_exchange_initial_balance";
const LOCALSTORAGE_ASSET_HISTORY_KEY = "delta_exchange_asset_history";

export const useTradeData = () => {
  const context = useContext(TradeDataContext);
  if (!context) {
    throw new Error("useTradeData must be used within a TradeDataProvider");
  }
  return context;
};

export const TradeDataProvider = ({ children }) => {
  // Core data state
  const [trades, setTrades] = useState([]);
  const [kpis, setKpis] = useState({});
  const [assetHistory, setAssetHistory] = useState(null);

  // File metadata
  const [fileName, setFileName] = useState(null);
  const [assetHistoryFileName, setAssetHistoryFileName] = useState(null);
  const [initialBalance, setInitialBalance] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);

  // Temporary state for file processing
  const [pendingFiles, setPendingFiles] = useState({
    fillHistory: null,
    assetHistory: null,
  });
  const [suggestedBalance, setSuggestedBalance] = useState(null);

  // Process data function
  const processData = useCallback(
    (fills, filename, balance = null, assetHistoryData = null) => {
      try {
        let balanceToUse = balance !== null ? balance : initialBalance;
        let assetHistoryToUse =
          assetHistoryData !== null ? assetHistoryData : assetHistory;

        if (assetHistoryToUse && assetHistoryToUse.length > 0) {
          const summary = extractFinancialSummary(assetHistoryToUse);
          balanceToUse = summary.initial_balance;
          console.log(
            "Using initial balance from Asset History:",
            balanceToUse
          );
        }

        const processedTrades = processFillsToTrades(fills, {
          multiplier: 1,
          initialBalance: balanceToUse,
          assetHistory: assetHistoryToUse,
        });

        const summary = computeKPIs(
          processedTrades,
          balanceToUse,
          assetHistoryToUse
        );

        setTrades(processedTrades);
        setKpis(summary);

        // Save to localStorage
        try {
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(fills));
          if (filename) {
            localStorage.setItem(LOCALSTORAGE_FILENAME_KEY, filename);
          }
          if (balanceToUse) {
            localStorage.setItem(
              LOCALSTORAGE_INITIAL_BALANCE_KEY,
              String(balanceToUse)
            );
          }
          if (assetHistoryToUse) {
            localStorage.setItem(
              LOCALSTORAGE_ASSET_HISTORY_KEY,
              JSON.stringify(assetHistoryToUse)
            );
          }
        } catch (storageErr) {
          console.error("Failed to save to localStorage:", storageErr);
        }

        setFileName(filename);
        setInitialBalance(balanceToUse);
        setAssetHistory(assetHistoryToUse);
      } catch (err) {
        console.error("Error processing data:", err);
        setError(`Failed to process trade data: ${err.message}`);
        setShowError(true);
      }
    },
    [initialBalance, assetHistory]
  );

  // Load from localStorage on mount
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(LOCALSTORAGE_KEY);
      const savedFileName = localStorage.getItem(LOCALSTORAGE_FILENAME_KEY);
      const savedBalance = localStorage.getItem(
        LOCALSTORAGE_INITIAL_BALANCE_KEY
      );
      const savedAssetHistory = localStorage.getItem(
        LOCALSTORAGE_ASSET_HISTORY_KEY
      );

      let assetHistoryData = null;
      let assetHistoryName = null;

      if (savedAssetHistory) {
        try {
          assetHistoryData = JSON.parse(savedAssetHistory);
          assetHistoryName = "Asset History (from storage)";
          setAssetHistory(assetHistoryData);
          setAssetHistoryFileName(assetHistoryName);
        } catch (parseErr) {
          console.error("Failed to parse saved asset history:", parseErr);
        }
      }

      if (savedData) {
        setLoading(true);
        const rows = JSON.parse(savedData);
        console.log("Loading data from localStorage:", rows.length, "rows");

        // Process the loaded data with saved balance and asset history
        let balanceToUse = null;
        if (assetHistoryData && assetHistoryData.length > 0) {
          const summary = extractFinancialSummary(assetHistoryData);
          balanceToUse = summary.initial_balance;
        } else if (savedBalance) {
          balanceToUse = parseFloat(savedBalance);
        }

        if (balanceToUse && balanceToUse > 0) {
          processData(rows, savedFileName, balanceToUse, assetHistoryData);
        } else {
          console.warn("No valid initial balance found in localStorage");
        }

        setLoading(false);
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
      // Clear corrupted data
      localStorage.removeItem(LOCALSTORAGE_KEY);
      localStorage.removeItem(LOCALSTORAGE_FILENAME_KEY);
      localStorage.removeItem(LOCALSTORAGE_INITIAL_BALANCE_KEY);
      localStorage.removeItem(LOCALSTORAGE_ASSET_HISTORY_KEY);
    }
  }, [processData]);

  // Open file upload modal
  const handleUploadClick = useCallback(() => {
    setShowFileUploadModal(true);
  }, []);

  // Handle file upload
  const handleFilesConfirm = useCallback(
    async ({ fillHistory, assetHistory: assetHistoryFile }) => {
      setShowFileUploadModal(false);
      setLoading(true);
      setProgress(0);

      try {
        // Parse Fill History
        if (!fillHistory) {
          throw new Error("Fill History file is required");
        }

        const fillHistoryRows = await parseCSVToRows(fillHistory, (prog) => {
          setProgress(prog * 0.5);
        });

        // Parse Asset History if provided
        let assetHistoryData = null;
        let assetHistoryName = null;

        if (assetHistoryFile) {
          assetHistoryData = await parseAssetHistoryCSV(
            assetHistoryFile,
            (prog) => {
              setProgress(50 + prog * 0.5);
            }
          );
          assetHistoryName = assetHistoryFile.name;
          setAssetHistory(assetHistoryData);
          setAssetHistoryFileName(assetHistoryName);

          // Extract initial balance from asset history
          const summary = extractFinancialSummary(assetHistoryData);
          setSuggestedBalance(summary.initial_balance);
        }

        setProgress(100);

        // If we have asset history with deposits, process immediately
        if (assetHistoryData && assetHistoryData.length > 0) {
          const summary = extractFinancialSummary(assetHistoryData);
          if (summary.initial_balance > 0) {
            processData(
              fillHistoryRows,
              fillHistory.name,
              summary.initial_balance,
              assetHistoryData
            );
            setLoading(false);
            return;
          }
        }

        // Otherwise, show balance modal
        setPendingFiles({
          fillHistory: { rows: fillHistoryRows, name: fillHistory.name },
          assetHistory: assetHistoryData,
        });
        setShowBalanceModal(true);
        setLoading(false);
      } catch (err) {
        console.error("Error processing files:", err);
        setError(`Failed to process files: ${err.message}`);
        setShowError(true);
        setLoading(false);
        setProgress(0);
      }
    },
    [processData]
  );

  const handleFileUploadCancel = useCallback(() => {
    setShowFileUploadModal(false);
  }, []);

  const handleBalanceConfirm = useCallback(
    (balance) => {
      setShowBalanceModal(false);
      if (pendingFiles.fillHistory) {
        processData(
          pendingFiles.fillHistory.rows,
          pendingFiles.fillHistory.name,
          balance,
          pendingFiles.assetHistory
        );
        setPendingFiles({ fillHistory: null, assetHistory: null });
      }
    },
    [pendingFiles, processData]
  );

  const handleBalanceCancel = useCallback(() => {
    setShowBalanceModal(false);
    setPendingFiles({ fillHistory: null, assetHistory: null });
  }, []);

  const clearData = useCallback(() => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    localStorage.removeItem(LOCALSTORAGE_FILENAME_KEY);
    localStorage.removeItem(LOCALSTORAGE_INITIAL_BALANCE_KEY);
    localStorage.removeItem(LOCALSTORAGE_ASSET_HISTORY_KEY);
    setTrades([]);
    setKpis({});
    setFileName(null);
    setAssetHistory(null);
    setAssetHistoryFileName(null);
    setInitialBalance(null);
  }, []);

  // Computed values
  const hasData = trades.length > 0;

  const value = {
    // Core data
    trades,
    kpis,
    assetHistory,

    // Metadata
    fileName,
    assetHistoryFileName,
    initialBalance,

    // UI state
    loading,
    progress,
    error,
    showError,
    showBalanceModal,
    showFileUploadModal,

    // Computed
    hasData,

    // Suggested values
    suggestedBalance,

    // Actions
    handleUploadClick,
    handleFilesConfirm,
    handleFileUploadCancel,
    handleBalanceConfirm,
    handleBalanceCancel,
    clearData,
    loadFromLocalStorage,
    processData,

    // State setters (for error handling, etc.)
    setError,
    setShowError,
    setLoading,
    setProgress,
  };

  return (
    <TradeDataContext.Provider value={value}>
      {children}
    </TradeDataContext.Provider>
  );
};
