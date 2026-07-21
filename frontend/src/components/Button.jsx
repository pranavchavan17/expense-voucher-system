/**
 * Button is a reusable Tailwind button with primary and ghost variants.
 */
export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    ghost: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
