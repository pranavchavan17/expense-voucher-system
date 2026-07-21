import apiClient from "@/api/axios";

/**
 * Fetches vouchers that are waiting for director approval.
 */
export async function getPendingVouchers() {
  const response = await apiClient.get("/director/vouchers");
  return response.data;
}

/**
 * Fetches a single pending voucher by id.
 */
export async function getPendingVoucherById(id) {
  const response = await apiClient.get(`/director/vouchers/${id}`);
  return response.data;
}

/**
 * Approves a submitted voucher.
 */
export async function approveVoucher(id) {
  const response = await apiClient.put(`/director/vouchers/${id}/approve`);
  return response.data;
}

/**
 * Rejects a submitted voucher using the supplied reason.
 */
export async function rejectVoucher(id, payload) {
  const response = await apiClient.put(`/director/vouchers/${id}/reject`, payload);
  return response.data;
}

/**
 * Downloads the voucher receipt as a binary blob.
 */
export async function downloadReceipt(id) {
  const response = await apiClient.get(`/vouchers/${id}/receipt`, {
    responseType: "blob"
  });
  return response;
}

