import { Outlet } from "react-router-dom";

/**
 * AuthLayout provides a centered shell for authentication pages.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <Outlet />
    </div>
  );
}
