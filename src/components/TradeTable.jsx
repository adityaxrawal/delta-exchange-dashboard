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
    <div className="bg-white rounded shadow overflow-auto">
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
                className="p-2 uppercase text-xs font-medium text-gray-600 cursor-pointer"
                onClick={() => {
                  setSortKey(k);
                  setDesc((s) => s);
                }}
              >
                {k.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => {
            const profit = t.net_pnl > 0;
            const style = profit
              ? { backgroundColor: "#ECFDF5" }
              : { backgroundColor: "#FFF1F2" };
            return (
              <tr key={i} style={style} className="border-b">
                <td className="p-2">{t.type}</td>
                <td className="p-2">{t.symbol}</td>
                <td className="p-2">
                  {format(new Date(t.entry_time), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="p-2">
                  {format(new Date(t.exit_time), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="p-2">{t.entry_price}</td>
                <td className="p-2">{t.exit_price}</td>
                <td className="p-2">{t.entry_qty.toFixed(6)}</td>
                <td className="p-2">{t.net_pnl.toFixed(2)}</td>
                <td className="p-2">{t.total_fees.toFixed(4)}</td>
                <td className="p-2">{Math.round(t.duration_s)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
