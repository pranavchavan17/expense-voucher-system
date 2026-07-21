import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileImage, FileText, LoaderCircle, PencilLine, Send, Trash2, UploadCloud, User, WalletCards } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { deleteVoucher, getVoucherById, submitVoucher } from "@/services/voucherService";
import {
  downloadReceipt,
  downloadVoucherDirectorSignature,
  downloadVoucherEmployeeSignature,
  uploadReceipt
} from "@/services/fileService";
import { getErrorMessage } from "@/utils/errorMessage";
import { checkEmployeeSignatureAvailable } from "@/utils/signatureStatus";
import { formatCurrency, formatDate, formatDateTime, isDraftVoucher } from "@/utils/voucherUtils";
import { downloadBlob, getExtensionFromMime, isAllowedFileType, isWithinSizeLimit, openBlobInNewTab } from "@/utils/fileHelpers";

/**
 * VoucherDetailsPage shows the complete voucher record and draft-only workflow actions.
 */
export default function VoucherDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const signatureUpdatedAt = location.state?.signatureUpdatedAt;
  const [voucher, setVoucher] = useState(null);
  const [employeeSignatureAvailable, setEmployeeSignatureAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptError, setReceiptError] = useState("");
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptUploadProgress, setReceiptUploadProgress] = useState(0);

  const loadVoucher = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getVoucherById(id);
      setVoucher(data);
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, "Unable to load voucher details.");
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
    loadVoucher();
    loadEmployeeSignatureStatus();
  }, [id, signatureUpdatedAt]);

  useEffect(() => {
    const handleSignatureUpdated = () => {
      loadEmployeeSignatureStatus();
      loadVoucher();
    };

    window.addEventListener("signature:updated", handleSignatureUpdated);
    return () => window.removeEventListener("signature:updated", handleSignatureUpdated);
  }, [id]);

  const openDialog = (type) => setDialog(type);
  const closeDialog = () => setDialog(null);

  const refreshDashboards = () => {
    window.dispatchEvent(new Event("dashboard:refresh"));
  };

  const handleReceiptFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setReceiptError("");

    if (!file) {
      setReceiptFile(null);
      return;
    }

    if (!isAllowedFileType(file, ["pdf", "jpg", "jpeg", "png"])) {
      setReceiptFile(null);
      setReceiptError("Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }

    if (!isWithinSizeLimit(file, 5)) {
      setReceiptFile(null);
      setReceiptError("Receipt file must be 5 MB or smaller.");
      return;
    }

    setReceiptFile(file);
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile || !voucher) {
      setReceiptError("Please choose a receipt file first.");
      return;
    }

    setReceiptUploading(true);
    setReceiptUploadProgress(0);

    try {
      await uploadReceipt(id, receiptFile, (event) => {
        const total = event.total || receiptFile.size || 1;
        setReceiptUploadProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
      });

      toast.success("Receipt uploaded successfully.");
      setReceiptFile(null);
      refreshDashboards();
      await loadVoucher();
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError, "Unable to upload receipt."));
    } finally {
      setReceiptUploading(false);
      setReceiptUploadProgress(0);
    }
  };

  const openVoucherBlob = async (loader, mode, filenamePrefix) => {
    try {
      const response = await loader(id);
      const blob = response.data;
      const mimeType = response.headers?.["content-type"] || blob?.type || "";
      const extension = getExtensionFromMime(mimeType);
      const fileName = `${filenamePrefix}.${extension}`;

      if (mode === "download") {
        downloadBlob(blob, fileName);
      } else {
        openBlobInNewTab(blob);
      }
    } catch (assetError) {
      toast.error(getErrorMessage(assetError, "The requested file is not available."));
    }
  };

  const handleConfirm = async () => {
    if (!voucher) {
      return;
    }

    setActionLoading(true);

    try {
      if (dialog === "delete") {
        await deleteVoucher(voucher.id);
        toast.success("Voucher deleted successfully.");
        refreshDashboards();
        navigate("/vouchers", { replace: true });
        return;
      }

      if (dialog === "submit") {
        const updated = await submitVoucher(voucher.id);
        setVoucher(updated);
        toast.success("Voucher submitted successfully.");
        refreshDashboards();
      }
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, "Unable to complete the requested action."));
    } finally {
      setActionLoading(false);
      closeDialog();
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

    const draft = isDraftVoucher(voucher.status);
    const receiptAvailable = Boolean(voucher.receiptAvailable);
    const directorSignatureAvailable = Boolean(voucher.directorSignatureAvailable);
    const canSubmit = draft && employeeSignatureAvailable;

    const fieldRows = [
      [
        { label: "Voucher Number", value: voucher.voucherNumber },
        { label: "Status", value: <StatusBadge status={voucher.status} /> },
        { label: "Amount", value: formatCurrency(voucher.amount) },
        { label: "Voucher Date", value: formatDate(voucher.voucherDate) }
      ],
      [
        { label: "Expense Date", value: formatDate(voucher.expenseDate) },
        { label: "Department", value: voucher.department },
        { label: "Expense Title", value: voucher.expenseTitle },
        { label: "Expense Category", value: voucher.expenseCategory }
      ]
    ];

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
                {voucher.expenseTitle} in {voucher.department} for {formatCurrency(voucher.amount)}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/vouchers"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              {draft ? (
                <Link
                  to={`/vouchers/${voucher.id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              ) : null}
              {draft ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => openDialog("delete")}
                    className="gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    onClick={() => openDialog("submit")}
                    disabled={!canSubmit}
                    className="gap-2 bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Submit
                  </Button>
                </>
              ) : null}
            </div>

            {draft && !employeeSignatureAvailable ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-start gap-3 text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Please upload your signature before submitting the voucher.</p>
                    <Link
                      to="/signature"
                      state={{ returnTo: `/vouchers/${voucher.id}` }}
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
              <UploadCloud className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Receipt Upload</h3>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Choose receipt</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleReceiptFileChange}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                />
                {receiptError ? <span className="mt-1 block text-xs text-red-600">{receiptError}</span> : null}
              </label>

              {receiptFile ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Selected file: <span className="font-semibold text-slate-900">{receiptFile.name}</span>
                </div>
              ) : null}

              {receiptUploading ? (
                <div className="space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${receiptUploadProgress}%` }} />
                  </div>
                  <p className="text-xs font-medium text-slate-500">{receiptUploadProgress}% uploaded</p>
                </div>
              ) : null}

              {draft ? (
                <Button
                  type="button"
                  onClick={handleReceiptUpload}
                  disabled={receiptUploading}
                  className="gap-2 bg-brand-600 text-white hover:bg-brand-700"
                >
                  <UploadCloud className="h-4 w-4" />
                  {receiptUploading ? "Uploading..." : "Upload Receipt"}
                </Button>
              ) : (
                <p className="text-sm text-slate-500">Receipt uploads are only allowed while the voucher is in Draft status.</p>
              )}

              {receiptAvailable ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => openVoucherBlob(downloadReceipt, "preview", `${voucher.voucherNumber}-receipt`)}
                    className="gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    Preview / Open
                  </Button>
                  <Button
                    type="button"
                    onClick={() => openVoucherBlob(downloadReceipt, "download", `${voucher.voucherNumber}-receipt`)}
                    className="gap-2 bg-brand-600 text-white hover:bg-brand-700"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Receipt not available.</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Approvals</h3>
            </div>
            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Employee Signature</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{employeeSignatureAvailable ? "Uploaded" : "Missing"}</p>
                {employeeSignatureAvailable ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        openVoucherBlob(downloadVoucherEmployeeSignature, "preview", `${voucher.voucherNumber}-employee-signature`)
                      }
                      className="gap-2"
                    >
                      <FileImage className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        openVoucherBlob(downloadVoucherEmployeeSignature, "download", `${voucher.voucherNumber}-employee-signature`)
                      }
                      className="gap-2 bg-brand-600 text-white hover:bg-brand-700"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-amber-700">Employee signature must be uploaded before the voucher can be submitted.</p>
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
                        openVoucherBlob(downloadVoucherDirectorSignature, "preview", `${voucher.voucherNumber}-director-signature`)
                      }
                      className="gap-2"
                    >
                      <FileImage className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        openVoucherBlob(downloadVoucherDirectorSignature, "download", `${voucher.voucherNumber}-director-signature`)
                      }
                      className="gap-2 bg-brand-600 text-white hover:bg-brand-700"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ) : (
                    <p className="mt-3 text-sm text-slate-500">Director signature is not required for employee submission.</p>
                  )}
                </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Voucher Information</h3>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {fieldRows[0].map((field) => (
                <div key={field.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{field.label}</dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">{field.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <WalletCards className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Expense Information</h3>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {fieldRows[1].map((field) => (
                <div key={field.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{field.label}</dt>
                  <dd className="mt-2 text-sm font-medium text-slate-900">{field.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6 xl:col-span-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600" />
              <h3 className="text-lg font-semibold text-slate-900">Employee & Workflow Details</h3>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {[
                { label: "Employee Name", value: voucher.employeeName || "-" },
                { label: "Employee Email", value: voucher.employeeEmail || "-" },
                { label: "Employee ID", value: voucher.employeeId ?? "-" },
                { label: "Approval Date", value: formatDateTime(voucher.approvalDate) },
                { label: "Rejection Reason", value: voucher.rejectionReason || "-" },
                { label: "Created At", value: formatDateTime(voucher.createdAt) },
                { label: "Updated At", value: formatDateTime(voucher.updatedAt) },
                { label: "Employee Signature", value: employeeSignatureAvailable ? "Uploaded" : "Missing" },
                { label: "Director Signature", value: directorSignatureAvailable ? "Uploaded" : "Missing" }
              ].map((field) => (
                <div key={field.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{field.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{field.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Voucher Details" description="Review the complete voucher record and its current workflow state." />
      {renderBody()}

      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog === "delete" ? "Delete voucher?" : "Submit voucher?"}
        description={
          dialog === "delete"
            ? `This will permanently delete voucher ${voucher?.voucherNumber}.`
            : `Voucher ${voucher?.voucherNumber} will be submitted for director approval.`
        }
        confirmLabel={dialog === "delete" ? "Delete" : "Submit"}
        tone={dialog === "delete" ? "danger" : "primary"}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
