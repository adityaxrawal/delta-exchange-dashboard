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
    <div className="w-full h-full bg-card rounded-xl shadow-lg p-6 border border-border">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          P&L Performance
        </h2>
        <p className="text-sm text-text-secondary">
          Profit/Loss trends analysis
        </p>
      </div>
      <div className="w-full h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.4}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "currentColor" }}
              tickLine={{ stroke: "#374151" }}
              axisLine={{ stroke: "#374151" }}
              className="text-text-secondary"
            />
            <YAxis
              tick={{ fill: "currentColor" }}
              tickLine={{ stroke: "#374151" }}
              axisLine={{ stroke: "#374151" }}
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
