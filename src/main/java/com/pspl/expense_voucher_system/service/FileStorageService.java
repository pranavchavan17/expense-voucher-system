package com.pspl.expense_voucher_system.service;

import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * FileStorageService stores and loads receipt files from the local uploads directory.
 */
public interface FileStorageService {

	/**
	 * Describes a stored file after it has been written to disk.
	 */
	record StoredFileInfo(String fileName, String filePath, String contentType, String originalFileName) {
	}

	StoredFileInfo store(MultipartFile file) throws IOException;

	Resource loadAsResource(String filePath);

	void deleteIfExists(String filePath);
}
