"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sampleThroughput } from "@/data/sampleThroughput";
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

  const cards = useMemo(
    () => [
      { label: "50% confidence", value: p50, sub: "Median periods to finish" },
      { label: "85% confidence", value: p85, sub: "85th percentile (periods)" },
      { label: "95% confidence", value: p95, sub: "95th percentile (periods)" },
    ],
    [p50, p85, p95]
  );

  function handleRun() {
    if (!isValid || isRunning) return;
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

      const sorted = runMonteCarlo(sampleThroughput, remainingParsed, SIMULATIONS);
      setP50(percentile(sorted, 50));
      setP85(percentile(sorted, 85));
      setP95(percentile(sorted, 95));
      setIsRunning(false);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Agile Delivery Forecaster
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Monte Carlo forecast from sample throughput history (client-side).
        </p>
      </div>

      <div className="mx-auto w-full max-w-md space-y-6">
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
            disabled={!isValid || isRunning}
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? "Running…" : "Run forecast"}
          </button>
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
