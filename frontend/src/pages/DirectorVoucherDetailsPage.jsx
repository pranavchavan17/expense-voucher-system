import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  FileDown,
  FileText,
  FileImage,
  LoaderCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import RejectVoucherDialog from "@/components/RejectVoucherDialog";
import StatusBadge from "@/components/StatusBadge";
import { approveVoucher, downloadReceipt, getPendingVoucherById, rejectVoucher } from "@/services/directorService";
import { getErrorMessage } from "@/utils/errorMessage";
import { checkDirectorSignatureAvailable } from "@/utils/signatureStatus";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/voucherUtils";
import { downloadVoucherEmployeeSignature } from "@/services/fileService";
import { openBlobInNewTab } from "@/utils/fileHelpers";

/**
 * DirectorVoucherDetailsPage shows the full voucher record and approval actions.
 */
export default function DirectorVoucherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const signatureUpdatedAt = location.state?.signatureUpdatedAt;
  const [voucher, setVoucher] = useState(null);
  const [directorSignatureAvailable, setDirectorSignatureAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [employeeSignatureNotice, setEmployeeSignatureNotice] = useState("");

  const loadVoucher = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPendingVoucherById(id);
      setVoucher(data);
      if (data?.employeeSignatureAvailable) {
        setEmployeeSignatureNotice("");
      }
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, "Unable to load voucher details.");
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
    loadVoucher();
    loadDirectorSignatureStatus();
  }, [id, signatureUpdatedAt]);

  useEffect(() => {
    const handleSignatureUpdated = () => {
      loadDirectorSignatureStatus();
      loadVoucher();
    };

    window.addEventListener("signature:updated", handleSignatureUpdated);
    return () => window.removeEventListener("signature:updated", handleSignatureUpdated);
  }, [id]);

  const refreshDashboards = () => {
    window.dispatchEvent(new Event("dashboard:refresh"));
  };

  const handleApprove = async () => {
    if (!voucher) {
      return;
    }

    if (!directorSignatureAvailable) {
      toast.error("Please upload your signature before reviewing vouchers.");
      return;
    }

    setActionLoading(true);

    try {
      await approveVoucher(voucher.id);
      toast.success("Voucher approved successfully.");
      refreshDashboards();
      navigate("/director/vouchers", { replace: true });
    } catch (approveError) {
      toast.error(getErrorMessage(approveError, "Unable to approve voucher."));
    } finally {
      setActionLoading(false);
      setApproveOpen(false);
    }
  };

  const handleReject = async (rejectionReason) => {
    if (!voucher) {
      return;
    }

    if (!directorSignatureAvailable) {
      toast.error("Please upload your signature before reviewing vouchers.");
      return;
    }

    setActionLoading(true);

    try {
      await rejectVoucher(voucher.id, { rejectionReason });
      toast.success("Voucher rejected successfully.");
      refreshDashboards();
      navigate("/director/vouchers", { replace: true });
    } catch (rejectError) {
      toast.error(getErrorMessage(rejectError, "Unable to reject voucher."));
    } finally {
      setActionLoading(false);
      setRejectOpen(false);
    }
  };

  const handleReceiptAction = async (mode) => {
    try {
      const response = await downloadReceipt(id);
      const blob = response.data;
      const mimeType = blob?.type || response.headers?.["content-type"] || "application/octet-stream";
      const blobUrl = window.URL.createObjectURL(blob);

      if (mode === "download") {
        const extension = mimeType.includes("pdf") ? "pdf" : mimeType.includes("png") ? "png" : mimeType.includes("jpeg") ? "jpg" : mimeType.includes("jpg") ? "jpg" : "bin";
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${voucher.voucherNumber}-receipt.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      }

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1500);
    } catch (fileError) {
      toast.error(getErrorMessage(fileError, "Receipt file is not available."));
    }
  };

  const handleEmployeeSignaturePreview = async () => {
    if (!voucher?.employeeSignatureAvailable) {
      setEmployeeSignatureNotice("No employee signature uploaded.");
      toast.error("No employee signature uploaded.");
      return;
    }

    try {
      const response = await downloadVoucherEmployeeSignature(id);
      const blob = response.data;
      openBlobInNewTab(blob);
      setEmployeeSignatureNotice("");
    } catch (signatureError) {
      const message =
        signatureError?.response?.status === 404
          ? "No employee signature uploaded."
          : getErrorMessage(signatureError, "Signature file is not available.");
      setEmployeeSignatureNotice(message);
      toast.error(message);
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
                Voucher raised by {voucher.employeeName || "-"} for {voucher.department}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/director/vouchers"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRejectOpen(true)}
                disabled={!directorSignatureAvailable}
                className="gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button
                type="button"
                onClick={() => setApproveOpen(true)}
                disabled={!directorSignatureAvailable}
                className="gap-2 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            </div>

            {!directorSignatureAvailable ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-start gap-3 text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Please upload your signature before reviewing vouchers.</p>
                    <Link
                      to="/director/signature"
                      state={{ returnTo: `/director/vouchers/${voucher.id}` }}
                      className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                    >
                      Go to Signature Page
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
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
                ["Current Status", <StatusBadge status={voucher.status} />]
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
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Workflow & Files</h3>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Expense Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-900">{voucher.expenseDescription}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Employee Signature</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{employeeSignatureAvailable ? "Uploaded" : "Missing"}</p>
                  {employeeSignatureAvailable ? null : (
                    <p className="mt-2 text-sm text-slate-500">Employee signature is missing.</p>
                  )}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Director Signature</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{directorSignatureAvailable ? "Uploaded" : "Missing"}</p>
                  {directorSignatureAvailable ? null : (
                    <p className="mt-2 text-sm text-amber-700">Director signature is required before approval.</p>
                  )}
                </div>
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
                      <FileDown className="h-4 w-4" />
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
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleEmployeeSignaturePreview}
                      className="gap-2"
                    >
                      <FileImage className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                  {employeeSignatureNotice ? <p className="mt-2 text-sm text-slate-600">{employeeSignatureNotice}</p> : null}
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Director Signature</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{directorSignatureAvailable ? "Uploaded" : "Missing"}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Created At</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(voucher.createdAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Updated At</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(voucher.updatedAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approval Date</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(voucher.approvalDate)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rejection Reason</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{voucher.rejectionReason || "-"}</p>
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
      <PageHeader title="Voucher Details" description="Review all voucher fields before approving or rejecting." />
      {renderBody()}

      <ConfirmDialog
        open={approveOpen}
        title="Approve voucher?"
        description={
          voucher
            ? `Approve voucher ${voucher.voucherNumber} for ${voucher.employeeName || "this employee"}?`
            : ""
        }
        confirmLabel="Approve"
        tone="primary"
        loading={actionLoading}
        onCancel={() => setApproveOpen(false)}
        onConfirm={handleApprove}
      />

      <RejectVoucherDialog
        open={rejectOpen}
        voucherNumber={voucher?.voucherNumber}
        loading={actionLoading}
        onCancel={() => setRejectOpen(false)}
        onSubmit={handleReject}
      />
    </div>
  );
}
