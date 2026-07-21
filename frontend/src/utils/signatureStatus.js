import { downloadDirectorSignature, downloadEmployeeSignature } from "@/services/fileService";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkAvailability(loader, retries = 2, waitMs = 250) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await loader();
      return true;
    } catch (error) {
      if (error?.response?.status !== 404 || attempt === retries) {
        return false;
      }

      await delay(waitMs);
    }
  }

  return false;
}

/**
 * Checks whether the logged-in employee has a profile signature uploaded.
 */
export async function checkEmployeeSignatureAvailable() {
  return checkAvailability(downloadEmployeeSignature);
}

/**
 * Checks whether the logged-in director has a profile signature uploaded.
 */
export async function checkDirectorSignatureAvailable() {
  return checkAvailability(downloadDirectorSignature);
}
