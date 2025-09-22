// src/components/Charts/WinRateChart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#10B981", "#EF4444"];

const WinRateChart = ({ trades }) => {
  const wins = trades.filter((t) => t.netPnl > 0).length;
  const losses = trades.length - wins;

  const data = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Win/Loss Distribution
      </h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WinRateChart;
