const PAYMENT_HISTORY_KEY = "paymentHistory";

/**
 * Returns the locally cached payment history records.
 */
export function getPaymentHistoryRecords() {
  try {
    const raw = localStorage.getItem(PAYMENT_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists a paid voucher into the local payment history cache.
 */
export function recordPaymentHistory(voucher, paymentResponse) {
  if (!voucher || !paymentResponse) {
    return;
  }

  const nextRecord = {
    id: voucher.id,
    voucherId: voucher.id,
    voucherNumber: voucher.voucherNumber,
    employeeName: voucher.employeeName || "-",
    employeeEmail: voucher.employeeEmail || "-",
    department: voucher.department || "-",
    expenseTitle: voucher.expenseTitle || "-",
    expenseCategory: voucher.expenseCategory || "-",
    expenseDescription: voucher.expenseDescription || "-",
    amount: voucher.amount ?? 0,
    paymentDate: paymentResponse.paymentDate || voucher.paymentDate || null,
    paymentReference: paymentResponse.paymentReference || voucher.paymentReference || "-",
    status: paymentResponse.status || "PAID",
    receiptAvailable: Boolean(voucher.receiptAvailable || voucher.receiptFileName || voucher.receiptFilePath),
    employeeSignatureAvailable: Boolean(voucher.employeeSignatureAvailable),
    directorSignatureAvailable: Boolean(voucher.directorSignatureAvailable),
    approvalDate: voucher.approvalDate || null,
    voucherDate: voucher.voucherDate || null,
    expenseDate: voucher.expenseDate || null
  };

  const current = getPaymentHistoryRecords().filter((item) => item.voucherId !== nextRecord.voucherId);
  current.unshift(nextRecord);
  localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(current));
}
