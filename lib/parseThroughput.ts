/**
 * Parse pasted text or CSV content into non-negative throughput numbers.
 * Splits on commas, semicolons, whitespace, and newlines; skips non-numeric tokens.
 */
export function parseThroughputText(text: string): number[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/[\s,;]+/).filter(Boolean);
  const nums: number[] = [];
  for (const p of parts) {
    const n = Number.parseFloat(p);
    if (Number.isFinite(n) && n >= 0) nums.push(n);
  }
  return nums;
}
