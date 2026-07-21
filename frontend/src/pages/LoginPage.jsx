import { useState } from "react";
import { useForm } from "react-hook-form";
import { Building2, Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/utils/authRoutes";

/**
 * LoginPage provides the professional sign-in form for the application.
 */
export default function LoginPage() {
  const { login, currentUser, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  if (isAuthenticated && currentUser?.role) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />;
  }

  const onSubmit = async (values) => {
    try {
      await login({
        email: values.email.trim(),
        password: values.password
      });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Invalid email or password";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
                Expense Voucher Management System
              </p>
              <h2 className="mt-1 text-xl font-semibold">Corporate Portal</h2>
            </div>
          </div>

          <div className="max-w-md">
            <ShieldCheck className="h-10 w-10 text-blue-200" />
            <h3 className="mt-5 text-4xl font-bold leading-tight">
              Secure sign-in for your expense workflow.
            </h3>
            <p className="mt-4 text-sm leading-7 text-blue-100">
              Access the portal with JWT-backed authentication and role-based routing.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600">
                Expense Voucher Management System
              </p>
              <h2 className="text-lg font-semibold text-slate-900">Corporate Portal</h2>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Welcome Back
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
            <p className="text-sm leading-6 text-slate-600">
              Enter your credentials to continue to your role-specific dashboard.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="user@gmail.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Enter a valid email address."
                }
              })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                className="pr-12"
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters."
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-9 rounded-lg px-2 py-1 text-slate-500 transition-colors hover:text-slate-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  {...register("rememberMe")}
                />
                Remember Me
              </label>

              <button type="button" disabled className="cursor-not-allowed text-sm font-medium text-slate-400">
                Forgot Password
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 py-3 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <LoadingSpinner label="Signing in..." />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
