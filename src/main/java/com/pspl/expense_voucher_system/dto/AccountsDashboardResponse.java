package com.pspl.expense_voucher_system.dto;

import java.math.BigDecimal;

/**
 * AccountsDashboardResponse returns the payment workload summary for accounts users.
 */
public class AccountsDashboardResponse {

	private long pendingPaymentCount;
	private long paidCount;
	private BigDecimal totalPaidAmount;

	public AccountsDashboardResponse() {
	}

	public AccountsDashboardResponse(long pendingPaymentCount, long paidCount, BigDecimal totalPaidAmount) {
		this.pendingPaymentCount = pendingPaymentCount;
		this.paidCount = paidCount;
		this.totalPaidAmount = totalPaidAmount;
	}

	public long getPendingPaymentCount() {
		return pendingPaymentCount;
	}

	public void setPendingPaymentCount(long pendingPaymentCount) {
		this.pendingPaymentCount = pendingPaymentCount;
	}

	public long getPaidCount() {
		return paidCount;
	}

	public void setPaidCount(long paidCount) {
		this.paidCount = paidCount;
	}

	public BigDecimal getTotalPaidAmount() {
		return totalPaidAmount;
	}

	public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
		this.totalPaidAmount = totalPaidAmount;
	}
}
