import { LogOut } from "lucide-react";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

/**
 * Navbar shows the current session and logout action.
 */
export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Expense Voucher Management System
          </p>
          {currentUser ? (
            <p className="mt-1 text-sm text-slate-600">
              Signed in as <span className="font-semibold text-slate-900">{currentUser.fullName}</span> · {currentUser.role}
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
