import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loginRequest } from "@/services/authService";
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setAuthStorage
} from "@/utils/authStorage";
import { getDashboardPath } from "@/utils/authRoutes";

const AuthContext = createContext(null);

/**
 * AuthProvider manages the JWT session and role-aware navigation.
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getStoredToken());
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  const login = async (credentials) => {
    const data = await loginRequest(credentials);

    if (!data?.token || !data?.user?.role) {
      throw new Error("Invalid authentication response.");
    }

    setToken(data.token);
    setCurrentUser(data.user);
    setAuthStorage(data.token, data.user);
    toast.success(data?.message || "Welcome back");
    navigate(getDashboardPath(data.user.role), { replace: true });
    return data;
  };

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const value = useMemo(
    () => ({
      login,
      logout,
      currentUser,
      isAuthenticated: Boolean(token && currentUser)
    }),
    [currentUser, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth provides access to auth helpers and session state.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
