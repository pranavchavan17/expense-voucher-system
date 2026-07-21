import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { getStoredUser } from "@/utils/authStorage";

/**
 * ForbiddenPage displays a consistent 403 response when access is denied.
 */
export default function ForbiddenPage() {
  const { currentUser, logout } = useAuth();
  const message = sessionStorage.getItem("forbiddenMessage") || "You do not have permission to access this resource.";
  const user = currentUser || getStoredUser();

  useEffect(() => {
    sessionStorage.removeItem("forbiddenMessage");
  }, []);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4">
      <Card className="w-full p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">403 Forbidden</h1>
            <p className="text-sm leading-6 text-slate-600">{message}</p>
            {user ? <p className="text-sm font-medium text-slate-700">Signed in as {user.fullName} · {user.role}</p> : null}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Go to Home
          </Link>
          {user ? (
            <Button type="button" onClick={logout}>
              Logout
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
