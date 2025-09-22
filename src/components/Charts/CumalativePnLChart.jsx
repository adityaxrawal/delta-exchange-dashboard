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
    <div className="w-full h-full bg-card rounded-xl shadow-lg p-6 border border-border">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Cumulative P&L Curve
        </h2>
        <p className="text-sm text-text-secondary">
          Trading performance over time
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
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value) => [
                `$${value.toLocaleString()}`,
                "Cumulative P&L",
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
