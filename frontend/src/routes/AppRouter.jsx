import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "@/layout/AuthLayout";
import MainLayout from "@/layout/MainLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import EmployeeDashboardPage from "@/pages/EmployeeDashboardPage";
import DirectorDashboardPage from "@/pages/DirectorDashboardPage";
import AccountsDashboardPage from "@/pages/AccountsDashboardPage";
import CreateVoucherPage from "@/pages/CreateVoucherPage";
import EmployeeVouchersPage from "@/pages/EmployeeVouchersPage";
import VoucherDetailsPage from "@/pages/VoucherDetailsPage";
import EditVoucherPage from "@/pages/EditVoucherPage";
import DirectorPendingVouchersPage from "@/pages/DirectorPendingVouchersPage";
import DirectorVoucherDetailsPage from "@/pages/DirectorVoucherDetailsPage";
import EmployeeSignaturePage from "@/pages/EmployeeSignaturePage";
import DirectorSignaturePage from "@/pages/DirectorSignaturePage";
import AccountsPendingPaymentsPage from "@/pages/AccountsPendingPaymentsPage";
import AccountsVoucherDetailsPage from "@/pages/AccountsVoucherDetailsPage";
import PaymentHistoryPage from "@/pages/PaymentHistoryPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleProtectedRoute from "@/routes/RoleProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route element={<RoleProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/dashboard/employee" element={<EmployeeDashboardPage />} />
            <Route path="/vouchers/new" element={<CreateVoucherPage />} />
            <Route path="/vouchers/:id/edit" element={<EditVoucherPage />} />
            <Route path="/vouchers/:id" element={<VoucherDetailsPage />} />
            <Route path="/vouchers" element={<EmployeeVouchersPage />} />
            <Route path="/signature" element={<EmployeeSignaturePage />} />
          </Route>
          <Route element={<RoleProtectedRoute allowedRoles={["DIRECTOR"]} />}>
            <Route path="/dashboard/director" element={<DirectorDashboardPage />} />
            <Route path="/director/vouchers" element={<DirectorPendingVouchersPage />} />
            <Route path="/director/vouchers/:id" element={<DirectorVoucherDetailsPage />} />
            <Route path="/director/signature" element={<DirectorSignaturePage />} />
          </Route>
          <Route element={<RoleProtectedRoute allowedRoles={["ACCOUNTS"]} />}>
            <Route path="/dashboard/accounts" element={<AccountsDashboardPage />} />
            <Route path="/accounts/vouchers" element={<AccountsPendingPaymentsPage />} />
            <Route path="/accounts/vouchers/:id" element={<AccountsVoucherDetailsPage />} />
            <Route path="/accounts/payment-history" element={<PaymentHistoryPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
