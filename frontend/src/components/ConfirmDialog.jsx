import { AlertTriangle, X } from "lucide-react";
import Button from "@/components/Button";

/**
 * ConfirmDialog presents a reusable modal confirmation for destructive actions.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) {
    return null;
  }

  const confirmClass =
    tone === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-brand-600 text-white hover:bg-brand-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="ghost" type="button" onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button type="button" onClick={onConfirm} className={confirmClass} disabled={loading}>
                {loading ? "Processing..." : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
