import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileDown,
  FileImage,
  FileText,
  IndianRupee,
  LoaderCircle,
  WalletCards
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { downloadReceipt, getPendingPaymentById, payVoucher } from "@/services/accountsService";
import { downloadVoucherDirectorSignature, downloadVoucherEmployeeSignature } from "@/services/fileService";
import { getErrorMessage } from "@/utils/errorMessage";
import { downloadBlob, getExtensionFromMime, openBlobInNewTab } from "@/utils/fileHelpers";
import { recordPaymentHistory } from "@/utils/paymentHistoryStorage";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/voucherUtils";

/**
 * AccountsVoucherDetailsPage shows the complete voucher record before payment.
 */
export default function AccountsVoucherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadVoucher = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPendingPaymentById(id);
      setVoucher(data);
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, "Unable to load voucher details.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoucher();
  }, [id]);

  const refreshDashboards = () => {
    window.dispatchEvent(new Event("dashboard:refresh"));
  };

  const handlePay = async () => {
    if (!voucher) {
      return;
    }

    setActionLoading(true);

    try {
      const paymentResponse = await payVoucher(voucher.id);
      recordPaymentHistory(voucher, paymentResponse);
      toast.success("Voucher paid successfully.");
      refreshDashboards();
      navigate("/accounts/vouchers", { replace: true });
    } catch (paymentError) {
      toast.error(getErrorMessage(paymentError, "Unable to pay voucher."));
    } finally {
      setActionLoading(false);
      setPayOpen(false);
    }
  };

  const handleReceiptAction = async (mode) => {
    try {
      const response = await downloadReceipt(id);
      const blob = response.data;
      const blobUrl = window.URL.createObjectURL(blob);

      if (mode === "download") {
        const contentType = response.headers?.["content-type"] || blob?.type || "";
        const extension = getExtensionFromMime(contentType);
        downloadBlob(blob, `${voucher.voucherNumber}-receipt.${extension}`);
      } else {
        openBlobInNewTab(blob);
      }

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1500);
    } catch (fileError) {
      toast.error(getErrorMessage(fileError, "Receipt file is not available."));
    }
  };

  const handleSignatureAction = async (loader, mode, filenamePrefix) => {
    try {
      const response = await loader(id);
      const blob = response.data;
      const mimeType = response.headers?.["content-type"] || blob?.type || "";
      const fileName = `${filenamePrefix}.${getExtensionFromMime(mimeType)}`;

      if (mode === "download") {
        downloadBlob(blob, fileName);
      } else {
        openBlobInNewTab(blob);
      }
    } catch (signatureError) {
      toast.error(getErrorMessage(signatureError, "Signature file is not available."));
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <Card className="p-6">
          <LoadingSpinner label="Loading voucher details..." />
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
                <p className="font-semibold">Unable to load voucher</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <Button type="button" onClick={loadVoucher} className="gap-2">
                <LoaderCircle className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    if (!voucher) {
      return <EmptyState title="Voucher not found" description="The requested voucher could not be loaded." />;
    }

    const employeeSignatureAvailable = Boolean(voucher.employeeSignatureAvailable);
    const directorSignatureAvailable = Boolean(voucher.directorSignatureAvailable);
    const receiptAvailable = Boolean(voucher.receiptAvailable);

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{voucher.voucherNumber}</h2>
                <StatusBadge status={voucher.status} />
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Approved voucher for {voucher.employeeName || "-"} in {voucher.department}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/accounts/vouchers"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <Button
                type="button"
                onClick={() => setPayOpen(true)}
                className="gap-2 bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <IndianRupee className="h-4 w-4" />
                Pay
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Voucher Information</h3>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Voucher Number", voucher.voucherNumber],
                ["Employee Name", voucher.employeeName || "-"],
                ["Employee Email", voucher.employeeEmail || "-"],
                ["Department", voucher.department],
                ["Expense Date", formatDate(voucher.expenseDate)],
                ["Voucher Date", formatDate(voucher.voucherDate)],
                ["Expense Title", voucher.expenseTitle],
                ["Expense Category", voucher.expenseCategory],
                ["Amount", formatCurrency(voucher.amount)],
                ["Approval Date", formatDateTime(voucher.approvalDate)],
                ["Status", <StatusBadge status={voucher.status} />]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <WalletCards className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Workflow & Files</h3>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Expense Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-900">{voucher.expenseDescription}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Receipt</p>
                {receiptAvailable ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button type="button" variant="ghost" onClick={() => handleReceiptAction("preview")} className="gap-2">
                      <FileDown className="h-4 w-4" />
                      Preview / Open
                    </Button>
                    <Button type="button" onClick={() => handleReceiptAction("download")} className="gap-2 bg-brand-600 text-white hover:bg-brand-700">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Receipt not available.</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Employee Signature</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{employeeSignatureAvailable ? "Uploaded" : "Missing"}</p>
                  {employeeSignatureAvailable ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          handleSignatureAction(downloadVoucherEmployeeSignature, "preview", `${voucher.voucherNumber}-employee-signature`)
                        }
                        className="gap-2"
                      >
                        <FileImage className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          handleSignatureAction(downloadVoucherEmployeeSignature, "download", `${voucher.voucherNumber}-employee-signature`)
                        }
                        className="gap-2 bg-brand-600 text-white hover:bg-brand-700"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">Employee signature is not available yet.</p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Director Signature</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{directorSignatureAvailable ? "Uploaded" : "Missing"}</p>
                  {directorSignatureAvailable ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          handleSignatureAction(downloadVoucherDirectorSignature, "preview", `${voucher.voucherNumber}-director-signature`)
                        }
                        className="gap-2"
                      >
                        <FileImage className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          handleSignatureAction(downloadVoucherDirectorSignature, "download", `${voucher.voucherNumber}-director-signature`)
                        }
                        className="gap-2 bg-brand-600 text-white hover:bg-brand-700"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">Director signature is not available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Voucher Details" description="Review approved vouchers before payment." />
      {renderBody()}

      <ConfirmDialog
        open={payOpen}
        title="Mark voucher as paid?"
        description={
          voucher
            ? `Voucher ${voucher.voucherNumber} will be marked as paid for ${voucher.employeeName || "this employee"}.`
            : ""
        }
        confirmLabel="Pay voucher"
        tone="primary"
        loading={actionLoading}
        onCancel={() => setPayOpen(false)}
        onConfirm={handlePay}
      />
    </div>
  );
}
