import type { OutcomeCategory, RiskLevel, VariabilityLevel } from "@/lib/forecastStats";

type NarrativeInput = {
  riskLevel: RiskLevel;
  outcomeCategory: OutcomeCategory;
  successProbability: number;
  spread: number;
  tightForecast: boolean;
  variability: VariabilityLevel;
  zeroPeriods: number;
  totalPeriods: number;
  target: number;
  unitLabel: string;
};

export function getSafeCommitment(p85: number, unitLabel: string): string {
  return `${formatForecastNumber(p85)} ${unitLabel}`;
}

export function getMainDecisionCopy(input: {
  successProbability: number;
  target: number;
  unitLabel: string;
  p85: number;
  riskLevel: RiskLevel;
}): {
  headline: string;
  subline: string;
  supportLine: string;
} {
  const { successProbability, target, unitLabel, p85, riskLevel } = input;

  const headline = `${successProbability.toFixed(0)}% chance to hit ${formatForecastNumber(target)} ${unitLabel}`;

  const subline =
    successProbability >= 85
      ? "Safe enough to commit with normal execution discipline."
      : successProbability >= 65
        ? "This is plausible, but not safe enough to promise."
        : "Not a safe commitment yet.";

  const supportLine =
    riskLevel === "Low risk"
      ? `Planning anchor: about ${formatForecastNumber(p85)} ${unitLabel} at 85% confidence.`
      : `Safer commitment: about ${formatForecastNumber(p85)} ${unitLabel} (85% confidence).`;

  return { headline, subline, supportLine };
}

export function getActionGuidance(input: {
  variability: VariabilityLevel;
  zeroPeriods: number;
  totalPeriods: number;
  spread: number;
  p50: number;
  p85: number;
  successProbability: number;
}): string[] {
  const { variability, zeroPeriods, totalPeriods, spread, p50, p85, successProbability } = input;
  const actions: string[] = [];

  const zeroShare = totalPeriods > 0 ? zeroPeriods / totalPeriods : 0;

  if (zeroShare >= 0.15) {
    actions.push(
      `Review the ${zeroPeriods} zero-throughput periods and remove the top interruption pattern before the next cycle.`
    );
  }

  if (variability === "High") {
    actions.push("Split large work items earlier so throughput swings are smaller week to week.");
  }

  if (spread >= 4 || p85 - p50 >= 2) {
    actions.push("Reduce work-in-progress and clear dependencies before pull-in to tighten the long-tail risk.");
  }

  if (successProbability < 65) {
    actions.push("Cut or stage scope for the target date, then re-run the forecast before making an external promise.");
  }

  if (actions.length < 2) {
    actions.push("Track dependency age and blocked time explicitly so delivery drag is visible early.");
  }

  return actions.slice(0, 4);
}

export function getNarrative(input: NarrativeInput): string {
  const {
    riskLevel,
    outcomeCategory,
    successProbability,
    spread,
    tightForecast,
    variability,
    zeroPeriods,
    totalPeriods,
    target,
    unitLabel,
  } = input;

  if (tightForecast) {
    return `This is usable for planning and tight enough for a real commitment. ${formatForecastNumber(target)} ${unitLabel} is credible if scope stays stable.`;
  }

  const zeroShare = totalPeriods > 0 ? (zeroPeriods / totalPeriods) * 100 : 0;

  if (riskLevel === "High risk") {
    return `The target is achievable, but still too exposed for a hard promise. I would plan around the safer range and treat earlier delivery as upside.`;
  }

  if (riskLevel === "Moderate risk") {
    if (variability === "High" || spread >= 4) {
      return `This is plausible, but not safe enough to promise. I'd plan around the 85% point and treat median timing as upside.`;
    }

    if (zeroShare >= 10) {
      return `The stop-start pattern still adds enough risk that I would not commit to the median. Keep buffer until those quiet periods are reduced.`;
    }

    return `${outcomeCategory} is workable for internal planning, but I'd still communicate the safer range externally.`;
  }

  return `This is stable enough for planning and the target currently sits in a safe zone at ${successProbability.toFixed(0)}% confidence.`;
}

export function getRecommendation(input: {
  riskLevel: RiskLevel;
  outcomeCategory: OutcomeCategory;
  p50: number;
  p85: number;
  target: number;
  unitLabel: string;
}): string {
  const { riskLevel, outcomeCategory, p50, p85, target, unitLabel } = input;

  if (riskLevel === "Low risk") {
    return `Recommended commitment: ${formatForecastNumber(target)} ${unitLabel}. Keep ${formatForecastNumber(p85)} ${unitLabel} as the default planning anchor and treat ${formatForecastNumber(p50)} ${unitLabel} as upside.`;
  }

  if (riskLevel === "Moderate risk") {
    return `Recommended commitment: ${outcomeCategory.toLowerCase()} does not justify a tight promise. Anchor commitments around ${formatForecastNumber(p85)} ${unitLabel}.`;
  }

  return `Recommended commitment: avoid anchoring on the median (${formatForecastNumber(p50)} ${unitLabel}). Set expectations near ${formatForecastNumber(p85)} ${unitLabel} and protect scope.`;
}

function formatForecastNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}
