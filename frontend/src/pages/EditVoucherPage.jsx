import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, LoaderCircle, PencilLine } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import VoucherFormFields from "@/components/VoucherFormFields";
import { getVoucherById, updateVoucher } from "@/services/voucherService";
import { getErrorMessage } from "@/utils/errorMessage";
import { isDraftVoucher } from "@/utils/voucherUtils";

/**
 * EditVoucherPage updates an existing draft voucher using the backend API.
 */
export default function EditVoucherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
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

  useEffect(() => {
    const loadVoucher = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getVoucherById(id);
        setVoucher(data);
        reset({
          voucherDate: data.voucherDate || "",
          expenseDate: data.expenseDate || "",
          department: data.department || "",
          expenseTitle: data.expenseTitle || "",
          expenseCategory: data.expenseCategory || "",
          expenseDescription: data.expenseDescription || "",
          amount: data.amount ?? ""
        });
      } catch (fetchError) {
        const message = getErrorMessage(fetchError, "Unable to load voucher.");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadVoucher();
  }, [id, reset]);

  const onSubmit = async (values) => {
    setSubmitting(true);

    try {
      const updated = await updateVoucher(id, {
        ...values,
        amount: Number(values.amount)
      });
      toast.success("Voucher updated successfully.");
      navigate(`/vouchers/${updated.id}`, { replace: true });
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, "Unable to update voucher."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <LoadingSpinner label="Loading voucher..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-6">
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-red-800">Unable to load voucher</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
          <Link
            to="/vouchers"
            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Vouchers
          </Link>
        </div>
      </Card>
    );
  }

  if (!voucher) {
    return <EmptyState title="Voucher not found" description="The requested voucher could not be loaded." />;
  }

  if (!isDraftVoucher(voucher.status)) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <PencilLine className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Editing is disabled</h2>
              <p className="mt-1 text-sm text-slate-600">Only draft vouchers can be edited.</p>
              <div className="mt-3">
                <StatusBadge status={voucher.status} />
              </div>
            </div>
          </div>
          <Link
            to={`/vouchers/${voucher.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            View voucher
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Voucher" description={`Update draft voucher ${voucher.voucherNumber}.`} />

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <PencilLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{voucher.voucherNumber}</p>
              <p className="text-sm text-slate-600">Draft vouchers can be edited and resubmitted.</p>
            </div>
          </div>
          <Link
            to={`/vouchers/${voucher.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <VoucherFormFields register={register} errors={errors} />
          <div className="flex flex-wrap justify-end gap-3">
            <Link
              to={`/vouchers/${voucher.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={submitting} className="min-w-36 gap-2 bg-brand-600 text-white hover:bg-brand-700">
              {submitting ? <LoadingSpinner label="Saving..." /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
