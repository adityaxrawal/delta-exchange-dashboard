import React, { useMemo, useState } from "react";
import { format } from "date-fns";

export default function TradeTable({ trades = [] }) {
  const [sortKey, setSortKey] = useState("entry_time");
  const [desc, setDesc] = useState(true);
  const sorted = useMemo(() => {
    const arr = [...trades];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      // Special handling for net_pnl to sort by actual value, not absolute value
      if (sortKey === "net_pnl") {
        return desc ? b.net_pnl - a.net_pnl : a.net_pnl - b.net_pnl;
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
    <div className="bg-white rounded-xl shadow-lg overflow-auto border border-gray-200">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {[
              "type",
              "symbol",
              "entry_time",
              "exit_time",
              "entry_price",
              "exit_price",
              "entry_qty",
              "net_pnl",
              "total_fees",
              "duration_s",
            ].map((k) => (
              <th
                key={k}
                className="px-4 py-3 uppercase text-xs font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setSortKey(k);
                  setDesc((s) => !s);
                }}
              >
                <div className="flex items-center gap-1">
                  <span>{k.replace(/_/g, " ")}</span>
                  {sortKey === k && (
                    <span
                      className={`${
                        k === "net_pnl"
                          ? desc
                            ? "text-red-600"
                            : "text-green-600"
                          : "text-gray-900"
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
            const bgColor = profit ? "bg-green-50" : "bg-red-50";
            return (
              <tr
                key={i}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${bgColor}`}
              >
                <td className="px-4 py-3 font-medium">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-900">
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 ">
                  {t.symbol}
                </td>
                <td className="px-4 py-3 text-gray-600 ">
                  {format(new Date(t.entry_time), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="px-4 py-3 text-gray-600 ">
                  {format(new Date(t.exit_time), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 ">
                  $
                  {t.entry_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 ">
                  $
                  {t.exit_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-gray-600 ">
                  {t.entry_qty.toLocaleString(undefined, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6,
                  })}
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    profit
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  $
                  {Math.abs(t.net_pnl).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-gray-600 ">
                  $
                  {t.total_fees.toLocaleString(undefined, {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })}
                </td>
                <td className="px-4 py-3 text-gray-600 ">
                  {Math.round(t.duration_s)}s
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
