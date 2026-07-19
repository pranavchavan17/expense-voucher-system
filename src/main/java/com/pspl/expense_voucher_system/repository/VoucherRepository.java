package com.pspl.expense_voucher_system.repository;

import com.pspl.expense_voucher_system.entity.Voucher;
import com.pspl.expense_voucher_system.entity.VoucherStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * VoucherRepository provides repository access for employee vouchers.
 */
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

	List<Voucher> findAllByUserIdOrderByCreatedAtDesc(Long userId);

	List<Voucher> findAllByStatusOrderByCreatedAtDesc(VoucherStatus status);

	Optional<Voucher> findByIdAndUserId(Long id, Long userId);

	Optional<Voucher> findByIdAndStatus(Long id, VoucherStatus status);

	long countByPaymentReferenceStartingWith(String paymentReferencePrefix);

	boolean existsByVoucherNumber(String voucherNumber);

	boolean existsByPaymentReference(String paymentReference);
}
