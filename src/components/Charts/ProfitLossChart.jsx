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
    <div className="w-full h-80 bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Cumulative P&L Over Time
      </h2>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitLossChart;