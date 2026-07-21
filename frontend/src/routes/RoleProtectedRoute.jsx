import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/utils/authRoutes";

/**
 * RoleProtectedRoute prevents a user from opening another role's dashboard.
 */
export default function RoleProtectedRoute({ allowedRoles }) {
  const { currentUser } = useAuth();

  if (!currentUser?.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />;
  }

  return <Outlet />;
}
