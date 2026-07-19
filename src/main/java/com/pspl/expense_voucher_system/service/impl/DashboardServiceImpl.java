package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.dto.AccountsDashboardResponse;
import com.pspl.expense_voucher_system.dto.DirectorDashboardResponse;
import com.pspl.expense_voucher_system.dto.EmployeeDashboardResponse;
import com.pspl.expense_voucher_system.entity.Role;
import com.pspl.expense_voucher_system.entity.User;
import com.pspl.expense_voucher_system.entity.VoucherStatus;
import com.pspl.expense_voucher_system.exception.VoucherStateException;
import com.pspl.expense_voucher_system.repository.UserRepository;
import com.pspl.expense_voucher_system.repository.VoucherRepository;
import com.pspl.expense_voucher_system.service.DashboardService;
import java.math.BigDecimal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * DashboardServiceImpl assembles role-specific voucher summaries using aggregate repository queries.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

	private final VoucherRepository voucherRepository;
	private final UserRepository userRepository;

	public DashboardServiceImpl(VoucherRepository voucherRepository, UserRepository userRepository) {
		this.voucherRepository = voucherRepository;
		this.userRepository = userRepository;
	}

	/**
	 * Returns the logged-in employee's voucher metrics.
	 */
	@Override
	public EmployeeDashboardResponse getEmployeeDashboard() {
		User employee = getCurrentEmployee();
		Long userId = employee.getId();

		return new EmployeeDashboardResponse(
				voucherRepository.countByUserId(userId),
				voucherRepository.countByUserIdAndStatus(userId, VoucherStatus.DRAFT),
				voucherRepository.countByUserIdAndStatus(userId, VoucherStatus.SUBMITTED),
				voucherRepository.countByUserIdAndStatus(userId, VoucherStatus.APPROVED),
				voucherRepository.countByUserIdAndStatus(userId, VoucherStatus.REJECTED),
				voucherRepository.countByUserIdAndStatus(userId, VoucherStatus.PAID),
				safeAmount(voucherRepository.sumAmountByUserId(userId)),
				safeAmount(voucherRepository.sumAmountByUserIdAndStatus(userId, VoucherStatus.PAID)));
	}

	/**
	 * Returns the director's approval workload summary.
	 */
	@Override
	public DirectorDashboardResponse getDirectorDashboard() {
		return new DirectorDashboardResponse(
				voucherRepository.countByStatus(VoucherStatus.SUBMITTED),
				voucherRepository.countByStatus(VoucherStatus.APPROVED),
				voucherRepository.countByStatus(VoucherStatus.REJECTED),
				safeAmount(voucherRepository.sumAmountByStatus(VoucherStatus.APPROVED)));
	}

	/**
	 * Returns the accounts payment workload summary.
	 */
	@Override
	public AccountsDashboardResponse getAccountsDashboard() {
		return new AccountsDashboardResponse(
				voucherRepository.countByStatus(VoucherStatus.APPROVED),
				voucherRepository.countByStatus(VoucherStatus.PAID),
				safeAmount(voucherRepository.sumAmountByStatus(VoucherStatus.PAID)));
	}

	private User getCurrentEmployee() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new AccessDeniedException("Authentication is required.");
		}

		String email = authentication.getName();
		User user = userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new AccessDeniedException("Authentication is required."));

		if (user.getRole() != Role.EMPLOYEE) {
			throw new AccessDeniedException("Only employees can access this dashboard.");
		}

		return user;
	}

	private BigDecimal safeAmount(BigDecimal amount) {
		return amount == null ? BigDecimal.ZERO : amount;
	}
}
