package com.pspl.expense_voucher_system.exception;

/**
 * ReceiptValidationException is thrown when receipt upload validation fails.
 */
public class ReceiptValidationException extends RuntimeException {

	public ReceiptValidationException(String message) {
		super(message);
	}
}
