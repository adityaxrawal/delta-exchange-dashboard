import { useState, useCallback, useEffect } from "react";
import { parseCSVToRows } from "../utils/csvProcessor";
import { processFillsToTrades, computeKPIs } from "../utils/tradeCalculations";

const LOCALSTORAGE_KEY = "delta_exchange_csv_data";
const LOCALSTORAGE_FILENAME_KEY = "delta_exchange_csv_filename";
const LOCALSTORAGE_INITIAL_BALANCE_KEY = "delta_exchange_initial_balance";

export default function useTradeData() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trades, setTrades] = useState([]);
  const [kpis, setKpis] = useState({});
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [initialBalance, setInitialBalance] = useState(785);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  // Function to process data from rows
  const processData = useCallback(
    (rows, filename = null, balance = null) => {
      try {
        const fills = rows; // keep entire array of fills
        const balanceToUse = balance !== null ? balance : initialBalance;
        const processedTrades = processFillsToTrades(fills, {
          lotSize: 0.001,
          multiplier: 1,
          initialBalance: balanceToUse,
        });
        const summary = computeKPIs(processedTrades, balanceToUse);
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
    [initialBalance]
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

          // Process the loaded data with saved balance
          const balanceToUse = savedBalance ? parseFloat(savedBalance) : 785;
          processData(rows, savedFileName, balanceToUse);

          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading from localStorage:", err);
        // Clear corrupted data
        localStorage.removeItem(LOCALSTORAGE_KEY);
        localStorage.removeItem(LOCALSTORAGE_FILENAME_KEY);
        localStorage.removeItem(LOCALSTORAGE_INITIAL_BALANCE_KEY);
      }
    };

    loadFromLocalStorage();
  }, [processData]);

  const handleFile = useCallback(async (file) => {
    setLoading(true);
    setProgress(5);
    try {
      const rows = await parseCSVToRows(file, (p) => setProgress(p));
      console.log("Parsed rows:", rows);
      setProgress(45);

      // Store pending file and show modal to get initial balance
      setPendingFile({ rows, filename: file.name });
      setShowBalanceModal(true);
      setLoading(false);
      setProgress(0);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message);
      setShowError(true);
      // Reset the trades and KPIs on error
      setTrades([]);
      setKpis({});
      setLoading(false);
      setProgress(0);
    }
  }, []);

  const handleBalanceConfirm = useCallback(
    (balance) => {
      setShowBalanceModal(false);
      if (pendingFile) {
        setLoading(true);
        setProgress(50);
        // Process and save data with the confirmed balance
        processData(pendingFile.rows, pendingFile.filename, balance);
        setPendingFile(null);
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
    [pendingFile, processData]
  );

  const handleBalanceCancel = useCallback(() => {
    setShowBalanceModal(false);
    setPendingFile(null);
  }, []);

  const clearData = useCallback(() => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    localStorage.removeItem(LOCALSTORAGE_FILENAME_KEY);
    localStorage.removeItem(LOCALSTORAGE_INITIAL_BALANCE_KEY);
    setTrades([]);
    setKpis({});
    setFileName(null);
    setInitialBalance(785);
    console.log("Data cleared from localStorage");
  }, []);

  return {
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
  };
}
