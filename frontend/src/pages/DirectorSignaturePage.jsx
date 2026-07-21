import SignatureManagementPage from "@/components/SignatureManagementPage";
import { downloadDirectorSignature, uploadDirectorSignature } from "@/services/fileService";

/**
 * DirectorSignaturePage manages the logged-in director signature asset.
 */
export default function DirectorSignaturePage() {
  return (
    <SignatureManagementPage
      title="Director Signature"
      description="Upload, preview, and replace the director signature."
      pageBackTo="/dashboard/director"
      allowedExtensions={["jpg", "jpeg", "png"]}
      uploadSignature={uploadDirectorSignature}
      downloadSignature={downloadDirectorSignature}
    />
  );
}

