package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.dto.CreateVoucherRequest;
import com.pspl.expense_voucher_system.dto.ReceiptFileResponse;
import com.pspl.expense_voucher_system.dto.UpdateVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.entity.Role;
import com.pspl.expense_voucher_system.entity.User;
import com.pspl.expense_voucher_system.entity.Voucher;
import com.pspl.expense_voucher_system.entity.VoucherStatus;
import com.pspl.expense_voucher_system.exception.ReceiptNotFoundException;
import com.pspl.expense_voucher_system.exception.ReceiptValidationException;
import com.pspl.expense_voucher_system.exception.ReceiptStorageException;
import com.pspl.expense_voucher_system.exception.VoucherNotFoundException;
import com.pspl.expense_voucher_system.exception.VoucherStateException;
import com.pspl.expense_voucher_system.service.FileStorageService;
import com.pspl.expense_voucher_system.service.SignatureService;
import com.pspl.expense_voucher_system.repository.UserRepository;
import com.pspl.expense_voucher_system.repository.VoucherRepository;
import com.pspl.expense_voucher_system.service.VoucherService;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * VoucherServiceImpl enforces employee ownership, draft-only edits, and voucher submission rules.
 */
@Service
@Transactional
public class VoucherServiceImpl implements VoucherService {

	private static final String VOUCHER_PREFIX = "VCH";
	private static final String EMPLOYEE_ROLE = "ROLE_EMPLOYEE";
	private static final long MAX_RECEIPT_SIZE_BYTES = 5L * 1024 * 1024;
	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("application/pdf", "image/jpeg", "image/png");
	private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");

	private final VoucherRepository voucherRepository;
	private final UserRepository userRepository;
	private final FileStorageService fileStorageService;
	private final SignatureService signatureService;

	public VoucherServiceImpl(VoucherRepository voucherRepository, UserRepository userRepository,
			FileStorageService fileStorageService, SignatureService signatureService) {
		this.voucherRepository = voucherRepository;
		this.userRepository = userRepository;
		this.fileStorageService = fileStorageService;
		this.signatureService = signatureService;
	}

	/**
	 * Creates a new draft voucher for the currently authenticated employee.
	 */
	@Override
	public VoucherResponse createVoucher(CreateVoucherRequest request) {
		User currentUser = getCurrentEmployee();

		Voucher voucher = new Voucher();
		voucher.setVoucherNumber(generateUniqueVoucherNumber());
		voucher.setVoucherDate(request.getVoucherDate());
		voucher.setExpenseDate(request.getExpenseDate());
		voucher.setDepartment(request.getDepartment().trim());
		voucher.setExpenseTitle(request.getExpenseTitle().trim());
		voucher.setExpenseCategory(request.getExpenseCategory().trim());
		voucher.setExpenseDescription(request.getExpenseDescription().trim());
		voucher.setAmount(request.getAmount());
		voucher.setStatus(VoucherStatus.DRAFT);
		voucher.setUser(currentUser);

		Voucher savedVoucher = voucherRepository.save(voucher);
		return toResponse(savedVoucher);
	}

	/**
	 * Returns only the vouchers owned by the current employee.
	 */
	@Override
	public List<VoucherResponse> getMyVouchers() {
		User currentUser = getCurrentEmployee();
		return voucherRepository.findAllByUserIdOrderByCreatedAtDesc(currentUser.getId())
				.stream()
				.map(this::toResponse)
				.toList();
	}

	/**
	 * Returns a single voucher only when it belongs to the current employee.
	 */
	@Override
	public VoucherResponse getVoucherById(Long id) {
		return toResponse(findOwnedVoucher(id));
	}

	/**
	 * Updates only draft vouchers belonging to the current employee.
	 */
	@Override
	public VoucherResponse updateVoucher(Long id, UpdateVoucherRequest request) {
		Voucher voucher = findOwnedVoucher(id);
		ensureDraft(voucher);

		voucher.setVoucherDate(request.getVoucherDate());
		voucher.setExpenseDate(request.getExpenseDate());
		voucher.setDepartment(request.getDepartment().trim());
		voucher.setExpenseTitle(request.getExpenseTitle().trim());
		voucher.setExpenseCategory(request.getExpenseCategory().trim());
		voucher.setExpenseDescription(request.getExpenseDescription().trim());
		voucher.setAmount(request.getAmount());

		return toResponse(voucherRepository.save(voucher));
	}

	/**
	 * Deletes only draft vouchers belonging to the current employee.
	 */
	@Override
	public void deleteVoucher(Long id) {
		Voucher voucher = findOwnedVoucher(id);
		ensureDraft(voucher);
		voucherRepository.delete(voucher);
	}

	/**
	 * Moves a draft voucher to submitted status and makes it read-only for the employee.
	 */
	@Override
	public VoucherResponse submitVoucher(Long id) {
		Voucher voucher = findOwnedVoucher(id);
		signatureService.ensureCurrentEmployeeHasSignature();
		ensureDraft(voucher);
		voucher.setStatus(VoucherStatus.SUBMITTED);
		return toResponse(voucherRepository.save(voucher));
	}

