package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.dto.SignatureFileResponse;
import com.pspl.expense_voucher_system.dto.UserResponse;
import com.pspl.expense_voucher_system.entity.Role;
import com.pspl.expense_voucher_system.entity.User;
import com.pspl.expense_voucher_system.entity.Voucher;
import com.pspl.expense_voucher_system.exception.SignatureNotFoundException;
import com.pspl.expense_voucher_system.exception.SignatureRequiredException;
import com.pspl.expense_voucher_system.exception.SignatureStorageException;
import com.pspl.expense_voucher_system.exception.SignatureValidationException;
import com.pspl.expense_voucher_system.exception.VoucherNotFoundException;
import com.pspl.expense_voucher_system.repository.UserRepository;
import com.pspl.expense_voucher_system.repository.VoucherRepository;
import com.pspl.expense_voucher_system.service.SignatureService;
import com.pspl.expense_voucher_system.service.SignatureStorageService;
import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * SignatureServiceImpl manages employee and director signatures, including upload, replacement, and voucher-level downloads.
 */
@Service
@Transactional
public class SignatureServiceImpl implements SignatureService {

	private static final String EMPLOYEE_ROLE = "ROLE_EMPLOYEE";
	private static final String DIRECTOR_ROLE = "ROLE_DIRECTOR";
	private static final String ACCOUNTS_ROLE = "ROLE_ACCOUNTS";
	private static final long MAX_SIGNATURE_SIZE_BYTES = 5L * 1024 * 1024;
	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/jpg", "image/png");
	private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");

	private final UserRepository userRepository;
	private final VoucherRepository voucherRepository;
	private final SignatureStorageService signatureStorageService;

	public SignatureServiceImpl(UserRepository userRepository, VoucherRepository voucherRepository,
			SignatureStorageService signatureStorageService) {
		this.userRepository = userRepository;
		this.voucherRepository = voucherRepository;
		this.signatureStorageService = signatureStorageService;
	}

	@Override
	public UserResponse uploadEmployeeSignature(MultipartFile signature) {
		User employee = getCurrentUser(Role.EMPLOYEE, "Only employees can upload employee signatures.");
		return storeSignature(employee, signature, true);
	}

	@Override
	public UserResponse uploadDirectorSignature(MultipartFile signature) {
		User director = getCurrentUser(Role.DIRECTOR, "Only directors can upload director signatures.");
		return storeSignature(director, signature, false);
	}

	@Override
	public SignatureFileResponse getEmployeeSignature() {
		User employee = getCurrentUser(Role.EMPLOYEE, "Only employees can access employee signatures.");
		return buildSignatureResponse(employee.getSignatureFilePath(), employee.getSignatureFileName(),
				employee.getSignatureContentType(), "Employee signature not found.");
	}

	@Override
	public SignatureFileResponse getDirectorSignature() {
		User director = getCurrentUser(Role.DIRECTOR, "Only directors can access director signatures.");
		return buildSignatureResponse(director.getSignatureFilePath(), director.getSignatureFileName(),
				director.getSignatureContentType(), "Director signature not found.");
	}

	@Override
	public SignatureFileResponse getVoucherEmployeeSignature(Long voucherId) {
		Voucher voucher = findVoucherForSignatureDownload(voucherId, "You are not allowed to access this signature.");
		User employee = voucher.getUser();
		return buildSignatureResponse(employee == null ? null : employee.getSignatureFilePath(),
				employee == null ? null : employee.getSignatureFileName(),
				employee == null ? null : employee.getSignatureContentType(),
				"Employee signature not found.");
	}

	@Override
	public SignatureFileResponse getVoucherDirectorSignature(Long voucherId) {
		Voucher voucher = findVoucherForSignatureDownload(voucherId, "You are not allowed to access this signature.");
		User director = voucher.getApprovedBy();
		return buildSignatureResponse(director == null ? null : director.getSignatureFilePath(),
				director == null ? null : director.getSignatureFileName(),
				director == null ? null : director.getSignatureContentType(),
				"Director signature not found.");
	}

	@Override
	public boolean currentEmployeeHasSignature() {
		return hasSignature(getCurrentOptionalUser(Role.EMPLOYEE));
	}

	@Override
	public boolean currentDirectorHasSignature() {
		return hasSignature(getCurrentOptionalUser(Role.DIRECTOR));
	}

	@Override
	public void ensureCurrentEmployeeHasSignature() {
		if (!currentEmployeeHasSignature()) {
			throw new SignatureRequiredException("Employee signature must be uploaded before voucher submission.");
		}
	}

