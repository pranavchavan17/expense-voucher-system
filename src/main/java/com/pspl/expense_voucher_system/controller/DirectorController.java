package com.pspl.expense_voucher_system.controller;

import com.pspl.expense_voucher_system.dto.RejectVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.service.DirectorService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/director/vouchers")
public class DirectorController {

	private final DirectorService directorService;

	public DirectorController(DirectorService directorService) {
		this.directorService = directorService;
	}

	/**
	 * Returns all submitted vouchers waiting for director approval.
	 */
	@GetMapping
	public ResponseEntity<List<VoucherResponse>> getSubmittedVouchers() {
		return ResponseEntity.ok(directorService.getSubmittedVouchers());
	}

	/**
	 * Returns details of a submitted voucher.
	 */
	@GetMapping("/{id}")
	public ResponseEntity<VoucherResponse> getSubmittedVoucherById(
			@PathVariable("id") Long id) {

		return ResponseEntity.ok(directorService.getSubmittedVoucherById(id));
	}

	/**
	 * Approves a submitted voucher.
	 */
	@PutMapping("/{id}/approve")
	public ResponseEntity<VoucherResponse> approveVoucher(
			@PathVariable("id") Long id) {

		return ResponseEntity.ok(directorService.approveVoucher(id));
	}

	/**
	 * Rejects a submitted voucher.
	 */
	@PutMapping("/{id}/reject")
	public ResponseEntity<VoucherResponse> rejectVoucher(
			@PathVariable("id") Long id,
			@Valid @RequestBody RejectVoucherRequest request) {

		return ResponseEntity.ok(directorService.rejectVoucher(id, request));
	}
}