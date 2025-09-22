// FIFO matching and P&L calculations
import { parseISO } from "date-fns";

export function processFillsToTrades(
  fills,
  opts = { lotSize: 0.001, multiplier: 1 }
) {
  const lotSize = opts.lotSize || 0.001;
  const multiplier = opts.multiplier || 1;
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
    const fees = Number(f["Fees paid"] ?? f.fees ?? 0);
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
          exit_fees: fees * (matched / qtyBTC),
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
          fees: fees * (remaining / qtyBTC),
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
          exit_fees: fees * (matched / qtyBTC),
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
          fees: fees * (remaining / qtyBTC),
        });
      }
    } else {
      // unknown side — skip
    }
  }

  // compute numeric P&L
  return trades.map((t) => {
    const q = t.entry_qty;
    const entryFees = t.entry_fees || 0;
    const exitFees = t.exit_fees || 0;
    const totalFees = entryFees + exitFees;
    let gross = 0;
    if (t.type === "long")
      gross = (t.exit_price - t.entry_price) * q * multiplier;
    else gross = (t.entry_price - t.exit_price) * q * multiplier;
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
}

export function computeKPIs(trades) {
  if (!trades || trades.length === 0) return {};
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
  return {
    total_net_pnl: total_net,
    total_gross_pnl: total_gross,
    total_fees,
    num_trades: trades.length,
    win_rate_pct: win_rate,
    avg_win,
    avg_loss,
    avg_win_loss_ratio,
    total_volume_btc,
  };
}
