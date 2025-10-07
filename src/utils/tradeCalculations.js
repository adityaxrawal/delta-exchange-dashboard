// FIFO matching and P&L calculations
import { parseISO } from "date-fns";
import { extractFinancialSummary } from "./assetHistoryProcessor";

export function processFillsToTrades(
  fills,
  opts = {
    lotSize: 0.001,
    multiplier: 1,
    initialBalance: 785,
    assetHistory: null,
  }
) {
  const lotSize = opts.lotSize || 0.001;
  const multiplier = opts.multiplier || 1;
  const assetHistory = opts.assetHistory || null;

  // Get initial balance from asset history if available
  let initialBalance = opts.initialBalance || 785;
  if (assetHistory && assetHistory.length > 0) {
    const summary = extractFinancialSummary(assetHistory);
    initialBalance = summary.initial_balance;
  }
  // ensure sorted by timestamp
  fills.sort((a, b) => new Date(a.Time) - new Date(b.Time));

  const longStacks = {};
  const shortStacks = {};
  const trades = [];

  function pushStack(stacks, symbol, obj) {
    if (!stacks[symbol]) stacks[symbol] = [];
    stacks[symbol].push(obj);
  }
  function popStack(stacks, symbol) {
    const arr = stacks[symbol] || [];
    return arr.shift();
  }

  for (const f of fills) {
    const symbol = f.Contract || f.Symbol || f.contract || f.contractName;
    const rawTime = f.Time || f.time;
    // parse common time forms
    const time = rawTime
      ? new Date(
          String(rawTime)
            .replace(/ IST.*$/, "")
            .replace(/ Asia\/.*$/, "")
        )
      : new Date();
    const side = (f.Side || f.side || "").toString().toLowerCase();
    const filledQty = Number(
      f["Filled Qty"] ??
        f.filled_qty ??
        f.Quantity ??
        f.QuantityLots ??
        f["Quantity"]
    );
    const price = Number(f["Exec.Price"] ?? f.Price ?? f.price);
    const feesPaid = Number(f["Fees paid"] ?? f.fees ?? 0);
    const rebate = Number(f["Rebate"] ?? f.rebate ?? 0);
    const netFees = feesPaid - rebate; // Net fees = fees paid - rebate
    if (isNaN(filledQty) || isNaN(price)) continue;
    let qtyBTC = filledQty * lotSize;

    // matching: buy closes short; sell closes long
    if (side === "buy") {
      // match shorts
      let remaining = qtyBTC;
      shortStacks[symbol] = shortStacks[symbol] || [];
      while (remaining > 1e-12 && shortStacks[symbol].length) {
        const entry = shortStacks[symbol][0];
        const matched = Math.min(remaining, entry.qty);
        trades.push({
          symbol,
          type: "short",
          entry_time: entry.time,
          entry_price: entry.price,
          entry_qty: matched,
          entry_fees: entry.fees * (matched / entry.qty),
          exit_time: time,
          exit_price: price,
          exit_qty: matched,
          exit_fees: netFees * (matched / qtyBTC),
        });
        entry.qty -= matched;
        if (entry.qty <= 1e-12) shortStacks[symbol].shift();
        remaining -= matched;
      }
      if (remaining > 1e-12) {
        pushStack(longStacks, symbol, {
          time,
          price,
          qty: remaining,
          fees: netFees * (remaining / qtyBTC),
        });
      }
    } else if (side === "sell") {
      let remaining = qtyBTC;
      longStacks[symbol] = longStacks[symbol] || [];
      while (remaining > 1e-12 && longStacks[symbol].length) {
        const entry = longStacks[symbol][0];
        const matched = Math.min(remaining, entry.qty);
        trades.push({
          symbol,
          type: "long",
          entry_time: entry.time,
          entry_price: entry.price,
          entry_qty: matched,
          entry_fees: entry.fees * (matched / entry.qty),
          exit_time: time,
          exit_price: price,
          exit_qty: matched,
          exit_fees: netFees * (matched / qtyBTC),
        });
        entry.qty -= matched;
        if (entry.qty <= 1e-12) longStacks[symbol].shift();
        remaining -= matched;
      }
      if (remaining > 1e-12) {
        pushStack(shortStacks, symbol, {
          time,
          price,
          qty: remaining,
          fees: netFees * (remaining / qtyBTC),
        });
      }
    } else {
      // unknown side — skip
    }
  }

  // Build a map of cashflow from asset history
  const cashflowMap = {};
  if (assetHistory && assetHistory.length > 0) {
    assetHistory.forEach((row) => {
      if (row["Transaction type"] === "cashflow") {
        const dateKey = String(row.Date).substring(0, 19);
        const contract = row["Contract/Fund"];
        const key = `${dateKey}_${contract}`;
        cashflowMap[key] = row["Amount with GST"];
      }
    });
  }

  // compute numeric P&L first
  const tradesWithPnL = trades.map((t) => {
    const q = t.entry_qty; // Quantity in BTC/ETH (actual crypto amount)
    const entryFees = t.entry_fees || 0;
    const exitFees = t.exit_fees || 0;
    const totalFees = entryFees + exitFees;

    // Try to get actual cashflow from asset history
    const exitDateKey = String(t.exit_time).substring(0, 19);
    const cashflowKey = `${exitDateKey}_${t.symbol}`;
    const actualCashflow = cashflowMap[cashflowKey];

    let gross = 0;
    let net = 0;

    if (actualCashflow !== undefined) {
      // Use actual cashflow from exchange (this is the realized PnL)
      gross = actualCashflow;
      net = actualCashflow; // Cashflow already excludes fees (fees are separate)
    } else {
      // Fallback to calculated PnL if no asset history available
      // P&L formula for Delta Exchange contracts:
      // Long: Profit when exit price > entry price
      // Short: Profit when entry price > exit price
      // P&L = Quantity * (Price Difference) * Multiplier
      if (t.type === "long") {
        gross = q * (t.exit_price - t.entry_price) * multiplier;
      } else {
        gross = q * (t.entry_price - t.exit_price) * multiplier;
      }
      net = gross - totalFees;
    }

    const duration_s = (new Date(t.exit_time) - new Date(t.entry_time)) / 1000;

    return {
      ...t,
      gross_pnl: gross,
      total_fees: totalFees,
      net_pnl: net,
      duration_s,
      uses_actual_cashflow: actualCashflow !== undefined,
    };
  });

  // Sort trades by exit time (oldest to newest) for balance calculation
  tradesWithPnL.sort((a, b) => new Date(a.exit_time) - new Date(b.exit_time));

  // Get funding and commission totals from asset history
  let totalFunding = 0;
  let totalCommission = 0;

  if (assetHistory && assetHistory.length > 0) {
    const summary = extractFinancialSummary(assetHistory);
    totalFunding = summary.total_funding;
    totalCommission = summary.total_commission;
  } else {
    // Fallback: calculate commission from trades
    totalCommission = -tradesWithPnL.reduce((sum, t) => sum + t.total_fees, 0);
  }

  // If we have asset history, calculate wallet balance accurately using ALL transactions
  let tradesWithBalance;

  if (assetHistory && assetHistory.length > 0) {
    // Sort asset history chronologically (oldest to newest)
    // Parse dates consistently - remove timezone to keep local time
    const sortedAssetHistory = [...assetHistory].sort((a, b) => {
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

    // Start with deposits
    let runningBalance = 0;
    const balanceHistory = [];

    // Process ALL transactions chronologically
    sortedAssetHistory.forEach((row) => {
      const txType = row["Transaction type"];
      const amount = row["Amount with GST"] || 0;
      // Parse date the same way as fills - remove timezone info to keep local time
      const rawDate = row.Date;
      const date = new Date(
        String(rawDate)
          .replace(/ IST.*$/, "")
          .replace(/ Asia\/.*$/, "")
      );
      const contract = row["Contract/Fund"];
      const actualBalance = row["Balance"] || 0; // The actual balance from exchange

      if (txType === "deposit") {
        runningBalance += amount;
      } else if (txType === "cashflow") {
        runningBalance += amount;
      } else if (txType === "commission") {
        runningBalance += amount; // Already negative
      } else if (txType === "funding") {
        runningBalance += amount;
      } else if (txType === "settlement") {
        runningBalance += amount;
      }

      balanceHistory.push({
        date,
        balance: actualBalance, // Use actual balance from exchange, not calculated
        calculatedBalance: runningBalance,
        type: txType,
        contract,
      });
    });

    // Now map each trade to the balance AFTER that trade completed
    tradesWithBalance = tradesWithPnL.map((t, index) => {
      const exitTime = new Date(t.exit_time);

      // Convert exit time to string format matching Asset History
      let exitTimeStr = "";
      try {
        if (exitTime instanceof Date && !isNaN(exitTime)) {
          exitTimeStr = exitTime.toISOString().substring(0, 19);
        } else {
          console.warn("Invalid exit time for trade:", t);
          return { ...t, wallet_balance: initialBalance };
        }
      } catch (e) {
        console.warn("Error converting exit time:", t.exit_time);
        return { ...t, wallet_balance: initialBalance };
      }

      // Find the balance AFTER this specific trade's cashflow and commission
      let tradeBalance = initialBalance;
      let found = false;
      let matchedBy = "none";

      // Strategy 1: Find cashflow transaction matching this trade's exit time and symbol
      for (let i = 0; i < balanceHistory.length; i++) {
        const historyEntry = balanceHistory[i];

        // Safely get the history time string
        let historyTimeStr = "";
        try {
          if (historyEntry.date instanceof Date && !isNaN(historyEntry.date)) {
            historyTimeStr = historyEntry.date.toISOString().substring(0, 19);
          } else {
            continue;
          }
        } catch (e) {
          continue;
        }

        // Check if this is the cashflow for our trade (matching time and contract)
        if (
          historyEntry.type === "cashflow" &&
          historyEntry.contract === t.symbol &&
          historyTimeStr === exitTimeStr
        ) {
          // Found the cashflow! Now find the balance AFTER all related commissions
          let j = i + 1;
          let lastBalanceAfterFees = historyEntry.balance;

          while (j < balanceHistory.length) {
            const nextEntry = balanceHistory[j];
            const timeDiff = Math.abs(nextEntry.date - historyEntry.date);

            // If commission within 1 second, include it
            if (timeDiff <= 1000 && nextEntry.type === "commission") {
              lastBalanceAfterFees = nextEntry.balance;
              j++;
            } else if (timeDiff <= 1000 && nextEntry.type === "funding") {
              lastBalanceAfterFees = nextEntry.balance;
              j++;
            } else {
              break;
            }
          }

          tradeBalance = lastBalanceAfterFees;
          found = true;
          matchedBy = "exact";
          break;
        }
      }

      // Strategy 2: If not found by exact match, find closest cashflow within 10 seconds
      if (!found) {
        for (let i = 0; i < balanceHistory.length; i++) {
          const historyEntry = balanceHistory[i];
          if (
            historyEntry.type !== "cashflow" ||
            historyEntry.contract !== t.symbol
          ) {
            continue;
          }

          const timeDiff = Math.abs(historyEntry.date - exitTime);

          // If cashflow within 10 seconds and same contract
          if (timeDiff <= 10000) {
            // Look ahead for related commissions
            let j = i + 1;
            let lastBalanceAfterFees = historyEntry.balance;

            while (j < balanceHistory.length) {
              const nextEntry = balanceHistory[j];
              const commissionTimeDiff = Math.abs(
                nextEntry.date - historyEntry.date
              );

              if (
                commissionTimeDiff <= 1000 &&
                (nextEntry.type === "commission" ||
                  nextEntry.type === "funding")
              ) {
                lastBalanceAfterFees = nextEntry.balance;
                j++;
              } else {
                break;
              }
            }

            tradeBalance = lastBalanceAfterFees;
            found = true;
            matchedBy = "approximate";
            break;
          }
        }
      }

      // Strategy 3: Fallback to time-based (find first entry after exit time)
      if (!found) {
        for (let i = 0; i < balanceHistory.length; i++) {
          if (balanceHistory[i].date >= exitTime) {
            tradeBalance = balanceHistory[i].balance;
            found = true;
            matchedBy = "fallback";
            break;
          }
        }
      }

      // Debug log for first few trades (only if not found to avoid spam)
      if (index < 5 && !found) {
        console.warn(
          `⚠️ Trade ${index + 1}: ${
            t.symbol
          } exit at ${exitTimeStr}, balance: $${tradeBalance.toFixed(
            2
          )}, matched by: ${matchedBy} - NOT FOUND`
        );
      }

      return {
        ...t,
        wallet_balance: tradeBalance,
      };
    });

    // Verify and correct the last trade's balance to match final balance
    const summary = extractFinancialSummary(assetHistory);
    if (tradesWithBalance.length > 0) {
      tradesWithBalance[tradesWithBalance.length - 1].wallet_balance =
        summary.final_balance;
    }
  } else {
    // Fallback: Simple running balance calculation
    let runningBalance = initialBalance;

    tradesWithBalance = tradesWithPnL.map((t) => {
      runningBalance += t.net_pnl;
      return {
        ...t,
        wallet_balance: runningBalance,
      };
    });
  }

  return tradesWithBalance;
}

export function computeKPIs(trades, initialBalance = 785, assetHistory = null) {
  // Always get the summary from asset history if available for accurate financials
  let summary = null;
  if (assetHistory && assetHistory.length > 0) {
    summary = extractFinancialSummary(assetHistory);
  }

  if (!trades || trades.length === 0) {
    // If we have asset history, get actual balances
    if (summary) {
      return {
        initial_balance: summary.initial_balance,
        final_balance: summary.final_balance,
        total_net_pnl: summary.total_cashflow,
        total_fees: Math.abs(summary.total_commission),
        total_funding: summary.total_funding,
        total_gst: Math.abs(summary.total_gst),
        num_trades: 0,
        win_rate_pct: 0,
        wins: 0,
        losses: 0,
      };
    }

    return {
      initial_balance: initialBalance,
      final_balance: initialBalance,
      total_net_pnl: 0,
      total_fees: 0,
      num_trades: 0,
    };
  }

  // Calculate trading statistics from trades
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl <= 0);
  const win_rate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avg_win = wins.length
    ? wins.reduce((s, t) => s + t.net_pnl, 0) / wins.length
    : 0;
  const avg_loss = losses.length
    ? Math.abs(losses.reduce((s, t) => s + t.net_pnl, 0) / losses.length)
    : 0;
  const avg_win_loss_ratio = avg_loss > 0 ? avg_win / avg_loss : null;
  const total_volume_btc = trades.reduce((s, t) => s + t.entry_qty, 0);

  // If we have asset history, use actual values from exchange
  if (summary) {
    // Get final balance from last trade or from summary
    const final_balance =
      trades.length > 0 && trades[trades.length - 1].wallet_balance
        ? trades[trades.length - 1].wallet_balance
        : summary.final_balance;

    return {
      // Financial metrics from Asset History (ground truth)
      initial_balance: summary.initial_balance,
      final_balance: final_balance,
      total_net_pnl: summary.total_cashflow,
      total_gross_pnl: summary.total_cashflow, // Gross = cashflow (before fees)
      total_fees: Math.abs(summary.total_commission),
      total_funding: summary.total_funding,
      total_gst: Math.abs(summary.total_gst),

      // Trading statistics from processed trades
      num_trades: trades.length,
      win_rate_pct: win_rate,
      wins: wins.length,
      losses: losses.length,
      avg_win,
      avg_loss,
      avg_win_loss_ratio,
      total_volume_btc,

      // Additional context
      deposits_count: summary.deposits_count,
      funding_count: summary.funding_count,
      commission_count: summary.commission_count,
    };
  }

  // Fallback: Calculate from trades if no asset history
  const total_net = trades.reduce((s, t) => s + (t.net_pnl || 0), 0);
  const total_gross = trades.reduce((s, t) => s + (t.gross_pnl || 0), 0);
  const total_fees = trades.reduce((s, t) => s + (t.total_fees || 0), 0);
  const final_balance =
    trades.length > 0
      ? trades[trades.length - 1].wallet_balance
      : initialBalance;

  return {
    total_net_pnl: total_net,
    total_gross_pnl: total_gross,
    total_fees: total_fees,
    total_funding: 0,
    num_trades: trades.length,
    win_rate_pct: win_rate,
    wins: wins.length,
    losses: losses.length,
    avg_win,
    avg_loss,
    avg_win_loss_ratio,
    total_volume_btc,
    initial_balance: initialBalance,
    final_balance: final_balance,
  };
}
