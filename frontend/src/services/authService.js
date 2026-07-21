import apiClient from "@/api/axios";

/**
 * Sends the login request to the backend login endpoint.
 */
export async function loginRequest(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}
