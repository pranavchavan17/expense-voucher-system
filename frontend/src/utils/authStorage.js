/**
 * Reads the stored JWT token from localStorage.
 */
export function getStoredToken() {
  return localStorage.getItem("token");
}

/**
 * Reads the stored authenticated user from localStorage.
 */
export function getStoredUser() {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

/**
 * Persists token and user in localStorage.
 */
export function setAuthStorage(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Clears authentication data from localStorage.
 */
export function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
