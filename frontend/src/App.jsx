import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import AppRouter from "@/routes/AppRouter";
import GlobalLoadingBar from "@/components/GlobalLoadingBar";

export default function App() {
  return (
    <AuthProvider>
      <GlobalLoadingBar />
      <AppRouter />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </AuthProvider>
  );
}
