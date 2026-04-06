/**
 * Run Monte Carlo simulations: each period draws a random throughput from history
 * until remaining work is cleared. Returns sorted period counts per simulation.
 */
export function runMonteCarlo(
  throughputHistory: number[],
  remainingItems: number,
  simulations = 3000
): number[] {
  const results: number[] = [];
  const n = throughputHistory.length;
  if (n === 0 || remainingItems <= 0 || simulations <= 0) {
    return results;
  }

  for (let i = 0; i < simulations; i++) {
    let remaining = remainingItems;
    let periods = 0;
    while (remaining > 0) {
      const idx = Math.floor(Math.random() * n);
      const throughput = throughputHistory[idx];
      remaining -= throughput;
      periods++;
    }
    results.push(periods);
  }

  return results.sort((a, b) => a - b);
}

/** p in [0, 100]; uses linear interpolation between nearest ranks. */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const clamped = Math.min(100, Math.max(0, p));
  if (clamped === 0) return sorted[0];
  if (clamped === 100) return sorted[sorted.length - 1];

  const rank = (clamped / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sorted[lower];

  const weight = rank - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}
