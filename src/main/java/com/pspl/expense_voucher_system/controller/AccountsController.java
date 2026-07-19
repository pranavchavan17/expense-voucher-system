package com.pspl.expense_voucher_system.controller;

import com.pspl.expense_voucher_system.dto.PaymentResponse;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.service.AccountsService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
@RestController
@RequestMapping("/api/v1/accounts/vouchers")
public class AccountsController {

	private final AccountsService accountsService;

	public AccountsController(AccountsService accountsService) {
		this.accountsService = accountsService;
	}

	/**
	 * Returns all approved vouchers waiting for payment.
	 */
	@GetMapping
	public ResponseEntity<List<VoucherResponse>> getApprovedVouchers() {
		return ResponseEntity.ok(accountsService.getApprovedVouchers());
	}

	/**
	 * Returns details of an approved voucher.
	 */
	@GetMapping("/{id}")
	public ResponseEntity<VoucherResponse> getApprovedVoucherById(
			@PathVariable("id") Long id) {

		return ResponseEntity.ok(accountsService.getApprovedVoucherById(id));
	}

	/**
	 * Marks an approved voucher as PAID.
	 */
	@PutMapping("/{id}/pay")
	public ResponseEntity<PaymentResponse> payVoucher(
			@PathVariable("id") Long id) {

		return ResponseEntity.ok(accountsService.payVoucher(id));
	}

	@GetMapping("/debug")
	public ResponseEntity<?> debug(Authentication authentication) {
		return ResponseEntity.ok(authentication.getAuthorities());
	}
}