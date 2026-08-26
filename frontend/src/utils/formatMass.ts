/**
 * Formats a mass value (in kg) into a human-readable string.
 * - < 1 kg    → "XXX g"
 * - < 1000 kg → "XX kg"
 * - >= 1000 kg → "X.Xt"  (tonnes, 1 decimal, or whole number if clean)
 */
export function formatMass(weightKg: number | null | undefined, fallback = 'N/A'): string {
  if (!weightKg) return fallback;
  if (weightKg < 1) return `${Math.round(weightKg * 1000)} g`;
  if (weightKg < 1000) return `${weightKg.toLocaleString()} kg`;
  const tonnes = weightKg / 1000;
  // Show 1 decimal only if needed (e.g. 1.5t not 1.0t → 1t)
  return tonnes % 1 === 0 ? `${tonnes}t` : `${tonnes.toFixed(1)}t`;
}
