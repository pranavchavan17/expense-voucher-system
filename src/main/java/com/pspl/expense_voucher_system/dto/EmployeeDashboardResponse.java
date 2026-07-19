package com.pspl.expense_voucher_system.dto;

import java.math.BigDecimal;

/**
 * EmployeeDashboardResponse returns the logged-in employee's voucher summary.
 */
public class EmployeeDashboardResponse {

	private long totalVouchers;
	private long draftCount;
	private long submittedCount;
	private long approvedCount;
	private long rejectedCount;
	private long paidCount;
	private BigDecimal totalClaimAmount;
	private BigDecimal totalPaidAmount;

	public EmployeeDashboardResponse() {
	}

	public EmployeeDashboardResponse(long totalVouchers, long draftCount, long submittedCount, long approvedCount,
			long rejectedCount, long paidCount, BigDecimal totalClaimAmount, BigDecimal totalPaidAmount) {
		this.totalVouchers = totalVouchers;
		this.draftCount = draftCount;
		this.submittedCount = submittedCount;
		this.approvedCount = approvedCount;
		this.rejectedCount = rejectedCount;
		this.paidCount = paidCount;
		this.totalClaimAmount = totalClaimAmount;
		this.totalPaidAmount = totalPaidAmount;
	}

	public long getTotalVouchers() {
		return totalVouchers;
	}

	public void setTotalVouchers(long totalVouchers) {
		this.totalVouchers = totalVouchers;
	}

	public long getDraftCount() {
		return draftCount;
	}

	public void setDraftCount(long draftCount) {
		this.draftCount = draftCount;
	}

	public long getSubmittedCount() {
		return submittedCount;
	}

	public void setSubmittedCount(long submittedCount) {
		this.submittedCount = submittedCount;
	}

	public long getApprovedCount() {
		return approvedCount;
	}

	public void setApprovedCount(long approvedCount) {
		this.approvedCount = approvedCount;
	}

	public long getRejectedCount() {
		return rejectedCount;
	}

	public void setRejectedCount(long rejectedCount) {
		this.rejectedCount = rejectedCount;
	}

	public long getPaidCount() {
		return paidCount;
	}

	public void setPaidCount(long paidCount) {
		this.paidCount = paidCount;
	}

	public BigDecimal getTotalClaimAmount() {
		return totalClaimAmount;
	}

	public void setTotalClaimAmount(BigDecimal totalClaimAmount) {
		this.totalClaimAmount = totalClaimAmount;
	}

	public BigDecimal getTotalPaidAmount() {
		return totalPaidAmount;
	}

	public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
		this.totalPaidAmount = totalPaidAmount;
	}
}
