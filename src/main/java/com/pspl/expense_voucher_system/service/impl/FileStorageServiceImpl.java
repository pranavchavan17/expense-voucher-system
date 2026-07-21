package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.exception.ReceiptStorageException;
import com.pspl.expense_voucher_system.exception.ReceiptValidationException;
import com.pspl.expense_voucher_system.service.FileStorageService;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * FileStorageServiceImpl stores receipt files locally under the uploads directory.
 */
@Service
public class FileStorageServiceImpl implements FileStorageService {

	private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");
	private final Path uploadRoot;

	public FileStorageServiceImpl() {
		this.uploadRoot = Paths.get("uploads").toAbsolutePath().normalize();
		try {
			Files.createDirectories(uploadRoot);
		} catch (IOException ex) {
			throw new IllegalStateException("Unable to create uploads directory.", ex);
		}
	}

	/**
	 * Stores the file with a UUID-based unique name while preserving the file extension.
	 */
	@Override
	public StoredFileInfo store(MultipartFile file) throws IOException {
		String originalFileName = file.getOriginalFilename();
		String extension = resolveExtension(originalFileName);
		String storedFileName = UUID.randomUUID() + "." + extension;
		Path targetPath = uploadRoot.resolve(storedFileName).normalize();

		try (InputStream inputStream = file.getInputStream()) {
			Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException ex) {
			throw new ReceiptStorageException("Failed to store receipt file.");
		}

		return new StoredFileInfo(storedFileName, targetPath.toString(), file.getContentType(), originalFileName);
	}

	/**
	 * Loads a previously stored file as a Spring Resource for download.
	 */
	@Override
	public Resource loadAsResource(String filePath) {
		try {
			Path path = resolveReadablePath(filePath);
			Resource resource = new UrlResource(path.toUri());
			if (resource.exists() && resource.isReadable()) {
				return resource;
			}
			throw new ReceiptStorageException("Stored receipt file is not readable.");
		} catch (IOException ex) {
			throw new ReceiptStorageException("Unable to load receipt file.");
		}
	}

	/**
	 * Deletes a stored file if it exists.
	 */
	@Override
	public void deleteIfExists(String filePath) {
		try {
			if (filePath != null) {
				Files.deleteIfExists(resolveReadablePath(filePath));
			}
		} catch (IOException ex) {
			throw new ReceiptStorageException("Unable to delete receipt file.");
		}
	}

	private Path resolveReadablePath(String filePath) {
		Path candidate = Paths.get(filePath).toAbsolutePath().normalize();
		if (Files.exists(candidate)) {
			return candidate;
		}

		Path fallback = uploadRoot.resolve(filePath).toAbsolutePath().normalize();
		if (Files.exists(fallback)) {
			return fallback;
		}

		return candidate;
	}

	private String resolveExtension(String originalFileName) {
		if (originalFileName == null || originalFileName.isBlank() || !originalFileName.contains(".")) {
			throw new ReceiptValidationException("Receipt file must have a valid extension.");
		}

		String extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new ReceiptValidationException("Unsupported receipt file type.");
		}
		return extension;
	}
}
