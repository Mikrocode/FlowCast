"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FlowCastLogo } from "@/components/FlowCastLogo";
import { ThroughputChart } from "@/components/ThroughputChart";
import { generateRealisticSampleThroughput } from "@/lib/generateSampleThroughput";
import { parseThroughputText } from "@/lib/parseThroughput";
import { percentile, runMonteCarlo } from "@/lib/montecarlo";

const DEFAULT_REMAINING = 20;
const SIMULATIONS = 3000;
/** Visual only: how long the 0 → SIMULATIONS count runs (ms). */
const SIMULATION_COUNT_ANIM_MS = 1800;

export default function Home() {
  const [remainingInput, setRemainingInput] = useState(String(DEFAULT_REMAINING));
  const [p50, setP50] = useState<number | null>(null);
  const [p85, setP85] = useState<number | null>(null);
  const [p95, setP95] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationDisplay, setSimulationDisplay] = useState(SIMULATIONS);
  const [throughputHistory, setThroughputHistory] = useState<number[]>(() =>
    generateRealisticSampleThroughput()
  );
  const [dataError, setDataError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const remainingParsed = Number.parseInt(remainingInput, 10);
  const isValid =
    remainingInput.trim() !== "" &&
    Number.isFinite(remainingParsed) &&
    remainingParsed > 0;

  const hasThroughputData =
    throughputHistory.length > 0 && throughputHistory.some((t) => t > 0);

  const cards = useMemo(
    () => [
      { label: "50% confidence", value: p50, sub: "Median periods to finish" },
      { label: "85% confidence", value: p85, sub: "85th percentile (periods)" },
      { label: "95% confidence", value: p95, sub: "95th percentile (periods)" },
    ],
    [p50, p85, p95]
  );

  function handleRun() {
    if (!canRunForecast || isRunning) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    setIsRunning(true);
    setSimulationDisplay(0);

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SIMULATION_COUNT_ANIM_MS);
      const value = Math.min(SIMULATIONS, Math.floor(t * SIMULATIONS));
      setSimulationDisplay(value);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = null;
      setSimulationDisplay(SIMULATIONS);

      const sorted = runMonteCarlo(throughputHistory, remainingParsed, SIMULATIONS);
      setP50(percentile(sorted, 50));
      setP85(percentile(sorted, 85));
      setP95(percentile(sorted, 95));
      setIsRunning(false);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  function handleLoadSample() {
    setDataError(null);
    setThroughputHistory(generateRealisticSampleThroughput());
  }

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const nums = parseThroughputText(text);
      if (nums.length === 0) {
        setDataError("No valid numbers found. Use comma or newline separated values (e.g. 5, 3, 7).");
        return;
      }
      if (!nums.some((t) => t > 0)) {
        setDataError("Need at least one period with throughput greater than zero.");
        return;
      }
      setDataError(null);
      setThroughputHistory(nums);
    };
    reader.onerror = () => {
      setDataError("Could not read that file.");
    };
    reader.readAsText(file);
  }

  const canRunForecast = isValid && hasThroughputData;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <FlowCastLogo className="h-16 w-16 text-indigo-600 sm:h-[4.5rem] sm:w-[4.5rem]" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Flow Cast</h1>
        <p className="mt-2 text-sm text-slate-600">
          Monte Carlo forecast from throughput history (client-side). Load sample data or upload your own.
        </p>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-800">Throughput history</h2>
          <p className="mt-1 text-xs text-slate-500">
            One number per period (sprint, week, etc.). Plain text or CSV with commas or newlines.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isRunning}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Load sample data
            </button>
            <button
              type="button"
              onClick={handlePickFile}
              disabled={isRunning}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Upload file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {dataError ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {dataError}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-slate-500">
            {throughputHistory.length} period{throughputHistory.length === 1 ? "" : "s"} loaded
            {!hasThroughputData && throughputHistory.length > 0
              ? " — add at least one period with throughput above zero."
              : ""}
          </p>
        </div>

        {throughputHistory.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-slate-800">History chart</h2>
            <p className="mt-1 text-xs text-slate-500">
              Sanity-check your series before forecasting (spread and outliers affect the simulation).
            </p>
            <div className="mt-4">
              <ThroughputChart data={throughputHistory} />
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label htmlFor="remaining" className="block text-sm font-medium text-slate-700">
            Remaining items
          </label>
          <input
            id="remaining"
            type="number"
            min={1}
            step={1}
            value={remainingInput}
            onChange={(e) => setRemainingInput(e.target.value)}
            disabled={isRunning}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm outline-none ring-slate-400 focus:border-slate-300 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
          />
          <button
            type="button"
            onClick={handleRun}
            disabled={!canRunForecast || isRunning}
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? "Running…" : "Run forecast"}
          </button>
          {!hasThroughputData ? (
            <p className="mt-2 text-xs text-amber-700">
              Load or upload throughput with at least one value above zero to run a forecast.
            </p>
          ) : null}
          <p
            className={`mt-3 text-center text-xs tabular-nums ${isRunning ? "font-medium text-slate-700" : "text-slate-500"}`}
          >
            Simulations: {simulationDisplay.toLocaleString()}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                {card.value === null ? "—" : formatPeriods(card.value)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function formatPeriods(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}
