import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import VoucherFormFields from "@/components/VoucherFormFields";
import { createVoucher } from "@/services/voucherService";
import { getErrorMessage } from "@/utils/errorMessage";

/**
 * CreateVoucherPage lets an employee create a new draft voucher using the backend API.
 */
export default function CreateVoucherPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      voucherDate: "",
      expenseDate: "",
      department: "",
      expenseTitle: "",
      expenseCategory: "",
      expenseDescription: "",
      amount: ""
    }
  });

  const onSubmit = async (values) => {
    setSubmitting(true);

    try {
      await createVoucher({
        ...values,
        amount: Number(values.amount)
      });
      toast.success("Voucher created successfully.");
      window.dispatchEvent(new Event("dashboard:refresh"));
      navigate("/vouchers", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create voucher."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Create Voucher"
          description="Capture expense details and save the voucher as a draft."
        />
        <Link
          to="/vouchers"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          My Vouchers
        </Link>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <Sparkles className="h-4 w-4" />
          New vouchers are created with Draft status by default.
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <VoucherFormFields register={register} errors={errors} />

          <div className="flex flex-wrap justify-end gap-3">
            <Link
              to="/vouchers"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={submitting} className="min-w-36 gap-2 bg-brand-600 text-white hover:bg-brand-700">
              {submitting ? <LoadingSpinner label="Saving..." /> : "Create Voucher"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
