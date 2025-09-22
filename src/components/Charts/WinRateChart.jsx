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
    <div className="w-full h-full bg-card rounded-xl shadow-lg p-6 border border-border">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Win/Loss Distribution
        </h2>
        <p className="text-sm text-text-secondary">
          Trade success rate analysis
        </p>
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
              className="text-text-primary"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                  stroke="rgb(30 41 59)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(30 41 59 / 0.95)",
                border: "1px solid rgb(51 65 85)",
                borderRadius: "6px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "rgb(226 232 240)",
              }}
              formatter={(value) => [`${value} trades`, ""]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              className="text-text-secondary"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WinRateChart;
