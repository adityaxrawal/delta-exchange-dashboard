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
    <div className="w-full h-full bg-card rounded-xl shadow-lg p-6 border border-border/40">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Monthly Performance
        </h2>
        <p className="text-sm text-text-secondary">
          Month-by-month profit analysis
        </p>
      </div>
      <div className="w-full h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#504945"
              opacity={0.4}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#ebdbb2" }}
              tickLine={{ stroke: "#504945" }}
              axisLine={{ stroke: "#504945" }}
              className="text-text-secondary"
            />
            <YAxis
              tick={{ fill: "#ebdbb2" }}
              tickLine={{ stroke: "#504945" }}
              axisLine={{ stroke: "#504945" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              className="text-text-secondary"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(30 41 59 / 0.95)",
                border: "1px solid rgb(51 65 85)",
                borderRadius: "6px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "rgb(226 232 240)",
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
                  fill={
                    entry.pnl >= 0
                      ? "rgba(184, 187, 38, 0.7)"
                      : "rgba(251, 73, 52, 0.7)"
                  }
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
