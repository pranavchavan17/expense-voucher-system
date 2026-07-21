import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { getSidebarItems } from "@/utils/navigation";

/**
 * Sidebar renders the authenticated navigation for the active role.
 */
export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const items = getSidebarItems(currentUser?.role);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-600">
          Expense Voucher Management System
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">Portal</h2>
        {currentUser ? <p className="mt-2 text-sm text-slate-600">{currentUser.fullName} | {currentUser.role}</p> : null}
      </div>

      <nav className="mt-8 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400"
                aria-disabled="true"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </div>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <Button variant="ghost" type="button" onClick={logout} className="w-full justify-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
