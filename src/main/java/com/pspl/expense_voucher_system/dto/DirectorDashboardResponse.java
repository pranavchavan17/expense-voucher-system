package com.pspl.expense_voucher_system.dto;

import java.math.BigDecimal;

/**
 * DirectorDashboardResponse returns the approval workload summary for directors.
 */
public class DirectorDashboardResponse {

	private long pendingApprovalCount;
	private long approvedCount;
	private long rejectedCount;
	private BigDecimal totalApprovedAmount;

	public DirectorDashboardResponse() {
	}

	public DirectorDashboardResponse(long pendingApprovalCount, long approvedCount, long rejectedCount,
			BigDecimal totalApprovedAmount) {
		this.pendingApprovalCount = pendingApprovalCount;
		this.approvedCount = approvedCount;
		this.rejectedCount = rejectedCount;
		this.totalApprovedAmount = totalApprovedAmount;
	}

	public long getPendingApprovalCount() {
		return pendingApprovalCount;
	}

	public void setPendingApprovalCount(long pendingApprovalCount) {
		this.pendingApprovalCount = pendingApprovalCount;
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

	public BigDecimal getTotalApprovedAmount() {
		return totalApprovedAmount;
	}

	public void setTotalApprovedAmount(BigDecimal totalApprovedAmount) {
		this.totalApprovedAmount = totalApprovedAmount;
	}
}
