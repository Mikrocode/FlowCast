"use client";

import { memo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceArea,
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
  totalRuns: number;
};

function markerChip(label: string, value: number, color: string, detail: string) {
  return (
    <div
      key={label}
      title={detail}
      className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden /> {" "}
      {label}: {value.toFixed(value % 1 === 0 ? 0 : 1)}
    </div>
  );
}

function ForecastDistributionChartComponent({
  bins,
  p50,
  p85,
  p95,
  target,
  unitLabel,
  totalRuns,
}: ForecastDistributionChartProps) {
  const minX = Math.min(...bins.map((b) => b.start));
  const maxX = Math.max(...bins.map((b) => b.end));

  return (
    <div className="h-80 w-full min-w-0">
      <div className="mb-2 flex flex-wrap gap-2">
        {markerChip("Target", target ?? p85, "#be123c", "Commitment target line")}
        {markerChip("P50", p50, "#0f172a", "Coin-flip outcome line")}
        {markerChip("P85", p85, "#1d4ed8", "Safer planning point line")}
        {markerChip("P95", p95, "#7c3aed", "Stress/buffer case line")}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={bins} margin={{ top: 8, right: 14, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <ReferenceArea x1={minX} x2={p85} fill="#22c55e" fillOpacity={0.08} />
          <ReferenceArea x1={p85} x2={p95} fill="#f59e0b" fillOpacity={0.08} />
          <ReferenceArea x1={p95} x2={maxX} fill="#ef4444" fillOpacity={0.08} />

          <XAxis
            dataKey="midpoint"
            tick={{ fontSize: 11, fill: "#475569" }}
            tickLine={false}
            label={{
              value: unitLabel,
              position: "insideBottom",
              offset: -10,
              fill: "#64748b",
              fontSize: 11,
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#475569" }}
            width={44}
            tickLine={false}
            label={{
              value: "Probability %",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(value: number, _name, item) => {
              const bin = item?.payload as HistogramBin;
              const count = bin?.count ?? 0;
              const rangeLabel = bin ? `${bin.start}–${bin.end} ${unitLabel}` : "";
              return [
                `${value.toFixed(1)}% • ${count} runs`,
                `${value.toFixed(1)}% of runs finished in ${rangeLabel}`,
              ];
            }}
            labelFormatter={(_, payload) => {
              const point = payload?.[0]?.payload as HistogramBin | undefined;
              return point ? `Bucket: ${point.start}–${point.end} ${unitLabel}` : "";
            }}
          />

          <Bar dataKey="probability" fill="#6366f1" radius={[4, 4, 0, 0]} />

          <ReferenceLine
            x={p50}
            stroke="#0f172a"
            strokeWidth={2}
            label={{ value: "P50", position: "insideTopRight", fill: "#0f172a", fontSize: 11 }}
          />
          <ReferenceLine
            x={p85}
            stroke="#1d4ed8"
            strokeWidth={2}
            label={{ value: "P85", position: "insideTopRight", fill: "#1d4ed8", fontSize: 11 }}
          />
          <ReferenceLine
            x={p95}
            stroke="#7c3aed"
            strokeWidth={2}
            label={{ value: "P95", position: "insideTopRight", fill: "#7c3aed", fontSize: 11 }}
          />
          {target != null ? (
            <ReferenceLine
              x={target}
              stroke="#be123c"
              strokeDasharray="5 4"
              strokeWidth={2}
              label={{ value: "Target", position: "insideTopLeft", fill: "#be123c", fontSize: 11 }}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-slate-500">{totalRuns.toLocaleString()} simulation runs</p>
    </div>
  );
}


export const ForecastDistributionChart = memo(ForecastDistributionChartComponent);
