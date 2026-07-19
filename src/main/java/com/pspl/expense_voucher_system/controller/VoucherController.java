package com.pspl.expense_voucher_system.controller;

import com.pspl.expense_voucher_system.dto.CreateVoucherRequest;
import com.pspl.expense_voucher_system.dto.UpdateVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.service.VoucherService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * VoucherController exposes the employee voucher APIs for creation and lifecycle management.
 */
@RestController
@RequestMapping("/api/v1/vouchers")
public class VoucherController {

	private final VoucherService voucherService;

	public VoucherController(VoucherService voucherService) {
		this.voucherService = voucherService;
	}

	/**
	 * Creates a new voucher in DRAFT state for the logged-in employee.
	 */
	@PostMapping
	public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody CreateVoucherRequest request) {
		VoucherResponse response = voucherService.createVoucher(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.location(URI.create("/api/v1/vouchers/" + response.getId()))
				.body(response);
	}

	/**
	 * Returns all vouchers owned by the logged-in employee.
	 */
	@GetMapping
	public ResponseEntity<List<VoucherResponse>> getMyVouchers() {
		return ResponseEntity.ok(voucherService.getMyVouchers());
	}

	/**
	 * Returns a voucher only if it belongs to the logged-in employee.
	 */
	@GetMapping("/{id}")
	public ResponseEntity<VoucherResponse> getVoucherById(@PathVariable Long id) {
		return ResponseEntity.ok(voucherService.getVoucherById(id));
	}

	/**
	 * Updates a voucher only while it is still in DRAFT state.
	 */
	@PutMapping("/{id}")
	public ResponseEntity<VoucherResponse> updateVoucher(@PathVariable Long id, @Valid @RequestBody UpdateVoucherRequest request) {
		return ResponseEntity.ok(voucherService.updateVoucher(id, request));
	}

	/**
	 * Deletes a voucher only while it is still in DRAFT state.
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
		voucherService.deleteVoucher(id);
		return ResponseEntity.noContent().build();
	}

	/**
	 * Submits a draft voucher and marks it as read-only for the employee.
	 */
	@PutMapping("/{id}/submit")
	public ResponseEntity<VoucherResponse> submitVoucher(@PathVariable Long id) {
		return ResponseEntity.ok(voucherService.submitVoucher(id));
	}
}
