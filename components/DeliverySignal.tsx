import type { OutcomeCategory, RiskLevel } from "@/lib/forecastStats";

type DeliverySignalProps = {
  riskLevel: RiskLevel;
  outcomeCategory: OutcomeCategory;
  headline: string;
  subline: string;
  supportLine: string;
  safePlanningPoint: string;
  interpretation: string;
};

function riskStyles(riskLevel: RiskLevel): string {
  if (riskLevel === "Low risk") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (riskLevel === "Moderate risk") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-rose-200 bg-rose-50 text-rose-800";
}

function categoryStyles(category: OutcomeCategory): string {
  if (category === "Comfortable") return "bg-emerald-100 text-emerald-800";
  if (category === "Tight but doable") return "bg-amber-100 text-amber-800";
  if (category === "Risky") return "bg-orange-100 text-orange-800";
  return "bg-rose-100 text-rose-800";
}

export function DeliverySignal({
  riskLevel,
  outcomeCategory,
  headline,
  subline,
  supportLine,
  safePlanningPoint,
  interpretation,
}: DeliverySignalProps) {
  return (
    <section className="surface-card rounded-2xl border-2 border-slate-100 p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${riskStyles(riskLevel)}`}
        >
          Risk badge: {riskLevel}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles(outcomeCategory)}`}
        >
          Outcome: {outcomeCategory}
        </span>
      </div>

      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {headline}
      </h2>
      <p className="mt-2 text-base font-medium text-slate-800">{subline}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{supportLine}</p>

      <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
          Safer planning point
        </p>
        <p className="mt-1 text-2xl font-bold text-indigo-950">{safePlanningPoint}</p>
        <p className="mt-1 text-sm text-indigo-900/90">
          Use this as the commitment date unless you can tolerate more risk.
        </p>
      </div>

      <div className="mt-5 border-l-4 border-slate-300 pl-4">
        <p className="text-sm leading-relaxed text-slate-700">{interpretation}</p>
      </div>
    </section>
  );
}
