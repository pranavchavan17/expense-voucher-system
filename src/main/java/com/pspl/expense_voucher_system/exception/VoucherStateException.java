package com.pspl.expense_voucher_system.exception;

/**
 * VoucherStateException is thrown when a business action is not valid for the voucher status.
 */
public class VoucherStateException extends RuntimeException {

	public VoucherStateException(String message) {
		super(message);
	}
}
