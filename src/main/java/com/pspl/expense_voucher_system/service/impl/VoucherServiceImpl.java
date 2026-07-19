package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.dto.CreateVoucherRequest;
import com.pspl.expense_voucher_system.dto.UpdateVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.entity.Role;
import com.pspl.expense_voucher_system.entity.User;
import com.pspl.expense_voucher_system.entity.Voucher;
import com.pspl.expense_voucher_system.entity.VoucherStatus;
import com.pspl.expense_voucher_system.exception.VoucherNotFoundException;
import com.pspl.expense_voucher_system.exception.VoucherStateException;
import com.pspl.expense_voucher_system.repository.UserRepository;
import com.pspl.expense_voucher_system.repository.VoucherRepository;
import com.pspl.expense_voucher_system.service.VoucherService;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * VoucherServiceImpl enforces employee ownership, draft-only edits, and voucher submission rules.
 */
@Service
@Transactional
public class VoucherServiceImpl implements VoucherService {

	private static final String VOUCHER_PREFIX = "VCH";
	private static final String EMPLOYEE_ROLE = "ROLE_EMPLOYEE";

	private final VoucherRepository voucherRepository;
	private final UserRepository userRepository;

	public VoucherServiceImpl(VoucherRepository voucherRepository, UserRepository userRepository) {
		this.voucherRepository = voucherRepository;
		this.userRepository = userRepository;
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
		ensureDraft(voucher);
		voucher.setStatus(VoucherStatus.SUBMITTED);
		return toResponse(voucherRepository.save(voucher));
	}

	private Voucher findOwnedVoucher(Long id) {
		User currentUser = getCurrentEmployee();
		return voucherRepository.findByIdAndUserId(id, currentUser.getId())
				.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));
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
				user != null ? user.getId() : null,
				user != null ? user.getFullName() : null,
				user != null ? user.getEmail() : null,
				voucher.getCreatedAt(),
				voucher.getUpdatedAt());
	}
}
