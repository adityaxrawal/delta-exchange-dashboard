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
    <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Win/Loss Distribution
        </h2>
        <p className="text-sm text-gray-500">Trade success rate analysis</p>
      </div>
      <div className="w-full h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [`${value} trades`, ""]}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WinRateChart;
