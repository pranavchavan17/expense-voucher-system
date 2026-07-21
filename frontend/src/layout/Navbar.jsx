import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { getPageTitle } from "@/utils/navigation";

/**
 * Navbar shows the current page title, user identity, and logout action.
 */
export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Expense Voucher Management System
          </p>
          <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
          {currentUser ? (
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-semibold text-slate-900">{currentUser.fullName}</span> | {currentUser.role}
            </p>
          ) : null}
        </div>

        <Button variant="ghost" type="button" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
