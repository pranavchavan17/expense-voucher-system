/**
 * Input is a reusable field component with icon and validation message support.
 */
export default function Input({
  label,
  error,
  icon,
  className = "",
  wrapperClassName = "",
  ...props
}) {
  return (
    <label className={`block ${wrapperClassName}`}>
      {label ? <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span> : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
            icon ? "pl-10" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
