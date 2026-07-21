import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserRound
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/utils/authRoutes";
import { registerRequest } from "@/services/authService";

/**
 * RegisterPage renders the production-ready employee registration form.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  if (isAuthenticated && currentUser?.role) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />;
  }

  const passwordValue = watch("password");

  const applyBackendErrors = (responseData) => {
    const fieldErrors =
      responseData?.errors ||
      responseData?.fieldErrors ||
      responseData?.violations ||
      responseData?.details;

    const registerFieldError = (fieldName, message) => {
      if (!fieldName || !message) {
        return;
      }

      const normalizedField = String(fieldName).toLowerCase();
      if (normalizedField.includes("fullname") || normalizedField.includes("name")) {
        setError("fullName", { type: "server", message });
      } else if (normalizedField.includes("email")) {
        setError("email", { type: "server", message });
      } else if (normalizedField.includes("password")) {
        setError("password", { type: "server", message });
      } else if (normalizedField.includes("confirm")) {
        setError("confirmPassword", { type: "server", message });
      }
    };

    if (Array.isArray(fieldErrors)) {
      fieldErrors.forEach((entry) => {
        if (typeof entry === "string") {
          toast.error(entry);
          return;
        }

        registerFieldError(
          entry?.field || entry?.property || entry?.name,
          entry?.message || entry?.defaultMessage || entry?.detail || entry?.error
        );
      });
      return;
    }

    if (fieldErrors && typeof fieldErrors === "object") {
      Object.entries(fieldErrors).forEach(([fieldName, value]) => {
        if (Array.isArray(value)) {
          value.forEach((message) => registerFieldError(fieldName, message));
        } else if (typeof value === "string") {
          registerFieldError(fieldName, value);
        } else if (value && typeof value === "object") {
          registerFieldError(
            fieldName,
            value?.message || value?.defaultMessage || value?.detail || value?.error
          );
        }
      });
    }
  };

  const onSubmit = async (values) => {
    clearErrors();

    try {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password
      };

      const response = await registerRequest(payload);
      toast.success(response?.message || "Registration successful. Please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      const responseData = error?.response?.data;
      const message = responseData?.message || error?.message || "Registration failed.";
      applyBackendErrors(responseData);
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
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
              Create your employee account in a few seconds.
            </h3>
            <p className="mt-4 text-sm leading-7 text-blue-100">
              The backend assigns the default EMPLOYEE role automatically.
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
              Join Us
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
            <p className="text-sm leading-6 text-slate-600">
              Register with your employee details to access the expense workflow.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="Pranav Chavan"
              icon={<UserRound className="h-4 w-4" />}
              error={errors.fullName?.message}
              {...register("fullName", {
                required: "Full name is required.",
                minLength: {
                  value: 2,
                  message: "Full name must be at least 2 characters."
                }
              })}
            />

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
                autoComplete="new-password"
                placeholder="Create a secure password"
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

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                icon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                className="pr-12"
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (value) => value === passwordValue || "Passwords do not match."
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-9 rounded-lg px-2 py-1 text-slate-500 transition-colors hover:text-slate-900"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 py-3 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <LoadingSpinner label="Creating account..." /> : "Create Account"}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
