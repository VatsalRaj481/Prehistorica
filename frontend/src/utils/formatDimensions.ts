/**
 * Dimension formatting utilities for prehistoric species metrics (Length & Height).
 * Converts metric (meters) to imperial (feet) across the application.
 * 1 meter = 3.28084 feet.
 */

export function formatFeet(meters: number | null | undefined, fallback = 'N/A'): string {
  if (meters == null || isNaN(meters) || meters <= 0) return fallback;
  const feet = meters * 3.28084;
  return `${feet.toFixed(1)} ft`;
}

export function formatFeetLong(meters: number | null | undefined, fallback = 'Unverified'): string {
  if (meters == null || isNaN(meters) || meters <= 0) return fallback;
  const feet = (meters * 3.28084).toFixed(1);
  return `${feet} Feet`;
}

export function formatFeetWithMeters(meters: number | null | undefined, fallback = 'N/A'): string {
  if (meters == null || isNaN(meters) || meters <= 0) return fallback;
  const feet = (meters * 3.28084).toFixed(1);
  return `${feet} ft (${meters} m)`;
}
