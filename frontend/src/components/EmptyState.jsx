/**
 * EmptyState renders a neutral empty placeholder box.
 */
export default function EmptyState({
  title = "Nothing to show yet",
  description = "There is nothing to display right now."
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
