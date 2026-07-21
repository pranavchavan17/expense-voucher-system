package com.pspl.expense_voucher_system.service;

import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * SignatureStorageService stores signature image files on the local filesystem.
 */
public interface SignatureStorageService {

	/**
	 * Describes a stored signature file.
	 */
	record StoredSignatureInfo(String fileName, String filePath, String contentType) {
	}

	StoredSignatureInfo storeEmployeeSignature(MultipartFile file) throws IOException;

	StoredSignatureInfo storeDirectorSignature(MultipartFile file) throws IOException;

	Resource loadAsResource(String filePath);

	void deleteIfExists(String filePath);
}
