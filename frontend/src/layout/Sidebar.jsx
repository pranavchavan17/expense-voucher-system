import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Sidebar renders role navigation for the authenticated shell.
 */
export default function Sidebar() {
  const { currentUser } = useAuth();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-600">
          Expense Voucher Management System
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">Portal</h2>
        {currentUser ? (
          <p className="mt-2 text-sm text-slate-600">
            {currentUser.fullName} · {currentUser.role}
          </p>
        ) : null}
      </div>

      <nav className="mt-8 space-y-2">
        <NavLink
          to="/dashboard/employee"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            ].join(" ")
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Employee Dashboard
        </NavLink>
        <NavLink
          to="/dashboard/director"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            ].join(" ")
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Director Dashboard
        </NavLink>
        <NavLink
          to="/dashboard/accounts"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            ].join(" ")
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Accounts Dashboard
        </NavLink>
      </nav>
    </aside>
  );
}
