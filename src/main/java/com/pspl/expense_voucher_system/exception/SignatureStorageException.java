package com.pspl.expense_voucher_system.exception;

/**
 * SignatureStorageException is thrown when signature file persistence fails.
 */
public class SignatureStorageException extends RuntimeException {

	public SignatureStorageException(String message) {
		super(message);
	}

	public SignatureStorageException(String message, Throwable cause) {
		super(message, cause);
	}
}
