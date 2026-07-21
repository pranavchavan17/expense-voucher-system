/**
 * Returns true when the file name or MIME type matches one of the allowed extensions.
 */
export function isAllowedFileType(file, allowedExtensions = []) {
  if (!file) {
    return false;
  }

  const mime = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();

  return allowedExtensions.some((extension) => {
    const normalized = extension.toLowerCase();
    const mimeMatches =
      (normalized === "jpg" || normalized === "jpeg") && (mime.includes("jpeg") || mime.includes("jpg"));
    const pngMatches = normalized === "png" && mime.includes("png");
    const pdfMatches = normalized === "pdf" && mime.includes("pdf");
    const nameMatches = name.endsWith(`.${normalized}`);

    return mimeMatches || pngMatches || pdfMatches || nameMatches;
  });
}

/**
 * Returns true when the file size is within the configured limit.
 */
export function isWithinSizeLimit(file, maxSizeMb = 5) {
  if (!file) {
    return false;
  }

  return file.size <= maxSizeMb * 1024 * 1024;
}

/**
 * Extracts the extension from a MIME type.
 */
export function getExtensionFromMime(mimeType) {
  const mime = String(mimeType || "").toLowerCase();

  if (mime.includes("pdf")) {
    return "pdf";
  }

  if (mime.includes("png")) {
    return "png";
  }

  if (mime.includes("jpeg")) {
    return "jpg";
  }

  if (mime.includes("jpg")) {
    return "jpg";
  }

  return "bin";
}

/**
 * Opens a blob in a new browser tab.
 */
export function openBlobInNewTab(blob) {
  const blobUrl = window.URL.createObjectURL(blob);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
}

/**
 * Triggers a download for a blob using the supplied filename.
 */
export function downloadBlob(blob, filename) {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
}

