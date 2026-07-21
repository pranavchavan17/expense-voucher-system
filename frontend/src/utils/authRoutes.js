/**
 * Returns the dashboard path for the authenticated role.
 */
export function getDashboardPath(role) {
  switch (role) {
    case "DIRECTOR":
      return "/dashboard/director";
    case "ACCOUNTS":
      return "/dashboard/accounts";
    case "EMPLOYEE":
      return "/dashboard/employee";
    default:
      return "/login";
  }
}
