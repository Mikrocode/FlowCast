"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionGuidance } from "@/components/ActionGuidance";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AnimatedDiceLogo } from "@/components/AnimatedDiceLogo";
import { DeliverySignal } from "@/components/DeliverySignal";
import { ForecastDistributionChart } from "@/components/ForecastDistributionChart";
import { ThroughputChart } from "@/components/ThroughputChart";
import { generateRealisticSampleThroughput } from "@/lib/generateSampleThroughput";
import {
  buildHistogram,
  getOutcomeCategory,
  getRiskBadge,
  getSuccessProbability,
  getThroughputVariability,
  getUnitLabel,
  type ForecastUnit,
} from "@/lib/forecastStats";
import {
  getActionGuidance,
  getMainDecisionCopy,
  getNarrative,
  getRecommendation,
  getSafeCommitment,
} from "@/lib/insights";
import { percentile, runMonteCarlo } from "@/lib/montecarlo";
import { parseThroughputText } from "@/lib/parseThroughput";

const DEFAULT_REMAINING = 20;
const SIMULATIONS = 3000;
const SIMULATION_COUNT_ANIM_MS = 1800;

export default function Home() {
  const [remainingInput, setRemainingInput] = useState(String(DEFAULT_REMAINING));
  const [targetInput, setTargetInput] = useState("");
  const [forecastUnit, setForecastUnit] = useState<ForecastUnit>("periods");
  const [p50, setP50] = useState<number | null>(null);
  const [p85, setP85] = useState<number | null>(null);
  const [p95, setP95] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationDisplay, setSimulationDisplay] = useState(SIMULATIONS);
  const [throughputHistory, setThroughputHistory] = useState<number[]>(() =>
    generateRealisticSampleThroughput(),
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
  const targetParsed = Number.parseFloat(targetInput);
  const targetFromInput = Number.isFinite(targetParsed) && targetParsed > 0 ? targetParsed : null;

  const isValid = remainingInput.trim() !== "" && Number.isFinite(remainingParsed) && remainingParsed > 0;
  const hasThroughputData = throughputHistory.length > 0 && throughputHistory.some((t) => t > 0);

  const unitLabel = getUnitLabel(forecastUnit);
  const unitSingular = getUnitLabel(forecastUnit, 1);
  const effectiveTarget = targetFromInput ?? p85;

  const successProbability = effectiveTarget != null ? getSuccessProbability(results, effectiveTarget) : 0;
  const outcomeCategory = getOutcomeCategory(successProbability);

  const averageThroughput =
    throughputHistory.length > 0
      ? throughputHistory.reduce((sum, value) => sum + value, 0) / throughputHistory.length
      : 0;
  const zeroThroughputPeriods = throughputHistory.filter((value) => value === 0).length;
  const variability = getThroughputVariability(throughputHistory);
  const spread = p95 != null && p50 != null ? p95 - p50 : 0;
  const tightForecast = p50 != null && p95 != null ? p95 - p50 <= 1 : false;

  const riskLevel =
    p50 != null && p85 != null && p95 != null
      ? getRiskBadge({
          probability: successProbability,
          p50,
          p85,
          p95,
          variability,
          zeroPeriods: zeroThroughputPeriods,
          totalPeriods: throughputHistory.length,
        })
      : null;

  const cards = useMemo(
    () => [
      { label: "50% confidence", value: p50, title: "Coin-flip outcome" },
      { label: "85% confidence", value: p85, title: "Safer planning point" },
      { label: "95% confidence", value: p95, title: "Buffer / stress case" },
    ],
    [p50, p85, p95],
  );

  const histogram = useMemo(() => buildHistogram(results), [results]);

  const recommendationText =
    p50 != null && p85 != null && effectiveTarget != null && riskLevel != null
      ? getRecommendation({
          riskLevel,
          outcomeCategory,
          p50,
          p85,
          target: effectiveTarget,
          unitLabel,
        })
      : null;

  const narrative =
    riskLevel != null && effectiveTarget != null
      ? getNarrative({
          riskLevel,
          outcomeCategory,
          successProbability,
          spread,
          tightForecast,
          variability,
          zeroPeriods: zeroThroughputPeriods,
          totalPeriods: throughputHistory.length,
          target: effectiveTarget,
          unitLabel,
        })
      : null;

  const decisionCopy =
    riskLevel != null && effectiveTarget != null && p85 != null
      ? getMainDecisionCopy({
          successProbability,
          target: effectiveTarget,
          unitLabel,
          p85,
          riskLevel,
        })
      : null;

  const actionGuidance =
    p50 != null && p85 != null
      ? getActionGuidance({
          variability,
          zeroPeriods: zeroThroughputPeriods,
          totalPeriods: throughputHistory.length,
          spread,
          p50,
          p85,
          successProbability,
        })
      : [];

  function handleRun() {
    if (!canRunForecast || isRunning) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    setIsRunning(true);
    setSimulationDisplay(0);

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SIMULATION_COUNT_ANIM_MS);
      setSimulationDisplay(Math.min(SIMULATIONS, Math.floor(t * SIMULATIONS)));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      rafRef.current = null;
      setSimulationDisplay(SIMULATIONS);

      const sorted = runMonteCarlo(throughputHistory, remainingParsed, SIMULATIONS);
      setResults(sorted);
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
        setDataError("I couldn't find any numbers in that file. Try one value per line or comma-separated values.");
        return;
      }

      if (!nums.some((t) => t > 0)) {
        setDataError("Everything came through as zero. Add at least one period with completed work.");
        return;
      }

      setDataError(null);
      setThroughputHistory(nums);
    };
    reader.onerror = () => setDataError("I couldn't read that file. Try exporting as CSV or plain text.");
    reader.readAsText(file);
  }

  const canRunForecast = isValid && hasThroughputData;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-12 sm:px-6 sm:py-14">
        <header className="mb-10 text-center">
          <div className="mb-5 flex justify-center">
            <AnimatedDiceLogo className="h-20 w-20 text-indigo-600 sm:h-24 sm:w-24" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Flow Cast</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Turn throughput history into a decision-ready delivery forecast.
          </p>
        </header>

        <div className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card rounded-2xl p-6">
              <h2 className="text-sm font-medium text-slate-800">Throughput history</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Use one completed-items count per period. CSV and plain text both work.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  disabled={isRunning}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Try a fresh example
                </button>
                <button
                  type="button"
                  onClick={handlePickFile}
                  disabled={isRunning}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Upload my file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv,text/plain"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {dataError ? <p className="mt-3 text-sm text-red-600">{dataError}</p> : null}
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {hasThroughputData
                  ? `Using ${throughputHistory.length} periods of throughput history.`
                  : "Add data with at least one non-zero period to run the forecast."}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <MetricCell
                  label="Average throughput"
                  value={formatForecastNumber(averageThroughput)}
                />
                <MetricCell
                  label="Zero periods"
                  value={`${zeroThroughputPeriods}/${throughputHistory.length}`}
                />
                <MetricCell
                  label="Variability"
                  value={variability}
                />
              </div>
            </div>

            <div className="surface-card rounded-2xl p-6">
              <label htmlFor="remaining" className="block text-sm font-medium text-slate-700">
                How much is left?
              </label>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Enter remaining items in the same unit your history reflects.</p>
              <input
                id="remaining"
                type="number"
                min={1}
                step={1}
                value={remainingInput}
                onChange={(e) => setRemainingInput(e.target.value)}
                disabled={isRunning}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm outline-none ring-slate-400 focus:border-slate-300 focus:ring-2"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-slate-600">
                  Forecast unit
                  <select
                    value={forecastUnit}
                    onChange={(e) => setForecastUnit(e.target.value as ForecastUnit)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900"
                  >
                    <option value="periods">Periods</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="sprints">Sprints</option>
                  </select>
                </label>

                <label className="text-xs text-slate-600">
                  Target delivery ({unitLabel})
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder={p85 != null ? `Default: ${formatForecastNumber(p85)}` : "Defaults to p85 after run"}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  />
                </label>
              </div>


              <button
                type="button"
                onClick={handleRun}
                disabled={!canRunForecast || isRunning}
                className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? "Running the scenarios…" : "Run the forecast"}
              </button>

              <p className={`mt-3 text-center text-xs tabular-nums ${isRunning ? "font-medium text-slate-700" : "text-slate-500"}`}>
                {isRunning
                  ? `Crunching ${simulationDisplay.toLocaleString()} Monte Carlo draws…`
                  : p50 !== null
                    ? `Latest run: ${SIMULATIONS.toLocaleString()} simulations.`
                    : `When you run, I'll use ${SIMULATIONS.toLocaleString()} simulation draws.`}
              </p>
            </div>
          </section>

          {throughputHistory.length > 0 ? (
            <section className="surface-card rounded-2xl p-6">
              <h2 className="text-sm font-medium text-slate-800">History chart</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Spikes and zero periods directly shape the forecast spread.</p>
              <div className="mt-4">
                <ThroughputChart data={throughputHistory} />
              </div>
            </section>
          ) : null}

          {riskLevel != null && decisionCopy && p85 != null && narrative ? (
            <DeliverySignal
              riskLevel={riskLevel}
              outcomeCategory={outcomeCategory}
              headline={decisionCopy.headline}
              subline={decisionCopy.subline}
              supportLine={decisionCopy.supportLine}
              safePlanningPoint={getSafeCommitment(p85, unitLabel)}
              interpretation={narrative}
            />
          ) : null}

          <section className="grid gap-4 sm:grid-cols-3">
            {cards.map((card) => (
              <div key={card.label} className="surface-card rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-4xl font-bold tabular-nums text-slate-950">
                  {card.value == null ? "—" : formatForecastNumber(card.value)}
                </p>
                <p className="text-sm font-medium text-slate-700">{unitLabel}</p>
                <p className="mt-2 text-xs text-slate-500">{card.title}</p>
              </div>
            ))}
          </section>

          {p50 != null && p85 != null && p95 != null && histogram.length > 0 ? (
            <section className="surface-card rounded-2xl p-6">
              <h2 className="text-sm font-medium text-slate-800">Forecast distribution</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Green is safer territory, amber is tighter, and red is tail risk.
              </p>
              <div className="mt-4">
                <ForecastDistributionChart
                  bins={histogram}
                  p50={p50}
                  p85={p85}
                  p95={p95}
                  target={effectiveTarget}
                  unitLabel={unitSingular}
                  totalRuns={results.length}
                />
              </div>
            </section>
          ) : (
            <section className="surface-card rounded-2xl border-dashed px-5 py-4 text-center">
              <p className="text-sm leading-relaxed text-slate-600">
                Run the forecast to see full probability spread and commitment guidance.
              </p>
            </section>
          )}

          {actionGuidance.length > 0 ? <ActionGuidance actions={actionGuidance} /> : null}

          {recommendationText ? (
            <section className="surface-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Supporting metrics & recommendation</h3>
              <p className="mt-2 text-sm text-slate-700">{recommendationText}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <MetricCell label="Average throughput" value={averageThroughput.toFixed(1)} />
                <MetricCell label="Variability" value={variability} />
                <MetricCell
                  label="Zero-throughput periods"
                  value={`${zeroThroughputPeriods} / ${throughputHistory.length}`}
                />
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-indigo-100 bg-white/80 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatForecastNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}
