import type { OutcomeCategory, RiskLevel } from "@/lib/forecastStats";

type DeliverySignalProps = {
  riskLevel: RiskLevel;
  summary: string;
  successProbability: number;
  target: number;
  unitLabel: string;
  recommendedCommitment: string;
  outcomeCategory: OutcomeCategory;
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
  summary,
  successProbability,
  target,
  unitLabel,
  recommendedCommitment,
  outcomeCategory,
}: DeliverySignalProps) {
  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${riskStyles(riskLevel)}`}>
          {riskLevel}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles(outcomeCategory)}`}>
          {outcomeCategory}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
        {successProbability.toFixed(0)}% chance to finish within {target.toFixed(target % 1 === 0 ? 0 : 1)} {unitLabel}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{summary}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{recommendedCommitment}</p>
    </section>
  );
}
