package com.pspl.expense_voucher_system.exception;

/**
 * VoucherNotFoundException is thrown when a voucher does not exist for the current employee.
 */
public class VoucherNotFoundException extends RuntimeException {

	public VoucherNotFoundException(String message) {
		super(message);
	}
}
