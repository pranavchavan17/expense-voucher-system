/**
 * Textarea is a reusable Tailwind textarea with validation support.
 */
export default function Textarea({
  label,
  error,
  className = "",
  wrapperClassName = "",
  ...props
}) {
  return (
    <label className={`block ${wrapperClassName}`}>
      {label ? <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span> : null}
      <textarea
        className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

