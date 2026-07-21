import apiClient from "@/api/axios";

/**
 * Fetches vouchers that have been approved and are awaiting payment.
 */
export async function getPendingPayments() {
  const response = await apiClient.get("/accounts/vouchers");
  return response.data;
}

/**
 * Fetches a single approved voucher for payment processing.
 */
export async function getPendingPaymentById(id) {
  const response = await apiClient.get(`/accounts/vouchers/${id}`);
  return response.data;
}

/**
 * Marks an approved voucher as paid.
 */
export async function payVoucher(id) {
  const response = await apiClient.put(`/accounts/vouchers/${id}/pay`);
  return response.data;
}

/**
 * Downloads the receipt associated with the voucher.
 */
export async function downloadReceipt(id) {
  const response = await apiClient.get(`/vouchers/${id}/receipt`, {
    responseType: "blob"
  });
  return response;
}

