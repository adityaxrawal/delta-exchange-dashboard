// src/components/Charts/CumulativePnLChart.jsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CumulativePnLChart = ({ trades }) => {
  let cumulative = 0;
  const data = trades.map((t) => {
    cumulative += t.netPnl;
    return {
      time: new Date(t.exitTime || t.entryTime).toLocaleDateString(),
      cumulativePnL: cumulative,
    };
  });

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Cumulative P&L Curve
      </h2>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="cumulativePnL"
            stroke="#3B82F6"
            fill="#93C5FD"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CumulativePnLChart;