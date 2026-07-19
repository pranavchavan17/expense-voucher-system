package com.pspl.expense_voucher_system.repository;

import com.pspl.expense_voucher_system.entity.Voucher;
import com.pspl.expense_voucher_system.entity.VoucherStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * VoucherRepository provides repository access for employee vouchers.
 */
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

	List<Voucher> findAllByUserIdOrderByCreatedAtDesc(Long userId);

	List<Voucher> findAllByStatusOrderByCreatedAtDesc(VoucherStatus status);

	Optional<Voucher> findByIdAndUserId(Long id, Long userId);

	Optional<Voucher> findByIdAndStatus(Long id, VoucherStatus status);

	long countByPaymentReferenceStartingWith(String paymentReferencePrefix);

	long countByUserId(Long userId);

	long countByUserIdAndStatus(Long userId, VoucherStatus status);

	long countByStatus(VoucherStatus status);

	@Query("select coalesce(sum(v.amount), 0) from Voucher v where v.user.id = :userId")
	BigDecimal sumAmountByUserId(@Param("userId") Long userId);

	@Query("select coalesce(sum(v.amount), 0) from Voucher v where v.user.id = :userId and v.status = :status")
	BigDecimal sumAmountByUserIdAndStatus(@Param("userId") Long userId, @Param("status") VoucherStatus status);

	@Query("select coalesce(sum(v.amount), 0) from Voucher v where v.status = :status")
	BigDecimal sumAmountByStatus(@Param("status") VoucherStatus status);

	boolean existsByVoucherNumber(String voucherNumber);

	boolean existsByPaymentReference(String paymentReference);
}
