// src/components/Charts/MonthlyPerformanceChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { format } from "date-fns";

const MonthlyPerformanceChart = ({ trades }) => {
  const monthlyPnL = {};

  trades.forEach((t) => {
    const month = format(new Date(t.exitTime || t.entryTime), "MMM yyyy");
    monthlyPnL[month] = (monthlyPnL[month] || 0) + t.netPnl;
  });

  const data = Object.entries(monthlyPnL)
    .map(([month, pnl]) => ({
      month,
      pnl,
      // Parse the date for sorting
      date: new Date(month + " 1"),
    }))
    .sort((a, b) => a.date - b.date) // Sort by date
    .map(({ month, pnl }) => ({ month, pnl })); // Remove the date field used for sorting

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Monthly Performance
        </h2>
        <p className="text-sm text-gray-500">Month-by-month profit analysis</p>
      </div>
      <div className="w-full h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
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
            <Bar
              dataKey="pnl"
              fill={(entry) => (entry.pnl >= 0 ? "#10B981" : "#EF4444")}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#10B981" : "#EF4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;
