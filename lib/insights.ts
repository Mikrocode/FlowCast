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
    return `This distribution is unusually tight, which is rare and useful. With current data, delivery looks highly predictable and a ${target} ${unitLabel} commitment is credible as long as scope stays stable.`;
  }

  const zeroShare = totalPeriods > 0 ? (zeroPeriods / totalPeriods) * 100 : 0;

  if (riskLevel === "High risk") {
    return `You have a ${successProbability.toFixed(0)}% shot at landing inside ${target} ${unitLabel}, so this sits in ${outcomeCategory.toLowerCase()} territory. The tail risk is still meaningful, so I would avoid committing to the median and focus on scope control over optimism.`;
  }

  if (riskLevel === "Moderate risk") {
    if (variability === "High" || spread >= 4) {
      return `You have a decent shot at hitting ${target} ${unitLabel}, but I would not call it safe yet. There is enough spread here that pushing harder is less useful than keeping scope clean and reducing churn.`;
    }

    if (zeroShare >= 10) {
      return `This forecast is usable, but the stop-start history (${zeroPeriods} zero-throughput periods) can still bite. I'd communicate ${target} ${unitLabel} as doable, then keep buffer in case the quieter periods repeat.`;
    }

    return `Delivery looks stable, but I would still plan on the safer range. ${target} ${unitLabel} is attainable, and I'd present the median as upside rather than as the commitment.`;
  }

  return `This looks stable enough to plan against the safer range. At ${successProbability.toFixed(0)}% confidence for ${target} ${unitLabel}, I'd call the target safe while still carrying a light buffer if the date is business-critical.`;
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
    return `Recommended commitment: ${target} ${unitLabel}. You can use the 85% line (${p85.toFixed(1)} ${unitLabel}) as your default planning point and treat ${p50.toFixed(1)} as upside.`;
  }

  if (riskLevel === "Moderate risk") {
    return `Recommended commitment: stay near the safer range. ${outcomeCategory} means the target is plausible, but the cleaner external promise is around ${p85.toFixed(1)} ${unitLabel}.`;
  }

  return `Recommended commitment: do not anchor on the median (${p50.toFixed(1)} ${unitLabel}). With this risk profile, set expectations closer to ${p85.toFixed(1)} ${unitLabel} and protect scope.`;
}
