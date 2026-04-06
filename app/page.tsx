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
      {
        label: "50% confidence",
        value: p50,
        sub: "About even odds — half the simulated timelines finish here or sooner.",
      },
      {
        label: "85% confidence",
        value: p85,
        sub: "I'd lean on this when you need a date you can usually stand behind.",
      },
      {
        label: "95% confidence",
        value: p95,
        sub: "The stress case — handy when someone asks how bad late delivery could look.",
      },
    ],
    [p50, p85, p95]
  );

  const consultantClosingNote = useMemo(() => {
    if (p50 === null || p85 === null || p95 === null) return null;
    const spread = p95 - p50;
    if (spread <= 1) {
      return "Your spread looks tight — throughput has probably been steady. I'd still walk stakeholders through the tails so nobody treats the median as a promise.";
    }
    if (spread <= 3) {
      return "There's a healthy bit of variability in here. For outward planning I'd anchor on the 85% line, and use the median as 'if the next few periods look like the recent norm.'";
    }
    return "The range is opening up — usually that's volatility or a rocky history talking. Before you hard-commit, I'd double-check that the remaining work really matches what those past periods represent.";
  }, [p50, p85, p95]);

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
        setDataError(
          "I couldn't find any numbers in that file. Try one value per line, or commas between values — for example: 5, 3, 7."
        );
        return;
      }
      if (!nums.some((t) => t > 0)) {
        setDataError(
          "Everything came through as zero. I'll need at least one period where you actually shipped something, or the simulation has nothing to sample from."
        );
        return;
      }
      setDataError(null);
      setThroughputHistory(nums);
    };
    reader.onerror = () => {
      setDataError("I couldn't read that file — if it's open in another app, try closing it or exporting again as CSV or plain text.");
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
        <p className="mt-2 max-w-xl mx-auto text-sm leading-relaxed text-slate-600">
          I&apos;ll help you turn your throughput history into a probability-based finish forecast — right in the browser.
          Try a fresh sample run or drop in your own numbers when you&apos;re ready.
        </p>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-800">Throughput history</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Start with what you already track: one completed-items count per period — sprint, week, whatever cadence you use. Paste-friendly
            CSV or plain text is perfect.
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
          {dataError ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {dataError}
            </p>
          ) : null}
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {hasThroughputData ? (
              <>
                So far I&apos;m working with {throughputHistory.length} period
                {throughputHistory.length === 1 ? "" : "s"} — that&apos;s enough to run the Monte Carlo.
              </>
            ) : throughputHistory.length > 0 ? (
              <>I see {throughputHistory.length} values, but they&apos;re all zero. Add at least one period where you actually delivered something.</>
            ) : (
              <>Once you load data, I&apos;ll show how many periods we&apos;re using.</>
            )}
          </p>
        </div>

        {throughputHistory.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-slate-800">History chart</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Have a quick look at the shape — lumpy spikes or long stretches at zero will flow straight through into your forecast, for better or worse.
            </p>
            <div className="mt-4">
              <ThroughputChart data={throughputHistory} />
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label htmlFor="remaining" className="block text-sm font-medium text-slate-700">
            How much is left?
          </label>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Rough count of items, stories, or points still on the wrong side of &quot;done&quot; — pick a unit and stay consistent with your history.
          </p>
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
            {isRunning ? "Running the scenarios…" : "Run the forecast"}
          </button>
          {!hasThroughputData ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              I need throughput with at least one non-zero period before I can simulate — grab the example data or upload yours when you can.
            </p>
          ) : !isValid ? (
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              Pop in a positive number for what&apos;s left and we&apos;re good to go.
            </p>
          ) : null}
          <p
            className={`mt-3 text-center text-xs tabular-nums ${isRunning ? "font-medium text-slate-700" : "text-slate-500"}`}
          >
            {isRunning
              ? `Crunching ${simulationDisplay.toLocaleString()} Monte Carlo draws…`
              : p50 !== null
                ? `That pass used ${SIMULATIONS.toLocaleString()} simulations — happy to re-run if you change the inputs.`
                : `When you run, I'll roll ${SIMULATIONS.toLocaleString()} Monte Carlo draws and walk you through what they're suggesting.`}
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
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{card.sub}</p>
            </div>
          ))}
        </div>

        {consultantClosingNote ? (
          <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 px-5 py-4 shadow-sm">
            <p className="text-sm font-medium text-indigo-950">Here&apos;s how I&apos;d read this</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{consultantClosingNote}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-5 py-4 text-center shadow-sm">
            <p className="text-sm leading-relaxed text-slate-600">
              Run the forecast when your history and remaining scope feel right — I&apos;ll spell out what the percentiles imply for your next
              conversation with leadership.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function formatPeriods(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}
