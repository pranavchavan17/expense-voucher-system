import apiClient from "@/api/axios";

/**
 * Uploads a receipt file for the specified voucher.
 */
export async function uploadReceipt(voucherId, file, onUploadProgress) {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await apiClient.post(`/vouchers/${voucherId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
}

/**
 * Downloads the voucher receipt as a blob.
 */
export async function downloadReceipt(voucherId) {
  return apiClient.get(`/vouchers/${voucherId}/receipt`, {
    responseType: "blob"
  });
}

/**
 * Downloads the employee signature attached to a voucher.
 */
export async function downloadVoucherEmployeeSignature(voucherId) {
  return apiClient.get(`/vouchers/${voucherId}/employee-signature`, {
    responseType: "blob"
  });
}

/**
 * Downloads the director signature attached to a voucher.
 */
export async function downloadVoucherDirectorSignature(voucherId) {
  return apiClient.get(`/vouchers/${voucherId}/director-signature`, {
    responseType: "blob"
  });
}

/**
 * Uploads the logged-in employee signature.
 */
export async function uploadEmployeeSignature(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("signature", file);

  const response = await apiClient.post("/users/signature", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
}

/**
 * Downloads the logged-in employee signature.
 */
export async function downloadEmployeeSignature() {
  return apiClient.get("/users/signature", {
    responseType: "blob"
  });
}

/**
 * Uploads the director signature.
 */
export async function uploadDirectorSignature(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("signature", file);

  const response = await apiClient.post("/director/signature", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress
  });

  return response.data;
}

/**
 * Downloads the director signature.
 */
export async function downloadDirectorSignature() {
  return apiClient.get("/director/signature", {
    responseType: "blob"
  });
}
