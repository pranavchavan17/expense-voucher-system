package com.pspl.expense_voucher_system.controller;

import com.pspl.expense_voucher_system.dto.CreateVoucherRequest;
import com.pspl.expense_voucher_system.dto.ReceiptFileResponse;
import com.pspl.expense_voucher_system.dto.UpdateVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import com.pspl.expense_voucher_system.service.VoucherService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/vouchers")
public class VoucherController {

	private final VoucherService voucherService;

	public VoucherController(VoucherService voucherService) {
		this.voucherService = voucherService;
	}

	/**
	 * Creates a new voucher in DRAFT state.
	 */
	@PostMapping
	public ResponseEntity<VoucherResponse> createVoucher(
			@Valid @RequestBody CreateVoucherRequest request) {

		VoucherResponse response = voucherService.createVoucher(request);

		return ResponseEntity.status(HttpStatus.CREATED)
				.location(URI.create("/api/v1/vouchers/" + response.getId()))
				.body(response);
	}

	/**
	 * Returns vouchers of the logged-in employee.
	 */
	@GetMapping
	public ResponseEntity<List<VoucherResponse>> getMyVouchers() {
		return ResponseEntity.ok(voucherService.getMyVouchers());
	}

	/**
	 * Returns voucher details.
	 */
	@GetMapping("/{id}")
	public ResponseEntity<VoucherResponse> getVoucherById(
			@PathVariable("id") Long id) {

		return ResponseEntity.ok(voucherService.getVoucherById(id));
	}

	/**
	 * Updates a draft voucher.
	 */
	@PutMapping("/{id}")
	public ResponseEntity<VoucherResponse> updateVoucher(
			@PathVariable("id") Long id,
			@Valid @RequestBody UpdateVoucherRequest request) {

		return ResponseEntity.ok(voucherService.updateVoucher(id, request));
	}

	/**
	 * Deletes a draft voucher.
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteVoucher(
			@PathVariable("id") Long id) {

		voucherService.deleteVoucher(id);
		return ResponseEntity.noContent().build();
	}

	/**
	 * Submits a voucher for approval.
	 */
	@PutMapping("/{id}/submit")
	public ResponseEntity<VoucherResponse> submitVoucher(
			@PathVariable("id") Long id) {

		return ResponseEntity.ok(voucherService.submitVoucher(id));
	}

	/**
	 * Uploads a receipt file for a draft voucher owned by the logged-in employee.
	 */
	@PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<VoucherResponse> uploadReceipt(
			@PathVariable("id") Long id,
			@RequestPart("receipt") MultipartFile receipt) {

		return ResponseEntity.ok(voucherService.uploadReceipt(id, receipt));
	}

	/**
	 * Downloads the stored receipt file for an authorized user.
	 */
	@GetMapping("/{id}/receipt")
	public ResponseEntity<Resource> downloadReceipt(@PathVariable("id") Long id) {
		ReceiptFileResponse receipt = voucherService.downloadReceipt(id);
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(receipt.getContentType()))
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + receipt.getFileName() + "\"")
				.body(receipt.getResource());
	}
}
