import axios from "axios";
import toast from "react-hot-toast";
import { clearAuthStorage, getStoredToken } from "@/utils/authStorage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isLoginRequest = url.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      clearAuthStorage();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (!error?.response && !isLoginRequest) {
      toast.error("Network failure. Please try again.");
    } else if (status === 403 && !isLoginRequest) {
      toast.error(error?.response?.data?.message || "Forbidden");
    } else if (status >= 500 && !isLoginRequest) {
      toast.error(error?.response?.data?.message || "Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
