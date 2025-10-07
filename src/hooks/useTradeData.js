import { useState, useCallback, useEffect } from "react";
import { parseCSVToRows } from "../utils/csvProcessor";
import { processFillsToTrades, computeKPIs } from "../utils/tradeCalculations";
import {
  parseAssetHistoryCSV,
  extractFinancialSummary,
} from "../utils/assetHistoryProcessor";

const LOCALSTORAGE_KEY = "delta_exchange_csv_data";
const LOCALSTORAGE_FILENAME_KEY = "delta_exchange_csv_filename";
const LOCALSTORAGE_INITIAL_BALANCE_KEY = "delta_exchange_initial_balance";
const LOCALSTORAGE_ASSET_HISTORY_KEY = "delta_exchange_asset_history";

export default function useTradeData() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trades, setTrades] = useState([]);
  const [kpis, setKpis] = useState({});
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [initialBalance, setInitialBalance] = useState(null); // Will be set from Asset History or user input
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFiles, setPendingFiles] = useState({
    fillHistory: null,
    assetHistory: null,
  });
  const [assetHistory, setAssetHistory] = useState(null);
  const [assetHistoryFileName, setAssetHistoryFileName] = useState(null);

  // Function to process data from rows
  const processData = useCallback(
    (rows, filename = null, balance = null, assetHistoryData = null) => {
      try {
        const fills = rows; // keep entire array of fills

        // If we have asset history, use it to get the correct initial balance
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

        // Process trades with dynamic contract-specific configuration
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
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(rows));
          if (filename) {
            localStorage.setItem(LOCALSTORAGE_FILENAME_KEY, filename);
            setFileName(filename);
          }
          if (balance !== null) {
            localStorage.setItem(
              LOCALSTORAGE_INITIAL_BALANCE_KEY,
              balance.toString()
            );
            setInitialBalance(balance);
          }
          if (assetHistoryToUse) {
            localStorage.setItem(
              LOCALSTORAGE_ASSET_HISTORY_KEY,
              JSON.stringify(assetHistoryToUse)
            );
          }
          console.log("Data saved to localStorage");
        } catch (storageErr) {
          console.warn("Failed to save to localStorage:", storageErr);
        }

        return true;
      } catch (err) {
        console.error("Error processing data:", err);
        setError(err.message);
        setShowError(true);
        setTrades([]);
        setKpis({});
        return false;
      }
    },
    [initialBalance, assetHistory]
  );

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorage = async () => {
      try {
        const savedData = localStorage.getItem(LOCALSTORAGE_KEY);
        const savedFileName = localStorage.getItem(LOCALSTORAGE_FILENAME_KEY);
        const savedBalance = localStorage.getItem(
          LOCALSTORAGE_INITIAL_BALANCE_KEY
        );
        const savedAssetHistory = localStorage.getItem(
          LOCALSTORAGE_ASSET_HISTORY_KEY
        );

        // Load asset history first if it exists
        let assetHistoryData = null;
        if (savedAssetHistory) {
          try {
            assetHistoryData = JSON.parse(savedAssetHistory);
            setAssetHistory(assetHistoryData);
            console.log(
              "Loaded asset history from localStorage:",
              assetHistoryData.length,
              "records"
            );
          } catch (err) {
            console.warn("Failed to parse saved asset history:", err);
          }
        }

        // Load initial balance first if it exists
        if (savedBalance) {
          const balance = parseFloat(savedBalance);
          if (!isNaN(balance) && balance > 0) {
            setInitialBalance(balance);
          }
        }

        if (savedData) {
          setLoading(true);
          const rows = JSON.parse(savedData);
          console.log("Loading data from localStorage:", rows.length, "rows");

          // Process the loaded data with saved balance and asset history
          // If we have asset history, extract balance from it
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
    };

    loadFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Open file upload modal
  const handleUploadClick = useCallback(() => {
    setShowFileUploadModal(true);
  }, []);

  // Handle both files selected in upload modal
  const handleFilesConfirm = useCallback(
    async (fillHistoryFile, assetHistoryFile) => {
      setShowFileUploadModal(false);
      setLoading(true);
      setProgress(5);

      try {
        // Parse Fill History
        console.log("Parsing Fill History...");
        const fillRows = await parseCSVToRows(fillHistoryFile, (p) =>
          setProgress(p * 0.4)
        );
        setProgress(40);
        console.log("Parsed Fill History:", fillRows.length, "rows");

        // Parse Asset History
        console.log("Parsing Asset History...");
        const assetHistoryData = await parseAssetHistoryCSV(assetHistoryFile);
        setProgress(70);
        console.log(
          "Parsed Asset History:",
          assetHistoryData.length,
          "records"
        );

        // Store both files
        setAssetHistory(assetHistoryData);
        setAssetHistoryFileName(assetHistoryFile.name);

        // Extract initial balance from asset history
        const summary = extractFinancialSummary(assetHistoryData);
        const initialBalanceFromAssets = summary.initial_balance;

        console.log("Initial balance from deposits:", initialBalanceFromAssets);

        // Store pending data and show balance confirmation modal
        setPendingFiles({
          fillRows,
          fillFilename: fillHistoryFile.name,
          assetHistoryData,
          assetFilename: assetHistoryFile.name,
          suggestedBalance: initialBalanceFromAssets,
        });

        setProgress(80);
        setLoading(false);
        setShowBalanceModal(true);
        setProgress(0);
      } catch (err) {
        console.error("Error processing files:", err);
        setError(
          err.message ||
            "Failed to process files. Please ensure you uploaded the correct CSV files."
        );
        setShowError(true);
        setTrades([]);
        setKpis({});
        setLoading(false);
        setProgress(0);
      }
    },
    []
  );

  // Cancel file upload modal
  const handleFileUploadCancel = useCallback(() => {
    setShowFileUploadModal(false);
  }, []);

  const handleBalanceConfirm = useCallback(
    (balance) => {
      setShowBalanceModal(false);
      if (pendingFiles.fillRows && pendingFiles.assetHistoryData) {
        setLoading(true);
        setProgress(50);
        // Process and save data with the confirmed balance
        processData(
          pendingFiles.fillRows,
          pendingFiles.fillFilename,
          balance,
          pendingFiles.assetHistoryData
        );

        // Save asset history filename
        setAssetHistoryFileName(pendingFiles.assetFilename);

        setPendingFiles({ fillHistory: null, assetHistory: null });
        setProgress(100);
        // Clear any existing errors on success
        setError(null);
        setShowError(false);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 300);
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
    setInitialBalance(null); // Reset to null instead of hardcoded value
    console.log("Data cleared from localStorage");
  }, []);

  return {
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
    suggestedBalance: pendingFiles.suggestedBalance,
  };
}
