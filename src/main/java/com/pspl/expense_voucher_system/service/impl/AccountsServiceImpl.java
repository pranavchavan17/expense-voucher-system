package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.dto.PaymentResponse;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.entity.Voucher;
import com.pspl.expense_voucher_system.entity.VoucherStatus;
import com.pspl.expense_voucher_system.exception.VoucherNotFoundException;
import com.pspl.expense_voucher_system.exception.VoucherStateException;
import com.pspl.expense_voucher_system.repository.VoucherRepository;
import com.pspl.expense_voucher_system.service.AccountsService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AccountsServiceImpl handles the approved-voucher queue and marks vouchers as paid.
 */
@Service
@Transactional
public class AccountsServiceImpl implements AccountsService {

	private static final String PAYMENT_PREFIX = "PAY-";

	private final VoucherRepository voucherRepository;

	public AccountsServiceImpl(VoucherRepository voucherRepository) {
		this.voucherRepository = voucherRepository;
	}

	/**
	 * Returns only vouchers waiting for payment, which are in APPROVED status.
	 */
	@Override
	public java.util.List<VoucherResponse> getApprovedVouchers() {
		return voucherRepository.findAllByStatusOrderByCreatedAtDesc(VoucherStatus.APPROVED)
				.stream()
				.map(this::toVoucherResponse)
				.toList();
	}

	/**
	 * Returns a single approved voucher for accounts review.
	 */
	@Override
	public VoucherResponse getApprovedVoucherById(Long id) {
		return toVoucherResponse(findApprovedVoucher(id));
	}

	/**
	 * Marks an approved voucher as paid, storing the payment date and unique payment reference.
	 */
	@Override
	public PaymentResponse payVoucher(Long id) {
		Voucher voucher = voucherRepository.findById(id)
				.orElseThrow(() -> new VoucherNotFoundException("Voucher not found."));

		ensurePayable(voucher);

		voucher.setStatus(VoucherStatus.PAID);
		voucher.setPaymentDate(LocalDateTime.now());
		voucher.setPaymentReference(generateUniquePaymentReference());
		voucher.setRejectionReason(null);
		voucherRepository.save(voucher);

		return new PaymentResponse(
				voucher.getId(),
				voucher.getVoucherNumber(),
				voucher.getPaymentReference(),
				voucher.getPaymentDate(),
				voucher.getStatus());
	}

	private Voucher findApprovedVoucher(Long id) {
		return voucherRepository.findByIdAndStatus(id, VoucherStatus.APPROVED)
				.orElseThrow(() -> new VoucherNotFoundException("Approved voucher not found."));
	}

	private void ensurePayable(Voucher voucher) {
		if (voucher.getStatus() == VoucherStatus.PAID) {
			throw new VoucherStateException("Already paid vouchers cannot be paid again.");
		}

		if (voucher.getStatus() == VoucherStatus.REJECTED) {
			throw new VoucherStateException("Rejected vouchers cannot be paid.");
		}

		if (voucher.getStatus() != VoucherStatus.APPROVED) {
			throw new VoucherStateException("Only approved vouchers can be paid.");
		}
	}

	private String generateUniquePaymentReference() {
		String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
		String prefix = PAYMENT_PREFIX + datePart + "-";
		long sequence = voucherRepository.countByPaymentReferenceStartingWith(prefix) + 1;

		for (int attempt = 0; attempt < 10; attempt++) {
			String paymentReference = prefix + String.format("%06d", sequence);
			if (!voucherRepository.existsByPaymentReference(paymentReference)) {
				return paymentReference;
			}
			sequence++;
		}

		throw new VoucherStateException("Unable to generate a unique payment reference.");
	}

	private VoucherResponse toVoucherResponse(Voucher voucher) {
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
				voucher.getUser() != null ? voucher.getUser().getId() : null,
				voucher.getUser() != null ? voucher.getUser().getFullName() : null,
				voucher.getUser() != null ? voucher.getUser().getEmail() : null,
				voucher.getCreatedAt(),
				voucher.getUpdatedAt());
	}
}
