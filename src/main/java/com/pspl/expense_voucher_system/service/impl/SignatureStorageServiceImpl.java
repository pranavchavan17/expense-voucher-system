package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.exception.SignatureStorageException;
import com.pspl.expense_voucher_system.exception.SignatureValidationException;
import com.pspl.expense_voucher_system.service.SignatureStorageService;
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
 * SignatureStorageServiceImpl stores signature files in role-specific folders under uploads/signatures.
 */
@Service
public class SignatureStorageServiceImpl implements SignatureStorageService {

	private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
	private static final Path EMPLOYEE_DIR = Paths.get("uploads", "signatures", "employees").toAbsolutePath().normalize();
	private static final Path DIRECTOR_DIR = Paths.get("uploads", "signatures", "directors").toAbsolutePath().normalize();

	public SignatureStorageServiceImpl() {
		try {
			Files.createDirectories(EMPLOYEE_DIR);
			Files.createDirectories(DIRECTOR_DIR);
		} catch (IOException ex) {
			throw new IllegalStateException("Unable to create signature directories.", ex);
		}
	}

	@Override
	public StoredSignatureInfo storeEmployeeSignature(MultipartFile file) throws IOException {
		return store(file, EMPLOYEE_DIR);
	}

	@Override
	public StoredSignatureInfo storeDirectorSignature(MultipartFile file) throws IOException {
		return store(file, DIRECTOR_DIR);
	}

	private StoredSignatureInfo store(MultipartFile file, Path directory) throws IOException {
		String extension = resolveExtension(file.getOriginalFilename());
		String storedFileName = UUID.randomUUID() + "." + extension;
		Path target = directory.resolve(storedFileName).normalize();

		try (InputStream inputStream = file.getInputStream()) {
			Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException ex) {
			throw new SignatureStorageException("Failed to store signature file.", ex);
		}

		return new StoredSignatureInfo(storedFileName, target.toString(), file.getContentType());
	}

	@Override
	public Resource loadAsResource(String filePath) {
		try {
			Path path = Paths.get(filePath).toAbsolutePath().normalize();
			Resource resource = new UrlResource(path.toUri());
			if (resource.exists() && resource.isReadable()) {
				return resource;
			}
			throw new SignatureStorageException("Stored signature file is not readable.");
		} catch (IOException ex) {
			throw new SignatureStorageException("Unable to load signature file.", ex);
		}
	}

	@Override
	public void deleteIfExists(String filePath) {
		try {
			if (filePath != null) {
				Files.deleteIfExists(Paths.get(filePath));
			}
		} catch (IOException ex) {
			throw new SignatureStorageException("Unable to delete signature file.", ex);
		}
	}

	private String resolveExtension(String originalFileName) {
		if (originalFileName == null || originalFileName.isBlank() || !originalFileName.contains(".")) {
			throw new SignatureValidationException("Signature file must have a valid extension.");
		}

		String extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new SignatureValidationException("Unsupported signature file type.");
		}

		return extension;
	}
}
