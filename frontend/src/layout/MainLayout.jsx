import { Outlet } from "react-router-dom";
import Sidebar from "@/layout/Sidebar";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";

/**
 * MainLayout renders the application shell for authenticated users.
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
