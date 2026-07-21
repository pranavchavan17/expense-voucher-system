import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  IndianRupee,
  RefreshCw,
  Search,
  WalletCards
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { getPendingPayments, payVoucher } from "@/services/accountsService";
import { getErrorMessage } from "@/utils/errorMessage";
import { recordPaymentHistory } from "@/utils/paymentHistoryStorage";
import { formatCurrency, formatDateTime } from "@/utils/voucherUtils";

const PAGE_SIZE = 8;

/**
 * AccountsPendingPaymentsPage lists approved vouchers that are ready for payment.
 */
export default function AccountsPendingPaymentsPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [payTarget, setPayTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadVouchers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPendingPayments();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, "Unable to load pending payments.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const filteredVouchers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...vouchers]
      .sort((left, right) => {
        const rightTime = new Date(right.approvalDate || right.updatedAt || right.createdAt || 0).getTime();
        const leftTime = new Date(left.approvalDate || left.updatedAt || left.createdAt || 0).getTime();
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

  const handlePay = async () => {
    if (!payTarget) {
      return;
    }

    setActionLoadingId(payTarget.id);

    try {
      const paymentResponse = await payVoucher(payTarget.id);
      recordPaymentHistory(payTarget, paymentResponse);
      toast.success("Voucher paid successfully.");
      refreshDashboards();
      await loadVouchers();
    } catch (paymentError) {
      toast.error(getErrorMessage(paymentError, "Unable to pay voucher."));
    } finally {
      setActionLoadingId(null);
      setPayTarget(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingSpinner label="Loading pending payments..." />
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
                <p className="font-semibold">Unable to load pending payments</p>
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
          title="No pending payments"
          description="There are no approved vouchers waiting for payment."
        />
      );
    }

    if (!pageItems.length) {
      return (
        <EmptyState
          title="No vouchers match your search"
          description="Try a different voucher number, employee name, or department."
        />
      );
    }

    return (
      <>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full border-separate border-spacing-0">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Voucher Number</th>
                  <th className="px-5 py-4">Employee Name</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Expense Title</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Approval Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pageItems.map((voucher) => (
                  <tr key={voucher.id} className="bg-white transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link to={`/accounts/vouchers/${voucher.id}`} className="font-semibold text-brand-700 hover:underline">
                        {voucher.voucherNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{voucher.employeeName || "-"}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{voucher.department}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{voucher.expenseTitle}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(voucher.amount)}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{formatDateTime(voucher.approvalDate)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/accounts/vouchers/${voucher.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Link>
                        <Button
                          type="button"
                          disabled={actionLoadingId === voucher.id}
                          onClick={() => setPayTarget(voucher)}
                          className="gap-1.5 bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <IndianRupee className="h-3.5 w-3.5" />
                          Pay
                        </Button>
                      </div>
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
        title="Pending Payments"
        description="Review approved vouchers and mark them as paid."
      />

      <Card className="p-4 sm:p-5">
        <Input
          label="Search vouchers"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Voucher number, employee name, or department"
          icon={<Search className="h-4 w-4" />}
        />
      </Card>

      {renderContent()}

      <ConfirmDialog
        open={Boolean(payTarget)}
        title="Mark voucher as paid?"
        description={
          payTarget
            ? `Voucher ${payTarget.voucherNumber} will be marked as paid for ${payTarget.employeeName || "this employee"}.`
            : ""
        }
        confirmLabel="Pay voucher"
        tone="primary"
        loading={actionLoadingId === payTarget?.id}
        onCancel={() => setPayTarget(null)}
        onConfirm={handlePay}
      />
    </div>
  );
}
