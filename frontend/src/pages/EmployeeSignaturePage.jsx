import SignatureManagementPage from "@/components/SignatureManagementPage";
import { downloadEmployeeSignature, uploadEmployeeSignature } from "@/services/fileService";

/**
 * EmployeeSignaturePage manages the logged-in employee signature asset.
 */
export default function EmployeeSignaturePage() {
  return (
    <SignatureManagementPage
      title="Employee Signature"
      description="Upload, preview, and replace your employee signature."
      pageBackTo="/dashboard/employee"
      allowedExtensions={["jpg", "jpeg", "png"]}
      uploadSignature={uploadEmployeeSignature}
      downloadSignature={downloadEmployeeSignature}
    />
  );
}

