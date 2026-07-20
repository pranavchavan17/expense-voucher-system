package com.pspl.expense_voucher_system.exception;

/**
 * ReceiptStorageException is thrown when receipt file persistence fails.
 */
public class ReceiptStorageException extends RuntimeException {

	public ReceiptStorageException(String message) {
		super(message);
	}

	public ReceiptStorageException(String message, Throwable cause) {
		super(message, cause);
	}
}
