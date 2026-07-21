import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  XCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import RejectVoucherDialog from "@/components/RejectVoucherDialog";
import StatusBadge from "@/components/StatusBadge";
import { approveVoucher, getPendingVouchers, rejectVoucher } from "@/services/directorService";
import { getErrorMessage } from "@/utils/errorMessage";
import { checkDirectorSignatureAvailable } from "@/utils/signatureStatus";
import { formatCurrency, formatDateTime } from "@/utils/voucherUtils";

const PAGE_SIZE = 8;

/**
 * DirectorPendingVouchersPage lists submitted vouchers waiting for approval.
 */
export default function DirectorPendingVouchersPage() {
  const location = useLocation();
  const signatureUpdatedAt = location.state?.signatureUpdatedAt;
  const [vouchers, setVouchers] = useState([]);
  const [directorSignatureAvailable, setDirectorSignatureAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadVouchers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPendingVouchers();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, "Unable to load pending vouchers.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectorSignatureStatus = async () => {
    try {
      const available = await checkDirectorSignatureAvailable();
      setDirectorSignatureAvailable(available);
    } catch {
      setDirectorSignatureAvailable(false);
    }
  };

  useEffect(() => {
    loadVouchers();
    loadDirectorSignatureStatus();
  }, [signatureUpdatedAt]);

  useEffect(() => {
    const handleSignatureUpdated = () => {
      loadDirectorSignatureStatus();
      loadVouchers();
    };

    window.addEventListener("signature:updated", handleSignatureUpdated);
    return () => window.removeEventListener("signature:updated", handleSignatureUpdated);
  }, []);

  const filteredVouchers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...vouchers]
      .sort((left, right) => {
        const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
        const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
        return rightTime - leftTime;
      })
      .filter((voucher) => {
        if (!search) {
          return true;
        }

        return [voucher.voucherNumber, voucher.employeeName, voucher.department, voucher.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      });
  }, [query, vouchers]);

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredVouchers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const refreshDashboards = () => {
    window.dispatchEvent(new Event("dashboard:refresh"));
  };

  const handleApprove = async () => {
    if (!approveTarget) {
      return;
    }

    setActionLoadingId(approveTarget.id);

    try {
      await approveVoucher(approveTarget.id);
      toast.success("Voucher approved successfully.");
      refreshDashboards();
      await loadVouchers();
    } catch (approveError) {
      toast.error(getErrorMessage(approveError, "Unable to approve voucher."));
    } finally {
      setActionLoadingId(null);
      setApproveTarget(null);
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!rejectTarget) {
      return;
    }

    setActionLoadingId(rejectTarget.id);

    try {
      await rejectVoucher(rejectTarget.id, { rejectionReason });
      toast.success("Voucher rejected successfully.");
      refreshDashboards();
      await loadVouchers();
    } catch (rejectError) {
      toast.error(getErrorMessage(rejectError, "Unable to reject voucher."));
    } finally {
      setActionLoadingId(null);
      setRejectTarget(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingSpinner label="Loading pending vouchers..." />
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
                <p className="font-semibold">Unable to load pending vouchers</p>
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
          title="No pending vouchers"
          description="All submitted vouchers have already been reviewed."
        />
      );
    }

    if (!pageItems.length) {
      return (
        <EmptyState
          title="No vouchers match your search"
          description="Try a different voucher number, employee name, department, or status."
        />
      );
    }

    return (
      <>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1280px] w-full border-separate border-spacing-0">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Voucher Number</th>
                  <th className="px-5 py-4">Employee Name</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Expense Title</th>
                  <th className="px-5 py-4">Expense Category</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Submitted Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pageItems.map((voucher) => (
                  <tr key={voucher.id} className="bg-white transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link to={`/director/vouchers/${voucher.id}`} className="font-semibold text-brand-700 hover:underline">
                        {voucher.voucherNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{voucher.employeeName || "-"}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{voucher.department}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{voucher.expenseTitle}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{voucher.expenseCategory}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(voucher.amount)}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{formatDateTime(voucher.updatedAt || voucher.createdAt)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {/** Preserve the existing row actions, but disable approve if no signature exists. */}
                        <Link
                          to={`/director/vouchers/${voucher.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Link>
                        <Button
                          type="button"
                          disabled={!directorSignatureAvailable || actionLoadingId === voucher.id}
                          onClick={() => setApproveTarget(voucher)}
                          title={!directorSignatureAvailable ? "Please upload your signature before reviewing vouchers." : ""}
                          className="gap-1.5 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={!directorSignatureAvailable || actionLoadingId === voucher.id}
                          onClick={() => setRejectTarget(voucher)}
                          title={!directorSignatureAvailable ? "Please upload your signature before reviewing vouchers." : ""}
                          className="gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                      {!directorSignatureAvailable ? (
                        <div className="mt-2 text-right">
                          <Link
                            to="/director/signature"
                            state={{ returnTo: "/director/vouchers" }}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                          >
                            Go to Signature Page
                          </Link>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
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
      <PageHeader
        title="Pending Approvals"
        description="Review vouchers submitted by employees and approve or reject them."
      />

      <Card className="p-4 sm:p-5">
        <Input
          label="Search vouchers"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Voucher number, employee name, department, or status"
          icon={<Search className="h-4 w-4" />}
        />
      </Card>

      {!loading && !directorSignatureAvailable ? (
        <Card className="border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Please upload your signature before reviewing vouchers.</p>
              <Link to="/director/signature" state={{ returnTo: "/director/vouchers" }} className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700">
                Go to Signature Page
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      {renderContent()}

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Approve voucher?"
        description={
          approveTarget
            ? `Approve voucher ${approveTarget.voucherNumber} for ${approveTarget.employeeName || "this employee"}?`
            : ""
        }
        confirmLabel="Approve"
        tone="primary"
        loading={actionLoadingId === approveTarget?.id}
        onCancel={() => setApproveTarget(null)}
        onConfirm={handleApprove}
      />

      <RejectVoucherDialog
        open={Boolean(rejectTarget)}
        voucherNumber={rejectTarget?.voucherNumber}
        loading={actionLoadingId === rejectTarget?.id}
        onCancel={() => setRejectTarget(null)}
        onSubmit={handleReject}
      />
    </div>
  );
}
