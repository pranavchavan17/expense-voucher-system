import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileImage, LoaderCircle, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { getErrorMessage } from "@/utils/errorMessage";
import { downloadBlob, getExtensionFromMime, isAllowedFileType, isWithinSizeLimit, openBlobInNewTab } from "@/utils/fileHelpers";
import { formatDateTime } from "@/utils/voucherUtils";

/**
 * SignatureManagementPage provides upload, replace, preview, and download for a role-owned signature.
 */
export default function SignatureManagementPage({
  title,
  description,
  pageBackTo,
  allowedExtensions,
  uploadSignature,
  downloadSignature,
  sizeLimitMb = 5
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo;
  const backTo = returnTo || pageBackTo;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signature, setSignature] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [uploadedAt, setUploadedAt] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileError, setSelectedFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const previewUrlRef = useRef("");

  const loadSignature = async (fallbackSignature = null, fallbackPreviewUrl = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await downloadSignature();
      const blob = response.data;
      if (previewUrlRef.current) {
        window.URL.revokeObjectURL(previewUrlRef.current);
      }
      const objectUrl = window.URL.createObjectURL(blob);
      previewUrlRef.current = objectUrl;

      setSignature(blob);
      setPreviewUrl(objectUrl);
      setMimeType(blob?.type || response.headers?.["content-type"] || "");
      setUploadedAt(
        response.headers?.["x-uploaded-at"] ||
          response.headers?.["uploaded-at"] ||
          response.headers?.["last-modified"] ||
          ""
      );
    } catch (fetchError) {
      const status = fetchError?.response?.status;
      if (status === 404) {
        if (fallbackSignature && fallbackPreviewUrl) {
          if (previewUrlRef.current) {
            window.URL.revokeObjectURL(previewUrlRef.current);
          }
          previewUrlRef.current = fallbackPreviewUrl;
          setSignature(fallbackSignature);
          setPreviewUrl(fallbackPreviewUrl);
          setMimeType(fallbackSignature?.type || "");
          setUploadedAt(new Date().toISOString());
        } else {
          if (previewUrlRef.current) {
            window.URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = "";
          }
          setSignature(null);
          setPreviewUrl("");
          setMimeType("");
          setUploadedAt("");
        }
      } else {
        const message = getErrorMessage(fetchError, "Unable to load signature.");
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignature();

    return () => {
      if (previewUrlRef.current) {
        window.URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFileError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isAllowedFileType(file, allowedExtensions)) {
      setSelectedFile(null);
      setSelectedFileError(`Only ${allowedExtensions.join(", ").toUpperCase()} files are allowed.`);
      return;
    }

    if (!isWithinSizeLimit(file, sizeLimitMb)) {
      setSelectedFile(null);
      setSelectedFileError(`File size must be ${sizeLimitMb} MB or less.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setSelectedFileError("Please choose a file before uploading.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      await uploadSignature(selectedFile, (progressEvent) => {
        const total = progressEvent.total || selectedFile.size || 1;
        setUploadProgress(Math.min(100, Math.round((progressEvent.loaded / total) * 100)));
      });

      toast.success(signature ? "Signature replaced successfully." : "Signature uploaded successfully.");
      const optimisticPreviewUrl = window.URL.createObjectURL(selectedFile);
      if (previewUrlRef.current) {
        window.URL.revokeObjectURL(previewUrlRef.current);
      }
      previewUrlRef.current = optimisticPreviewUrl;
      setSignature(selectedFile);
      setPreviewUrl(optimisticPreviewUrl);
      setMimeType(selectedFile.type || "");
      setUploadedAt(new Date().toISOString());
      setSelectedFile(null);
      window.dispatchEvent(new CustomEvent("signature:updated", { detail: { updatedAt: Date.now() } }));
      await loadSignature(selectedFile, optimisticPreviewUrl);
      if (returnTo) {
        navigate(returnTo, { replace: true, state: { signatureUpdatedAt: Date.now() } });
      }
    } catch (uploadError) {
      const message = getErrorMessage(uploadError, "Unable to upload signature.");
      setSelectedFileError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = () => {
    if (!signature) {
      toast.error("Signature is not available.");
      return;
    }

    const extension = getExtensionFromMime(mimeType);
    downloadBlob(signature, `signature.${extension}`);
  };

  const handlePreview = () => {
    if (!signature) {
      toast.error("Signature is not available.");
      return;
    }

    openBlobInNewTab(signature);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={title} description={description} />
        <Link
          to={backTo}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          Back
        </Link>
      </div>

      {loading ? (
        <Card className="p-6">
          <LoadingSpinner label="Loading signature..." />
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3 text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Unable to load signature</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <Button type="button" onClick={loadSignature} className="gap-2">
                <LoaderCircle className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${signature ? "text-emerald-600" : "text-slate-400"}`} />
              <h2 className="text-lg font-semibold text-slate-900">Current Signature Preview</h2>
            </div>

            {signature ? (
              <div className="mt-5 space-y-4">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                  <img src={previewUrl} alt="Current signature preview" className="h-auto w-full object-contain" />
                </div>
                {uploadedAt ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Upload Date: <span className="font-semibold text-slate-900">{formatDateTime(uploadedAt)}</span>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="ghost" onClick={handlePreview} className="gap-2">
                    <FileImage className="h-4 w-4" />
                    Preview Full Size
                  </Button>
                  <Button type="button" onClick={handleDownload} className="gap-2 bg-brand-600 text-white hover:bg-brand-700">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-56 w-full max-w-md items-center justify-center rounded-3xl border border-slate-200 bg-white">
                    <svg viewBox="0 0 400 220" className="h-full w-full max-w-[16rem]" aria-hidden="true">
                      <rect x="32" y="36" width="336" height="148" rx="20" fill="#f8fafc" stroke="#cbd5e1" />
                      <path
                        d="M82 134c30-34 58-52 88-52 27 0 48 10 66 30 18 20 35 30 58 30 27 0 48-10 72-36"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="124" cy="88" r="18" fill="#bfdbfe" />
                      <path
                        d="M113 88l8 8 14-16"
                        fill="none"
                        stroke="#1d4ed8"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">No signature uploaded</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Upload a signature to enable workflow validation and previews.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-semibold text-slate-900">{signature ? "Replace Signature" : "Upload Signature"}</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Choose file</span>
                <input
                  type="file"
                  accept={allowedExtensions.map((extension) => `.${extension}`).join(",")}
                  onChange={handleFileChange}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                />
                {selectedFileError ? <span className="mt-1 block text-xs text-red-600">{selectedFileError}</span> : null}
                <p className="mt-2 text-xs text-slate-500">
                  Supported formats: {allowedExtensions.map((extension) => extension.toUpperCase()).join(", ")}. Maximum file size: {sizeLimitMb} MB.
                </p>
              </label>

              {selectedFile ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Selected file: <span className="font-semibold text-slate-900">{selectedFile.name}</span>
                </div>
              ) : null}

              {uploading ? (
                <div className="space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs font-medium text-slate-500">{uploadProgress}% uploaded</p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="ghost" onClick={handlePreview} disabled={!signature} className="gap-2">
                  <FileImage className="h-4 w-4" />
                  Preview Full Size
                </Button>
                <Button type="button" onClick={handleUpload} disabled={uploading} className="gap-2 bg-brand-600 text-white hover:bg-brand-700">
                  {uploading ? "Uploading..." : "Save Signature"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
