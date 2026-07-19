package com.pspl.expense_voucher_system.repository;

import com.pspl.expense_voucher_system.entity.Voucher;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * VoucherRepository provides repository access for employee vouchers.
 */
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

	List<Voucher> findAllByUserIdOrderByCreatedAtDesc(Long userId);

	Optional<Voucher> findByIdAndUserId(Long id, Long userId);

	boolean existsByVoucherNumber(String voucherNumber);
}
