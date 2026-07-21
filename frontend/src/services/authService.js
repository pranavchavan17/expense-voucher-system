import apiClient from "@/api/axios";

/**
 * Sends the login request to the backend login endpoint.
 */
export async function loginRequest(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

/**
 * Sends the registration request to the backend registration endpoint.
 */
export async function registerRequest(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
}
