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
} from "recharts";
import { format } from "date-fns";

const MonthlyPerformanceChart = ({ trades }) => {
  const monthlyPnL = {};

  trades.forEach((t) => {
    const month = format(new Date(t.exitTime || t.entryTime), "MMM yyyy");
    monthlyPnL[month] = (monthlyPnL[month] || 0) + t.netPnl;
  });

  const data = Object.entries(monthlyPnL).map(([month, pnl]) => ({
    month,
    pnl,
  }));

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Monthly Performance
      </h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="pnl" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyPerformanceChart;
