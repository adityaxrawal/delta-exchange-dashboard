import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { useCurrency } from "../context/CurrencyContext";

export default function TradeTable({ trades = [], kpis = {} }) {
  const { formatCurrency } = useCurrency();
  const [sortKey, setSortKey] = useState("entry_time");
  const [desc, setDesc] = useState(true);
  const sorted = useMemo(() => {
    const arr = [...trades];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      // Special handling for P&L columns to sort by actual value, not absolute value
      if (sortKey === "net_pnl" || sortKey === "gross_pnl") {
        return desc ? bv - av : av - bv;
      }

      if (typeof av === "string" && Date.parse(av))
        return desc
          ? Date.parse(bv) - Date.parse(av)
          : Date.parse(av) - Date.parse(bv);
      if (typeof av === "number") return desc ? bv - av : av - bv;
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
      return 0;
    });
    return arr;
  }, [trades, sortKey, desc]);

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-auto">
      <table className="min-w-full text-left">
        <thead className="bg-card-alt sticky top-0">
          <tr>
            {[
              "type",
              "symbol",
              "entry_time",
              "exit_time",
              "entry_price",
              "exit_price",
              "entry_qty",
              "gross_pnl",
              "total_fees",
              "net_pnl",
              "wallet_balance",
            ].map((k) => (
              <th
                key={k}
                className="px-4 py-3 uppercase text-xs font-semibold text-text-primary cursor-pointer hover:bg-card-hover transition-colors"
                onClick={() => {
                  setSortKey(k);
                  setDesc((s) => !s);
                }}
              >
                <div className="flex items-center gap-1">
                  <span>
                    {k === "gross_pnl" ? "Profit/Loss" : k.replace(/_/g, " ")}
                  </span>
                  {sortKey === k && (
                    <span
                      className={`${
                        k === "net_pnl" || k === "gross_pnl"
                          ? desc
                            ? "text-error"
                            : "text-success"
                          : "text-text-primary"
                      }`}
                    >
                      {desc ? "↓" : "↑"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => {
            const profit = t.net_pnl > 0;
            // const bgColor = profit ? "bg-green-100/20" : "bg-red-100/20";
            const textColor = profit ? "text-green-600" : "text-red-600";

            // Check if this is the start of a new month
            const currentMonth = format(new Date(t.exit_time), "MMMM yyyy");
            const prevMonth =
              i > 0
                ? format(new Date(sorted[i - 1].exit_time), "MMMM yyyy")
                : null;
            const isNewMonth = i > 0 && currentMonth !== prevMonth;

            return (
              <React.Fragment key={i}>
                {isNewMonth && (
                  <tr className="bg-card-alt border-t-2 border-b-2 border-border">
                    <td colSpan="11" className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-sm font-bold text-text-primary uppercase tracking-wider">
                          {currentMonth}
                        </span>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                    </td>
                  </tr>
                )}
                <tr
                  className={`border-b border-border/30 hover:bg-card-hover transition-colors`}
                >
                  <td className="px-4 py-3 font-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        t.type === "long"
                          ? "bg-green-500/20 text-green-600"
                          : "bg-red-500/20 text-red-600"
                      }`}
                    >
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {t.symbol}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {format(new Date(t.entry_time), "dd MMM yyyy hh:mm a")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {format(new Date(t.exit_time), "dd MMM yyyy hh:mm a")}
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {formatCurrency(t.entry_price, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {formatCurrency(t.exit_price, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {t.entry_qty.toLocaleString(undefined, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      t.gross_pnl > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(t.gross_pnl, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatCurrency(t.total_fees, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${textColor}`}>
                    {formatCurrency(t.net_pnl, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      t.wallet_balance < (kpis?.initial_balance || 0)
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(t.wallet_balance, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
