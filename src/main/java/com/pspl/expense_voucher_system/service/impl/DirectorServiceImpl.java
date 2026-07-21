package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.dto.RejectVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.entity.Role;
import com.pspl.expense_voucher_system.entity.User;
import com.pspl.expense_voucher_system.entity.Voucher;
import com.pspl.expense_voucher_system.entity.VoucherStatus;
import com.pspl.expense_voucher_system.exception.VoucherNotFoundException;
import com.pspl.expense_voucher_system.exception.VoucherStateException;
import com.pspl.expense_voucher_system.repository.UserRepository;
import com.pspl.expense_voucher_system.repository.VoucherRepository;
import com.pspl.expense_voucher_system.service.DirectorService;
import com.pspl.expense_voucher_system.service.SignatureService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
/**
 * DirectorServiceImpl implements the submitted-voucher approval and rejection workflow.
 */
@Service
@Transactional
public class DirectorServiceImpl implements DirectorService {

	private static final String DIRECTOR_ROLE = "ROLE_DIRECTOR";

	private final VoucherRepository voucherRepository;
	private final UserRepository userRepository;
	private final SignatureService signatureService;

	public DirectorServiceImpl(VoucherRepository voucherRepository, UserRepository userRepository,
			SignatureService signatureService) {
		this.voucherRepository = voucherRepository;
		this.userRepository = userRepository;
		this.signatureService = signatureService;
	}

	/**
	 * Returns only vouchers that are currently in SUBMITTED status.
	 */
	@Override
	public List<VoucherResponse> getSubmittedVouchers() {
		ensureDirector();
		return voucherRepository.findAllByStatusOrderByCreatedAtDesc(VoucherStatus.SUBMITTED)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	/**
	 * Returns submitted voucher details for director review.
	 */
	@Override
	public VoucherResponse getSubmittedVoucherById(Long id) {
		ensureDirector();
		return toResponse(findSubmittedVoucher(id));
	}

	/**
	 * Approves a submitted voucher and records the approval timestamp.
	 */
	@Override
	public VoucherResponse approveVoucher(Long id) {
		ensureDirector();
		signatureService.ensureCurrentDirectorHasSignature();
		Voucher voucher = findById(id);
		ensureCanApprove(voucher);

		voucher.setStatus(VoucherStatus.APPROVED);
		voucher.setApprovalDate(LocalDateTime.now());
		voucher.setRejectionReason(null);
		voucher.setApprovedBy(getCurrentDirector());
		return toResponse(voucherRepository.save(voucher));
	}

	/**
	 * Rejects a submitted voucher and stores the rejection reason.
	 */
	@Override
	public VoucherResponse rejectVoucher(Long id, RejectVoucherRequest request) {
		ensureDirector();
		Voucher voucher = findById(id);
		ensureCanReject(voucher);

		voucher.setStatus(VoucherStatus.REJECTED);
		voucher.setApprovalDate(null);
		voucher.setRejectionReason(request.getRejectionReason().trim());
		voucher.setApprovedBy(null);
		return toResponse(voucherRepository.save(voucher));
	}

	private Voucher findSubmittedVoucher(Long id) {
		return voucherRepository.findByIdAndStatus(id, VoucherStatus.SUBMITTED)
				.orElseThrow(() -> new VoucherNotFoundException("Submitted voucher not found."));
	}

	private Voucher findById(Long id) {
		return voucherRepository.findById(id)
				.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));
	}

	private void ensureCanApprove(Voucher voucher) {
		if (voucher.getStatus() == VoucherStatus.APPROVED) {
			throw new VoucherStateException("Approved voucher cannot be approved again.");
		}

		if (voucher.getStatus() != VoucherStatus.SUBMITTED) {
			throw new VoucherStateException("Only submitted vouchers can be approved.");
		}
	}

	private void ensureCanReject(Voucher voucher) {
		if (voucher.getStatus() == VoucherStatus.REJECTED) {
			throw new VoucherStateException("Rejected voucher cannot be rejected again.");
		}

		if (voucher.getStatus() != VoucherStatus.SUBMITTED) {
			throw new VoucherStateException("Only submitted vouchers can be rejected.");
		}
	}

	private void ensureDirector() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new AccessDeniedException("Authentication is required.");
		}

		boolean hasDirectorRole = authentication.getAuthorities().stream()
				.anyMatch(authority -> DIRECTOR_ROLE.equals(authority.getAuthority()));
		if (!hasDirectorRole) {
			throw new AccessDeniedException("Only directors can access this resource.");
		}
	}

	private User getCurrentDirector() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		return userRepository.findByEmailIgnoreCase(email)
				.filter(user -> user.getRole() == Role.DIRECTOR)
				.orElseThrow(() -> new AccessDeniedException("Only directors can access this resource."));
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
