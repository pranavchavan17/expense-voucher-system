import apiClient from "@/api/axios";

/**
 * Fetches all vouchers that belong to the logged-in employee.
 */
export async function getMyVouchers() {
  const response = await apiClient.get("/vouchers");
  return response.data;
}

/**
 * Fetches a voucher by its identifier.
 */
export async function getVoucherById(id) {
  const response = await apiClient.get(`/vouchers/${id}`);
  return response.data;
}

/**
 * Creates a new employee voucher.
 */
export async function createVoucher(payload) {
  const response = await apiClient.post("/vouchers", payload);
  return response.data;
}

/**
 * Updates an existing draft voucher.
 */
export async function updateVoucher(id, payload) {
  const response = await apiClient.put(`/vouchers/${id}`, payload);
  return response.data;
}

/**
 * Deletes a draft voucher.
 */
export async function deleteVoucher(id) {
  const response = await apiClient.delete(`/vouchers/${id}`);
  return response.data;
}

/**
 * Submits a draft voucher for director approval.
 */
export async function submitVoucher(id) {
  const response = await apiClient.put(`/vouchers/${id}/submit`);
  return response.data;
}