	/**
	 * Uploads a receipt file for the logged-in employee's own draft voucher.
	 */
	@Override
	public VoucherResponse uploadReceipt(Long id, MultipartFile receipt) {
		if (receipt == null || receipt.isEmpty()) {
			throw new ReceiptValidationException("Receipt file is required.");
		}

		validateReceipt(receipt);

		Voucher voucher = findOwnedVoucher(id);
		ensureDraft(voucher);

		String oldReceiptPath = voucher.getReceiptFilePath();
		FileStorageService.StoredFileInfo storedFileInfo;
		try {
			storedFileInfo = fileStorageService.store(receipt);
		} catch (IOException ex) {
			throw new ReceiptStorageException("Failed to store receipt file.", ex);
		}

		try {
			voucher.setReceiptFileName(storedFileInfo.fileName());
			voucher.setReceiptFilePath(storedFileInfo.filePath());
			voucher.setReceiptContentType(storedFileInfo.contentType());

			Voucher saved = voucherRepository.save(voucher);

			if (oldReceiptPath != null && !oldReceiptPath.equals(storedFileInfo.filePath())) {
				fileStorageService.deleteIfExists(oldReceiptPath);
			}

			return toResponse(saved);
		} catch (RuntimeException ex) {
			fileStorageService.deleteIfExists(storedFileInfo.filePath());
			throw ex;
		}
	}

	/**
	 * Returns the stored receipt file for the owner, director, or accounts users.
	 */
	@Override
	public ReceiptFileResponse downloadReceipt(Long id) {
		Voucher voucher = findVoucherForReceiptDownload(id);

		if (voucher.getReceiptFilePath() == null || voucher.getReceiptFileName() == null) {
			throw new ReceiptNotFoundException("Receipt not found.");
		}

		Resource resource = fileStorageService.loadAsResource(voucher.getReceiptFilePath());
		return new ReceiptFileResponse(resource, voucher.getReceiptFileName(), voucher.getReceiptContentType());
	}

	private Voucher findOwnedVoucher(Long id) {
		User currentUser = getCurrentEmployee();
		return voucherRepository.findByIdAndUserId(id, currentUser.getId())
				.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));
	}

	private Voucher findVoucherForReceiptDownload(Long id) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new AccessDeniedException("Authentication is required.");
		}

		boolean employee = hasAuthority("ROLE_EMPLOYEE");
		boolean director = hasAuthority("ROLE_DIRECTOR");
		boolean accounts = hasAuthority("ROLE_ACCOUNTS");

		if (employee) {
			return voucherRepository.findByIdAndUserId(id, getCurrentEmployee().getId())
					.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));
		}

		if (director || accounts) {
			return voucherRepository.findById(id)
					.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));
		}

		throw new AccessDeniedException("You are not allowed to access this receipt.");
	}

	private boolean hasAuthority(String authorityName) {
		return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
				.anyMatch(authority -> authorityName.equals(authority.getAuthority()));
	}

	private User getCurrentEmployee() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new AccessDeniedException("Authentication is required.");
		}

		boolean employeeRole = authentication.getAuthorities().stream()
				.anyMatch(authority -> EMPLOYEE_ROLE.equals(authority.getAuthority()));
		if (!employeeRole) {
			throw new AccessDeniedException("Only employees can manage vouchers.");
		}

		String email = authentication.getName();
		return userRepository.findByEmailIgnoreCase(email)
				.filter(user -> user.getRole() == Role.EMPLOYEE)
				.orElseThrow(() -> new AccessDeniedException("Only employees can manage vouchers."));
	}

	private void ensureDraft(Voucher voucher) {
		if (voucher.getStatus() != VoucherStatus.DRAFT) {
			throw new VoucherStateException("Only draft vouchers can be modified.");
		}
	}

	private void validateReceipt(MultipartFile receipt) {
		if (receipt.getSize() > MAX_RECEIPT_SIZE_BYTES) {
			throw new ReceiptValidationException("Receipt file must not exceed 5 MB.");
		}

		String contentType = receipt.getContentType();
		if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ReceiptValidationException("Unsupported receipt file type.");
		}

		String originalName = receipt.getOriginalFilename();
		if (originalName == null || originalName.isBlank() || !originalName.contains(".")) {
			throw new ReceiptValidationException("Receipt file must have a valid extension.");
		}

		String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new ReceiptValidationException("Unsupported receipt file type.");
		}
	}

	private String generateUniqueVoucherNumber() {
		for (int attempt = 0; attempt < 5; attempt++) {
			String voucherNumber = VOUCHER_PREFIX + "-" + LocalDate.now().toString().replace("-", "")
					+ "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
			if (!voucherRepository.existsByVoucherNumber(voucherNumber)) {
				return voucherNumber;
			}
		}

		throw new VoucherStateException("Unable to generate a unique voucher number.");
	}

	private VoucherResponse toResponse(Voucher voucher) {
		User user = voucher.getUser();
		User approvedBy = voucher.getApprovedBy();
		return new VoucherResponse(
				voucher.getId(),
				voucher.getVoucherNumber(),
				voucher.getVoucherDate(),
				voucher.getExpenseDate(),
				voucher.getDepartment(),
				voucher.getExpenseTitle(),
				voucher.getExpenseCategory(),
				voucher.getExpenseDescription(),
				voucher.getAmount(),
				voucher.getStatus(),
				voucher.getApprovalDate(),
				voucher.getRejectionReason(),

				hasSignature(user),
				hasSignature(approvedBy),

				user != null ? user.getId() : null,
				user != null ? user.getFullName() : null,
				user != null ? user.getEmail() : null,

				voucher.getCreatedAt(),
				voucher.getUpdatedAt()
		);
	}

	private boolean hasSignature(User user) {
		return user != null
				&& user.getSignatureFilePath() != null
				&& !user.getSignatureFilePath().isBlank()
				&& user.getSignatureFileName() != null
				&& !user.getSignatureFileName().isBlank();
	}
}
