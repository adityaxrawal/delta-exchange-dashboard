// src/components/Charts/ProfitLossChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ProfitLossChart = ({ trades }) => {
  // Convert trades into cumulative PnL over time
  let cumulative = 0;
  const data = trades.map((t) => {
    cumulative += t.netPnl;
    return {
      time: new Date(t.exitTime || t.entryTime).toLocaleDateString(),
      pnl: cumulative,
    };
  });

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          P&L Performance
        </h2>
        <p className="text-sm text-gray-500">Profit/Loss trends analysis</p>
      </div>
      <div className="w-full h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6B7280" }}
              tickLine={{ stroke: "#E5E7EB" }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tick={{ fill: "#6B7280" }}
              tickLine={{ stroke: "#E5E7EB" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, "P&L"]}
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitLossChart;
