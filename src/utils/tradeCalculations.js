// FIFO matching and P&L calculations
import { parseISO } from "date-fns";

export function processFillsToTrades(
  fills,
  opts = { lotSize: 0.001, multiplier: 1, initialBalance: 785 }
) {
  const lotSize = opts.lotSize || 0.001;
  const multiplier = opts.multiplier || 1;
  const initialBalance = opts.initialBalance || 785;
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

  // compute numeric P&L first
  const tradesWithPnL = trades.map((t) => {
    const q = t.entry_qty; // Quantity in BTC/ETH (actual crypto amount)
    const entryFees = t.entry_fees || 0;
    const exitFees = t.exit_fees || 0;
    const totalFees = entryFees + exitFees;
    let gross = 0;

    // P&L formula for Delta Exchange contracts:
    // Long: Profit when exit price > entry price
    // Short: Profit when entry price > exit price
    // P&L = Quantity * (Price Difference) * Multiplier
    if (t.type === "long") {
      gross = q * (t.exit_price - t.entry_price) * multiplier;
    } else {
      gross = q * (t.entry_price - t.exit_price) * multiplier;
    }

    const net = gross - totalFees;
    const duration_s = (new Date(t.exit_time) - new Date(t.entry_time)) / 1000;

    return {
      ...t,
      gross_pnl: gross,
      total_fees: totalFees,
      net_pnl: net,
      duration_s,
    };
  });

  // Sort trades by exit time (oldest to newest) for balance calculation
  tradesWithPnL.sort((a, b) => new Date(a.exit_time) - new Date(b.exit_time));

  // Start with initial balance
  let runningBalance = initialBalance;

  // Add wallet balance to each trade in chronological order
  return tradesWithPnL.map((t) => {
    // Update running balance with net P&L
    runningBalance += t.net_pnl;

    return {
      ...t,
      wallet_balance: runningBalance, // Running balance after this trade
    };
  });
}

export function computeKPIs(trades, initialBalance = 785) {
  if (!trades || trades.length === 0)
    return {
      initial_balance: initialBalance,
      final_balance: initialBalance,
    };

  const INITIAL_BALANCE = initialBalance;
  const total_net = trades.reduce((s, t) => s + (t.net_pnl || 0), 0);
  const total_gross = trades.reduce((s, t) => s + (t.gross_pnl || 0), 0);
  const total_fees = trades.reduce((s, t) => s + (t.total_fees || 0), 0);
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl <= 0);
  const win_rate = (wins.length / trades.length) * 100;
  const avg_win = wins.length
    ? wins.reduce((s, t) => s + t.net_pnl, 0) / wins.length
    : 0;
  const avg_loss = losses.length
    ? Math.abs(losses.reduce((s, t) => s + t.net_pnl, 0) / losses.length)
    : 0;
  const avg_win_loss_ratio = avg_loss > 0 ? avg_win / avg_loss : null;
  const total_volume_btc = trades.reduce((s, t) => s + t.entry_qty, 0);

  // Get final balance from the last trade
  const final_balance =
    trades.length > 0
      ? trades[trades.length - 1].wallet_balance
      : INITIAL_BALANCE;

  return {
    total_net_pnl: total_net,
    total_gross_pnl: total_gross,
    total_fees,
    num_trades: trades.length,
    win_rate_pct: win_rate,
    wins: wins.length,
    avg_win,
    avg_loss,
    avg_win_loss_ratio,
    total_volume_btc,
    initial_balance: initialBalance,
    final_balance: final_balance,
  };
}
