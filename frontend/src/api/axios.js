import axios from "axios";
import toast from "react-hot-toast";
import { clearAuthStorage, getStoredToken } from "@/utils/authStorage";

let pendingRequests = 0;

function emitLoadingState() {
  window.dispatchEvent(new CustomEvent("app:loading", { detail: { count: pendingRequests } }));
}

function startRequest() {
  pendingRequests += 1;
  emitLoadingState();
}

function endRequest() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  emitLoadingState();
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
  startRequest();
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  endRequest();
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
  endRequest();
  return response;
}, (error) => {
  endRequest();
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
    const message = error?.response?.data?.message || "Forbidden";
    sessionStorage.setItem("forbiddenMessage", message);
    if (window.location.pathname !== "/forbidden") {
      window.location.href = "/forbidden";
    } else {
      toast.error(message);
    }
  } else if (status >= 500 && !isLoginRequest) {
    toast.error(error?.response?.data?.message || "Server error. Please try again later.");
  }

  return Promise.reject(error);
});

export default apiClient;
