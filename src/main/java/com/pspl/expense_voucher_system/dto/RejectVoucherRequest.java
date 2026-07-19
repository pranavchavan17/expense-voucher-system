package com.pspl.expense_voucher_system.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * RejectVoucherRequest carries the mandatory rejection reason for a submitted voucher.
 */
public class RejectVoucherRequest {

	@NotBlank(message = "Rejection reason is required")
	private String rejectionReason;

	public RejectVoucherRequest() {
	}

	public RejectVoucherRequest(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}
}
