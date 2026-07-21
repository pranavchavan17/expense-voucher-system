import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Download, Eye, History, Search } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { getErrorMessage } from "@/utils/errorMessage";
import { downloadReceipt } from "@/services/fileService";
import { downloadBlob, getExtensionFromMime, openBlobInNewTab } from "@/utils/fileHelpers";
import { getPaymentHistoryRecords } from "@/utils/paymentHistoryStorage";
import { formatCurrency, formatDateTime } from "@/utils/voucherUtils";

const PAGE_SIZE = 8;

/**
 * PaymentHistoryPage shows paid vouchers from the backend if available, otherwise the local payment cache.
 */
export default function PaymentHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);

    try {
      const data = getPaymentHistoryRecords();
      setRecords(Array.isArray(data) ? data : []);
      setError("");
    } catch (historyError) {
      const message = getErrorMessage(historyError, "Unable to load payment history.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredRecords = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...records]
      .sort((left, right) => {
        const rightTime = new Date(right.paymentDate || right.updatedAt || right.createdAt || 0).getTime();
        const leftTime = new Date(left.paymentDate || left.updatedAt || left.createdAt || 0).getTime();
        return rightTime - leftTime;
      })
      .filter((record) => {
        if (!search) {
          return true;
        }

        return [record.voucherNumber, record.employeeName, record.department, record.paymentReference, record.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      });
  }, [query, records]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const handleReceipt = async (record, mode) => {
    const voucherId = record.voucherId || record.id;

    if (!voucherId) {
      toast.error("Voucher not available.");
      return;
    }

    try {
      const response = await downloadReceipt(voucherId);
      const blob = response.data;
      const fileName = `${record.voucherNumber}-receipt.${getExtensionFromMime(response.headers?.["content-type"] || blob?.type)}`;

      if (mode === "download") {
        downloadBlob(blob, fileName);
      } else {
        openBlobInNewTab(blob);
      }
    } catch (fileError) {
      toast.error(getErrorMessage(fileError, "Receipt file is not available."));
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <LoadingSpinner label="Loading payment history..." />
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
              <p className="font-semibold">Unable to load payment history</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const renderTable = () => {
    if (!records.length) {
      return (
        <EmptyState
          title="No payment history available"
          description="Paid vouchers will appear here after a payment is recorded in this browser session."
        />
      );
    }

    if (!pageItems.length) {
      return <EmptyState title="No vouchers match your search" description="Try a different voucher number, employee name, or reference." />;
    }

    return (
      <>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1360px] w-full border-separate border-spacing-0">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Voucher Number</th>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Payment Date</th>
                  <th className="px-5 py-4">Payment Reference</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pageItems.map((record) => (
                  <tr key={record.voucherId || record.id} className="bg-white transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link to={`/accounts/vouchers/${record.voucherId || record.id}`} className="font-semibold text-brand-700 hover:underline">
                        {record.voucherNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{record.employeeName || "-"}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{record.department || "-"}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(record.amount)}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{formatDateTime(record.paymentDate)}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{record.paymentReference || "-"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={record.status || "PAID"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleReceipt(record, "preview")}
                          className="gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                        <Button
                          type="button"
                          className="gap-1.5 bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                          onClick={() => handleReceipt(record, "download")}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
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
            Showing {pageItems.length} of {filteredRecords.length} payment records
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
        title="Payment History"
        description="Review paid vouchers and access their stored payment records."
      />

      <Card className="p-4 sm:p-5">
        <Input
          label="Search payment history"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Voucher number, employee, department, or payment reference"
          icon={<Search className="h-4 w-4" />}
        />
      </Card>

      {renderTable()}
    </div>
  );
}
