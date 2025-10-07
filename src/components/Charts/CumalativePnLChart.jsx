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

const CumulativePnLChart = ({ trades, kpis }) => {
  // Ensure we have valid initial balance
  if (!kpis?.initial_balance) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Unable to load initial balance data</p>
      </div>
    );
  }

  // Ensure we have trades
  if (!trades || trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No trades available to display</p>
      </div>
    );
  }

  const INITIAL_BALANCE = kpis.initial_balance;
  let cumulative = INITIAL_BALANCE;

  // Add initial balance as starting point
  const data = [
    {
      time: "Start",
      cumulativePnL: INITIAL_BALANCE,
    },
    ...trades.map((t) => {
      cumulative += t.netPnl;
      return {
        time: new Date(t.exitTime || t.entryTime).toLocaleDateString(),
        cumulativePnL: cumulative,
      };
    }),
  ];

  return (
    <div className="w-full h-full bg-card rounded-xl shadow-lg p-6 border border-border/40">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Wallet Balance Progression
        </h2>
        <p className="text-sm text-text-secondary">
          Balance growth from ${INITIAL_BALANCE.toLocaleString()} initial
          capital
        </p>
      </div>
      <div className="w-full h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#83a598" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#83a598" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#504945"
              opacity={0.4}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#ebdbb2" }}
              tickLine={{ stroke: "#504945" }}
              axisLine={{ stroke: "#504945" }}
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
              formatter={(value) => [
                `$${value.toLocaleString()}`,
                "Wallet Balance",
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulativePnL"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorPnL)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CumulativePnLChart;
