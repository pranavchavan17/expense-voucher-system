import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import MainLayout from "@/layout/MainLayout";
import LoginPage from "@/pages/LoginPage";
import EmployeeDashboardPage from "@/pages/EmployeeDashboardPage";
import DirectorDashboardPage from "@/pages/DirectorDashboardPage";
import AccountsDashboardPage from "@/pages/AccountsDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleProtectedRoute from "@/routes/RoleProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route element={<RoleProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/dashboard/employee" element={<EmployeeDashboardPage />} />
          </Route>
          <Route element={<RoleProtectedRoute allowedRoles={["DIRECTOR"]} />}>
            <Route path="/dashboard/director" element={<DirectorDashboardPage />} />
          </Route>
          <Route element={<RoleProtectedRoute allowedRoles={["ACCOUNTS"]} />}>
            <Route path="/dashboard/accounts" element={<AccountsDashboardPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
