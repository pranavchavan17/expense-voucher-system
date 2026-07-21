/**
 * Formats a numeric dashboard count for display.
 */
export function formatCount(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

/**
 * Formats a numeric dashboard amount for display without assuming a currency symbol.
 */
export function formatAmount(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value ?? 0));
}

/**
 * Returns true when all provided dashboard metrics are zero.
 */
export function isZeroMetrics(metrics) {
  return Object.values(metrics).every((value) => Number(value ?? 0) === 0);
}
