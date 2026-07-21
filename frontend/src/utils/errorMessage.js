/**
 * Extracts a user-friendly error message from an Axios or fetch failure.
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.message || error?.message || fallback;
}

