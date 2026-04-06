export type ForecastUnit = "periods" | "days" | "weeks" | "sprints";

export type OutcomeCategory = "Comfortable" | "Tight but doable" | "Risky" | "Likely delay";

export type RiskLevel = "Low risk" | "Moderate risk" | "High risk";

export type VariabilityLevel = "Low" | "Medium" | "High";

export type HistogramBin = {
  start: number;
  end: number;
  midpoint: number;
  label: string;
  count: number;
  probability: number;
};

export function getUnitLabel(unit: ForecastUnit, amount = 2): string {
  const singular = amount === 1;
  if (unit === "days") return singular ? "day" : "days";
  if (unit === "weeks") return singular ? "week" : "weeks";
  if (unit === "sprints") return singular ? "sprint" : "sprints";
  return singular ? "period" : "periods";
}

export function getSuccessProbability(results: number[], target: number): number {
  if (!results.length || !Number.isFinite(target) || target <= 0) return 0;
  const metTarget = results.filter((value) => value <= target).length;
  return (metTarget / results.length) * 100;
}

export function getOutcomeCategory(probability: number): OutcomeCategory {
  if (probability >= 85) return "Comfortable";
  if (probability >= 65) return "Tight but doable";
  if (probability >= 40) return "Risky";
  return "Likely delay";
}

export function getRiskLevel(params: {
  probability: number;
  p50: number;
  p85: number;
  p95: number;
  variability: VariabilityLevel;
  zeroPeriods: number;
  totalPeriods: number;
}): RiskLevel {
  const { probability, p50, p85, p95, variability, zeroPeriods, totalPeriods } = params;
  const spread = Math.max(0, p95 - p50);
  const spreadRatio = p50 > 0 ? spread / p50 : spread;
  const zeroShare = totalPeriods > 0 ? zeroPeriods / totalPeriods : 0;

  let score = 0;
  if (probability < 65) score += 2;
  else if (probability < 85) score += 1;

  if (spreadRatio > 0.8) score += 2;
  else if (spreadRatio > 0.35) score += 1;

  if (variability === "High") score += 2;
  else if (variability === "Medium") score += 1;

  if (zeroShare >= 0.25) score += 2;
  else if (zeroShare >= 0.1) score += 1;

  if (p85 - p50 >= 3 || p95 - p85 >= 3) score += 1;

  if (score >= 6) return "High risk";
  if (score >= 3) return "Moderate risk";
  return "Low risk";
}


export function getRiskBadge(params: {
  probability: number;
  p50: number;
  p85: number;
  p95: number;
  variability: VariabilityLevel;
  zeroPeriods: number;
  totalPeriods: number;
}): RiskLevel {
  return getRiskLevel(params);
}
export function buildHistogram(results: number[], maxBins = 18): HistogramBin[] {
  if (!results.length) return [];
  const min = Math.min(...results);
  const max = Math.max(...results);
  const range = Math.max(1, max - min + 1);
  const binSize = Math.max(1, Math.ceil(range / maxBins));
  const binCount = Math.ceil(range / binSize);
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * binSize;
    const end = start + binSize - 1;
    return {
      start,
      end,
      midpoint: (start + end) / 2,
      label: start === end ? `${start}` : `${start}-${end}`,
      count: 0,
      probability: 0,
    };
  });

  for (const value of results) {
    const binIndex = Math.min(Math.floor((value - min) / binSize), bins.length - 1);
    bins[binIndex].count += 1;
  }

  for (const bin of bins) {
    bin.probability = (bin.count / results.length) * 100;
  }

  return bins;
}

export function getThroughputVariability(values: number[]): VariabilityLevel {
  if (!values.length) return "Low";
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (avg <= 0) return "High";

  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficient = stdDev / avg;

  if (coefficient < 0.45) return "Low";
  if (coefficient < 0.9) return "Medium";
  return "High";
}
