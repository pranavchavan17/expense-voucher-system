import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Eye, LoaderCircle, PlusCircle, RefreshCw, Search, Send, Trash2, PencilLine } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { getMyVouchers, deleteVoucher, submitVoucher } from "@/services/voucherService";
import { getErrorMessage } from "@/utils/errorMessage";
import { checkEmployeeSignatureAvailable } from "@/utils/signatureStatus";
import { formatCurrency, formatDate, isDraftVoucher } from "@/utils/voucherUtils";

const PAGE_SIZE = 8;

/**
 * EmployeeVouchersPage lists the logged-in employee's vouchers with local search, sorting, and pagination.
 */
export default function EmployeeVouchersPage() {
  const location = useLocation();
  const signatureUpdatedAt = location.state?.signatureUpdatedAt;
  const [vouchers, setVouchers] = useState([]);
  const [employeeSignatureAvailable, setEmployeeSignatureAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadVouchers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyVouchers();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, "Unable to load your vouchers.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeSignatureStatus = async () => {
    try {
      const available = await checkEmployeeSignatureAvailable();
      setEmployeeSignatureAvailable(available);
    } catch {
      setEmployeeSignatureAvailable(false);
    }
  };

  useEffect(() => {
    loadVouchers();
    loadEmployeeSignatureStatus();
  }, [signatureUpdatedAt]);

  useEffect(() => {
    const handleSignatureUpdated = () => {
      loadEmployeeSignatureStatus();
      loadVouchers();
    };

    window.addEventListener("signature:updated", handleSignatureUpdated);
    return () => window.removeEventListener("signature:updated", handleSignatureUpdated);
  }, []);

  const filteredVouchers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...vouchers]
      .sort((a, b) => {
        const left = new Date(b.createdAt || b.updatedAt || 0).getTime();
        const right = new Date(a.createdAt || a.updatedAt || 0).getTime();
        return left - right;
      })
      .filter((voucher) => {
        if (!search) {
          return true;
        }

        return [voucher.voucherNumber, voucher.expenseTitle, voucher.department]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      });
  }, [query, vouchers]);

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const pageItems = filteredVouchers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openDialog = (type, voucher) => {
    setDialog({ type, voucher });
  };

  const closeDialog = () => {
    setDialog(null);
  };

  const handleDialogConfirm = async () => {
    if (!dialog?.voucher) {
      return;
    }

    const { type, voucher } = dialog;
    setActionLoadingId(voucher.id);

    try {
      if (type === "delete") {
        await deleteVoucher(voucher.id);
        toast.success("Voucher deleted successfully.");
      } else if (type === "submit") {
        await submitVoucher(voucher.id);
        toast.success("Voucher submitted successfully.");
      }

      await loadVouchers();
    } catch (dialogError) {
      toast.error(getErrorMessage(dialogError, "Unable to complete the requested action."));
    } finally {
      setActionLoadingId(null);
      closeDialog();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingSpinner label="Loading vouchers..." />
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3 text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Unable to load vouchers</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <Button type="button" onClick={loadVouchers} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    if (!vouchers.length) {
      return (
        <EmptyState
          title="No vouchers yet"
          description="Create your first voucher to start tracking expenses."
        />
      );
    }

    if (!pageItems.length) {
      return (
        <EmptyState
          title="No vouchers match your search"
          description="Try a different voucher number, title, or department."
        />
      );
    }

    return (
      <>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full border-separate border-spacing-0">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Voucher Number</th>
                  <th className="px-5 py-4">Expense Date</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Expense Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pageItems.map((voucher) => {
                  const draft = isDraftVoucher(voucher.status);
                  const canSubmit = draft && employeeSignatureAvailable;

                  return (
                    <tr key={voucher.id} className="bg-white transition-colors hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <Link to={`/vouchers/${voucher.id}`} className="font-semibold text-brand-700 hover:underline">
                          {voucher.voucherNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">{formatDate(voucher.expenseDate)}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{voucher.department}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{voucher.expenseTitle}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{voucher.expenseCategory}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(voucher.amount)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={voucher.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/vouchers/${voucher.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Link>
                          <Link
                            to={draft ? `/vouchers/${voucher.id}/edit` : "#"}
                            aria-disabled={!draft}
                            onClick={(event) => {
                              if (!draft) {
                                event.preventDefault();
                              }
                            }}
                            className={[
                              "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                              draft
                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                            ].join(" ")}
                          >
                            <PencilLine className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={!draft || actionLoadingId === voucher.id}
                            onClick={() => openDialog("delete", voucher)}
                            className="gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                          <Button
                          type="button"
                          disabled={!canSubmit || actionLoadingId === voucher.id}
                          onClick={() => openDialog("submit", voucher)}
                          title={draft && !employeeSignatureAvailable ? "Please upload your signature before submitting the voucher." : ""}
                          className="gap-1.5 bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Submit
                          </Button>
                        </div>
                        {draft && !employeeSignatureAvailable ? (
                          <div className="mt-2 text-right">
                            <Link
                              to="/signature"
                              state={{ returnTo: `/vouchers/${voucher.id}` }}
                              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                            >
                              Upload signature before submitting
                            </Link>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing {pageItems.length} of {filteredVouchers.length} vouchers
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Page {safePage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="ghost"
              disabled={safePage === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="My Vouchers"
          description="Search, review, edit, submit, or delete your draft vouchers."
        />
        <Link
          to="/vouchers/new"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Voucher
        </Link>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <Input
            label="Search vouchers"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Voucher number, expense title, or department"
            icon={<Search className="h-4 w-4" />}
          />
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Total records: <span className="font-semibold text-slate-900">{vouchers.length}</span>
          </div>
        </div>
      </Card>

      {renderContent()}

      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.type === "delete" ? "Delete voucher?" : "Submit voucher?"}
        description={
          dialog?.type === "delete"
            ? `This will permanently delete voucher ${dialog?.voucher?.voucherNumber}.`
            : `Voucher ${dialog?.voucher?.voucherNumber} will be sent for director approval.`
        }
        confirmLabel={dialog?.type === "delete" ? "Delete" : "Submit"}
        tone={dialog?.type === "delete" ? "danger" : "primary"}
        onCancel={closeDialog}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}
