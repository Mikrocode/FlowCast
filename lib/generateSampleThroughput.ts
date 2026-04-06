/**
 * Builds a fresh throughput series (items completed per period) with
 * sprint-like variance: mean reversion, occasional zeros, and bursts.
 */
export function generateRealisticSampleThroughput(): number[] {
  const periodCount = 14 + Math.floor(Math.random() * 9);
  const targetMean = 4 + Math.random() * 5;
  const series: number[] = [];
  let latent = targetMean + (Math.random() - 0.5) * 2;

  for (let i = 0; i < periodCount; i++) {
    const reversion = (targetMean - latent) * 0.28;
    const noise = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
    latent = Math.max(0.4, latent + reversion + noise);

    let v = Math.round(latent);

    if (Math.random() < 0.07) {
      v = 0;
    } else if (Math.random() < 0.09) {
      v += 1 + Math.floor(Math.random() * 3);
    } else if (Math.random() < 0.07) {
      v = Math.max(0, v - (1 + Math.floor(Math.random() * 2)));
    }

    v = Math.max(0, Math.min(16, v));
    series.push(v);
  }

  if (!series.some((t) => t > 0)) {
    series[series.length - 1] = Math.max(1, Math.round(targetMean));
  }

  return series;
}
