import Papa from "papaparse";

/**
 * Parse Asset History CSV file
 * This file contains the true financial record from the exchange
 */
export function parseAssetHistoryCSV(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Please select an asset history file"));
      return;
    }

    const rows = [];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      step: (results) => {
        rows.push(results.data);
      },
      complete: () => {
        resolve(rows);
      },
      error: (err) => {
        reject(err);
        console.error("Error parsing Asset History CSV:", err);
      },
    });
  });
}

/**
 * Extract financial summary from Asset History
 * This is the ground truth for balance calculations
 */
export function extractFinancialSummary(assetHistory) {
  if (!assetHistory || assetHistory.length === 0) {
    return {
      initial_balance: 0,
      total_commission: 0,
      total_funding: 0,
      total_cashflow: 0,
      total_settlement: 0,
      final_balance: 0,
      total_gst: 0,
    };
  }

  // Sort by date (oldest to newest)
  // Parse dates the same way as in tradeCalculations - remove timezone to keep local time
  const sorted = [...assetHistory].sort((a, b) => {
    const dateA = new Date(
      String(a.Date)
        .replace(/ IST.*$/, "")
        .replace(/ Asia\/.*$/, "")
    );
    const dateB = new Date(
      String(b.Date)
        .replace(/ IST.*$/, "")
        .replace(/ Asia\/.*$/, "")
    );
    return dateA - dateB;
  });

  // Calculate components
  const deposits = sorted.filter(
    (row) => row["Transaction type"] === "deposit"
  );
  const commission = sorted.filter(
    (row) => row["Transaction type"] === "commission"
  );
  const funding = sorted.filter((row) => row["Transaction type"] === "funding");
  const cashflow = sorted.filter(
    (row) => row["Transaction type"] === "cashflow"
  );
  const settlement = sorted.filter(
    (row) => row["Transaction type"] === "settlement"
  );

  const initial_balance = deposits.reduce(
    (sum, row) => sum + (row["Amount with GST"] || 0),
    0
  );
  const total_commission = commission.reduce(
    (sum, row) => sum + (row["Amount with GST"] || 0),
    0
  );
  const total_funding = funding.reduce(
    (sum, row) => sum + (row["Amount with GST"] || 0),
    0
  );
  const total_cashflow = cashflow.reduce(
    (sum, row) => sum + (row["Amount with GST"] || 0),
    0
  );
  const total_settlement = settlement.reduce(
    (sum, row) => sum + (row["Amount with GST"] || 0),
    0
  );
  const total_gst = commission.reduce((sum, row) => sum + (row["GST"] || 0), 0);

  // Final balance: Get the most recent entry's balance
  // Since CSV is sorted newest first, we need to check both possibilities
  const firstRowBalance = assetHistory[0]?.Balance || 0;
  const lastRowBalance = sorted[sorted.length - 1]?.Balance || 0;

  // Use the first row in original CSV (which is the most recent transaction)
  const final_balance = firstRowBalance;

  return {
    initial_balance,
    total_commission,
    total_funding,
    total_cashflow,
    total_settlement,
    final_balance,
    total_gst,
    deposits_count: deposits.length,
    trades_count: cashflow.length,
    funding_count: funding.length,
    commission_count: commission.length,
  };
}

/**
 * Match fills with their corresponding asset transactions
 * This allows us to show accurate PnL for each trade
 */
export function matchFillsWithAssetHistory(fills, assetHistory) {
  if (!assetHistory || assetHistory.length === 0) {
    return fills;
  }

  // Create a map of asset transactions by date and contract
  const assetMap = {};
  assetHistory.forEach((row) => {
    const contract = row["Contract/Fund"];
    const date = row.Date;
    const type = row["Transaction type"];

    if (!contract || !date) return;

    // Create a key based on timestamp (to nearest second) and contract
    const dateKey = date.substring(0, 19); // YYYY-MM-DD HH:MM:SS
    const key = `${dateKey}_${contract}`;

    if (!assetMap[key]) {
      assetMap[key] = {
        cashflow: null,
        commission: null,
        funding: null,
      };
    }

    if (type === "cashflow") {
      assetMap[key].cashflow = row["Amount with GST"];
    } else if (type === "commission") {
      assetMap[key].commission = row["Amount with GST"];
    } else if (type === "funding") {
      assetMap[key].funding = row["Amount with GST"];
    }
  });

  // Match fills with asset transactions
  return fills.map((fill) => {
    const contract = fill.Contract || fill.Symbol;
    const rawTime = fill.Time || fill.time;
    const dateKey = String(rawTime).substring(0, 19);
    const key = `${dateKey}_${contract}`;

    const assetData = assetMap[key];

    return {
      ...fill,
      actual_cashflow: assetData?.cashflow || null,
      actual_commission: assetData?.commission || null,
      actual_funding: assetData?.funding || null,
    };
  });
}