	@Override
	public void ensureCurrentDirectorHasSignature() {
		if (!currentDirectorHasSignature()) {
			throw new SignatureRequiredException("Director signature must be uploaded before approval.");
		}
	}

	private UserResponse storeSignature(User user, MultipartFile signature, boolean employee) {
		validateSignature(signature);

		String oldPath = user.getSignatureFilePath();
		SignatureStorageService.StoredSignatureInfo storedSignatureInfo;
		try {
			storedSignatureInfo = employee
					? signatureStorageService.storeEmployeeSignature(signature)
					: signatureStorageService.storeDirectorSignature(signature);
		} catch (IOException ex) {
			throw new SignatureStorageException("Failed to store signature file.", ex);
		}

		try {
			user.setSignatureFileName(storedSignatureInfo.fileName());
			user.setSignatureFilePath(storedSignatureInfo.filePath());
			user.setSignatureContentType(storedSignatureInfo.contentType());

			User savedUser = userRepository.save(user);

			if (oldPath != null && !oldPath.isBlank() && !oldPath.equals(storedSignatureInfo.filePath())) {
				signatureStorageService.deleteIfExists(oldPath);
			}

			return toUserResponse(savedUser);
		} catch (RuntimeException ex) {
			signatureStorageService.deleteIfExists(storedSignatureInfo.filePath());
			throw ex;
		}
	}

	private SignatureFileResponse buildSignatureResponse(String filePath, String fileName, String contentType,
			String notFoundMessage) {
		if (filePath == null || filePath.isBlank() || fileName == null || fileName.isBlank()) {
			throw new SignatureNotFoundException(notFoundMessage);
		}

		Resource resource = signatureStorageService.loadAsResource(filePath);
		return new SignatureFileResponse(resource, fileName, contentType);
	}

	private Voucher findVoucherForSignatureDownload(Long voucherId, String accessDeniedMessage) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new AccessDeniedException("Authentication is required.");
		}

		boolean employee = hasAuthority(EMPLOYEE_ROLE);
		boolean director = hasAuthority(DIRECTOR_ROLE);
		boolean accounts = hasAuthority(ACCOUNTS_ROLE);

		if (employee) {
			User currentEmployee = getCurrentUser(Role.EMPLOYEE, "Only employees can access signatures.");
			return voucherRepository.findByIdAndUserId(voucherId, currentEmployee.getId())
					.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));
		}

		if (director || accounts) {
			return voucherRepository.findById(voucherId)
					.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));
		}

		throw new AccessDeniedException(accessDeniedMessage);
	}

	private boolean hasSignature(User user) {
		return user != null
				&& user.getSignatureFilePath() != null
				&& !user.getSignatureFilePath().isBlank()
				&& user.getSignatureFileName() != null
				&& !user.getSignatureFileName().isBlank();
	}

	private User getCurrentOptionalUser(Role role) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return null;
		}

		boolean hasRole = authentication.getAuthorities().stream()
				.anyMatch(authority -> ("ROLE_" + role.name()).equals(authority.getAuthority()));
		if (!hasRole) {
			return null;
		}

		return userRepository.findByEmailIgnoreCase(authentication.getName())
				.filter(user -> user.getRole() == role)
				.orElse(null);
	}

	private User getCurrentUser(Role role, String accessDeniedMessage) {
		User user = getCurrentOptionalUser(role);
		if (user == null) {
			throw new AccessDeniedException(accessDeniedMessage);
		}
		return user;
	}

	private boolean hasAuthority(String authorityName) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication != null
				&& authentication.getAuthorities().stream()
				.anyMatch(authority -> authorityName.equals(authority.getAuthority()));
	}

	private void validateSignature(MultipartFile signature) {
		if (signature == null || signature.isEmpty()) {
			throw new SignatureValidationException("Signature file is required.");
		}

		if (signature.getSize() > MAX_SIGNATURE_SIZE_BYTES) {
			throw new SignatureValidationException("Signature file must not exceed 5 MB.");
		}

		String contentType = signature.getContentType();
		if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new SignatureValidationException("Unsupported signature file type.");
		}

		String originalName = signature.getOriginalFilename();
		if (originalName == null || originalName.isBlank() || !originalName.contains(".")) {
			throw new SignatureValidationException("Signature file must have a valid extension.");
		}

		String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new SignatureValidationException("Unsupported signature file type.");
		}
	}

	private UserResponse toUserResponse(User user) {
		return new UserResponse(
				user.getId(),
				user.getFullName(),
				user.getEmail(),
				user.getRole(),
				user.getCreatedAt(),
				user.getUpdatedAt());
	}
}
