import apiClient from "@/api/axios";

/**
 * dashboardService fetches the role-specific dashboard summaries from the backend.
 */
export async function getEmployeeDashboard() {
  const response = await apiClient.get("/dashboard/employee");
  return response.data;
}

/**
 * Fetches the director dashboard summary.
 */
export async function getDirectorDashboard() {
  const response = await apiClient.get("/dashboard/director");
  return response.data;
}

/**
 * Fetches the accounts dashboard summary.
 */
export async function getAccountsDashboard() {
  const response = await apiClient.get("/dashboard/accounts");
  return response.data;
}
