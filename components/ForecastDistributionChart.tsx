"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistogramBin } from "@/lib/forecastStats";

type ForecastDistributionChartProps = {
  bins: HistogramBin[];
  p50: number;
  p85: number;
  p95: number;
  target?: number | null;
  unitLabel: string;
};

export function ForecastDistributionChart({ bins, p50, p85, p95, target, unitLabel }: ForecastDistributionChartProps) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={bins} margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="midpoint" tick={{ fontSize: 11, fill: "#64748b" }} label={{ value: unitLabel, position: "insideBottom", offset: -8, fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={42} label={{ value: "Probability %", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, "Probability"]}
            labelFormatter={(_, payload) => {
              const point = payload?.[0]?.payload as HistogramBin | undefined;
              return point ? `${point.start}–${point.end} ${unitLabel}` : "";
            }}
          />
          <Bar dataKey="probability" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <ReferenceLine x={p50} stroke="#0f172a" strokeWidth={1.5} label={{ value: "P50", position: "insideTopRight", fill: "#0f172a", fontSize: 11 }} />
          <ReferenceLine x={p85} stroke="#1d4ed8" strokeWidth={1.5} label={{ value: "P85", position: "insideTopRight", fill: "#1d4ed8", fontSize: 11 }} />
          <ReferenceLine x={p95} stroke="#7c3aed" strokeWidth={1.5} label={{ value: "P95", position: "insideTopRight", fill: "#7c3aed", fontSize: 11 }} />
          {target != null ? (
            <ReferenceLine x={target} stroke="#be123c" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Target", position: "insideTopLeft", fill: "#be123c", fontSize: 11 }} />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
