/**
 * Clamp a number between min and max values.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format a number with commas as thousands separators.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format bytes to a human-readable string (KB, MB, GB, etc.).
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(decimals))} ${sizes[index]}`;
}

/**
 * Format a number as a percentage string.
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Round a number to a specified number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Linear interpolation between two numbers.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map a value from one range to another.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Format a number in compact notation (e.g., 1.2K, 3.5M).
 */
export function formatCompact(value: number): string {
  if (Math.abs(value) < 1000) return String(value);

  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const i = Math.floor(Math.log10(Math.abs(value)) / 3);
  const index = Math.min(i, suffixes.length - 1);
  const scaled = value / Math.pow(1000, index);

  if (scaled === Math.floor(scaled)) return `${scaled}${suffixes[index]}`;
  return `${scaled.toFixed(1)}${suffixes[index]}`;
}
