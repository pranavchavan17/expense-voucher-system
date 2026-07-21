/**
 * Formats an amount in Indian rupees for dashboard and voucher displays.
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value ?? 0));
}

/**
 * Returns a stable date object for API date or date-time values.
 */
function parseDateValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats an API date value for readable display.
 */
export function formatDate(value) {
  const date = parseDateValue(value);
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

/**
 * Formats an API date-time value for readable display.
 */
export function formatDateTime(value) {
  const date = parseDateValue(value);
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

/**
 * Returns the visual style metadata for a voucher status badge.
 */
export function getVoucherStatusMeta(status) {
  switch (status) {
    case "DRAFT":
      return { label: "Draft", className: "bg-slate-100 text-slate-700 ring-slate-200" };
    case "SUBMITTED":
      return { label: "Submitted", className: "bg-blue-100 text-blue-700 ring-blue-200" };
    case "APPROVED":
      return { label: "Approved", className: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    case "REJECTED":
      return { label: "Rejected", className: "bg-red-100 text-red-700 ring-red-200" };
    case "PAID":
      return { label: "Paid", className: "bg-purple-100 text-purple-700 ring-purple-200" };
    default:
      return { label: status || "Unknown", className: "bg-slate-100 text-slate-700 ring-slate-200" };
  }
}

/**
 * Returns true when a voucher can still be edited or deleted.
 */
export function isDraftVoucher(status) {
  return status === "DRAFT";
}

