import { matchPath } from "react-router-dom";
import { LayoutDashboard, FilePlus2, FileText, ShieldCheck, WalletCards, History, Signature } from "lucide-react";

/**
 * Returns the current page title for the authenticated shell.
 */
export function getPageTitle(pathname) {
  const routes = [
    { path: "/dashboard/employee", title: "Employee Dashboard" },
    { path: "/dashboard/director", title: "Director Dashboard" },
    { path: "/dashboard/accounts", title: "Accounts Dashboard" },
    { path: "/vouchers/new", title: "Create Voucher" },
    { path: "/vouchers/:id/edit", title: "Edit Voucher" },
    { path: "/vouchers/:id", title: "Voucher Details" },
    { path: "/vouchers", title: "My Vouchers" },
    { path: "/signature", title: "Employee Signature" },
    { path: "/director/signature", title: "Director Signature" },
    { path: "/director/vouchers/:id", title: "Voucher Details" },
    { path: "/director/vouchers", title: "Pending Approvals" },
    { path: "/accounts/vouchers/:id", title: "Voucher Details" },
    { path: "/accounts/vouchers", title: "Pending Payments" },
    { path: "/accounts/payment-history", title: "Payment History" }
  ];

  for (const route of routes) {
    if (matchPath({ path: route.path, end: true }, pathname)) {
      return route.title;
    }
  }

  return "Expense Voucher Management System";
}

/**
 * Returns the sidebar navigation items for the active role.
 */
export function getSidebarItems(role) {
  const menus = {
    EMPLOYEE: [
      { label: "Dashboard", to: "/dashboard/employee", icon: LayoutDashboard },
      { label: "Create Voucher", to: "/vouchers/new", icon: FilePlus2 },
      { label: "My Vouchers", to: "/vouchers", icon: FileText },
      { label: "Signature", to: "/signature", icon: Signature }
    ],
    DIRECTOR: [
      { label: "Dashboard", to: "/dashboard/director", icon: LayoutDashboard },
      { label: "Pending Approvals", to: "/director/vouchers", icon: ShieldCheck },
      { label: "Signature", to: "/director/signature", icon: Signature }
    ],
    ACCOUNTS: [
      { label: "Dashboard", to: "/dashboard/accounts", icon: LayoutDashboard },
      { label: "Pending Payments", to: "/accounts/vouchers", icon: WalletCards },
      { label: "Payment History", to: "/accounts/payment-history", icon: History }
    ]
  };

  return menus[role] || [];
}
