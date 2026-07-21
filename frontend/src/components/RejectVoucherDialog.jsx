import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, X } from "lucide-react";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";

/**
 * RejectVoucherDialog collects the mandatory rejection reason for director workflow.
 */
export default function RejectVoucherDialog({ open, voucherNumber, loading = false, onCancel, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      rejectionReason: ""
    }
  });

  useEffect(() => {
    if (open) {
      reset({ rejectionReason: "" });
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Reject voucher</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Provide a rejection reason for voucher <span className="font-semibold text-slate-900">{voucherNumber}</span>.
                </p>
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

            <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => onSubmit(values.rejectionReason.trim()))}>
              <Textarea
                label="Rejection reason"
                rows={5}
                error={errors.rejectionReason?.message}
                placeholder="Explain why the voucher is being rejected"
                {...register("rejectionReason", {
                  required: "Rejection reason is required.",
                  validate: (value) => value.trim().length > 0 || "Rejection reason is required."
                })}
              />

              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="ghost" type="button" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
                  {loading ? "Rejecting..." : "Reject voucher"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

