"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { period: number; throughput: number };

export function ThroughputChart({ data }: { data: number[] }) {
  const chartData: Point[] = data.map((throughput, i) => ({
    period: i + 1,
    throughput,
  }));

  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "#64748b" }}
            label={{ value: "Period", position: "insideBottom", offset: -4, fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={40}
            label={{ value: "Items", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
            formatter={(value) => [value != null ? String(value) : "—", "Throughput"]}
            labelFormatter={(label) => `Period ${label}`}
          />
          <Line
            type="monotone"
            dataKey="throughput"
            stroke="#0f172a"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0f172a" }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
