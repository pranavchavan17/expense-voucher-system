package com.pspl.expense_voucher_system.dto;

import com.pspl.expense_voucher_system.entity.VoucherStatus;
import java.time.LocalDateTime;

/**
 * PaymentResponse returns the essential payment outcome for an accounts action.
 */
public class PaymentResponse {

	private Long voucherId;
	private String voucherNumber;
	private String paymentReference;
	private LocalDateTime paymentDate;
	private VoucherStatus status;

	public PaymentResponse() {
	}

	public PaymentResponse(Long voucherId, String voucherNumber, String paymentReference, LocalDateTime paymentDate,
			VoucherStatus status) {
		this.voucherId = voucherId;
		this.voucherNumber = voucherNumber;
		this.paymentReference = paymentReference;
		this.paymentDate = paymentDate;
		this.status = status;
	}

	public Long getVoucherId() {
		return voucherId;
	}

	public void setVoucherId(Long voucherId) {
		this.voucherId = voucherId;
	}

	public String getVoucherNumber() {
		return voucherNumber;
	}

	public void setVoucherNumber(String voucherNumber) {
		this.voucherNumber = voucherNumber;
	}

	public String getPaymentReference() {
		return paymentReference;
	}

	public void setPaymentReference(String paymentReference) {
		this.paymentReference = paymentReference;
	}

	public LocalDateTime getPaymentDate() {
		return paymentDate;
	}

	public void setPaymentDate(LocalDateTime paymentDate) {
		this.paymentDate = paymentDate;
	}

	public VoucherStatus getStatus() {
		return status;
	}

	public void setStatus(VoucherStatus status) {
		this.status = status;
	}
}
