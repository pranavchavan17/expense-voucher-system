package com.pspl.expense_voucher_system.entity;

/**
 * VoucherStatus tracks the lifecycle of a voucher as it moves from creation to submission.
 */
public enum VoucherStatus {
	DRAFT,
	SUBMITTED,
	APPROVED,
	PAID,
	REJECTED
}
