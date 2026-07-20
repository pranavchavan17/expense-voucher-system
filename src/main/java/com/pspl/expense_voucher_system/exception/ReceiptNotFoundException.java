package com.pspl.expense_voucher_system.exception;

/**
 * ReceiptNotFoundException is thrown when a voucher has no stored receipt or the file is missing.
 */
public class ReceiptNotFoundException extends RuntimeException {

	public ReceiptNotFoundException(String message) {
		super(message);
	}
}
