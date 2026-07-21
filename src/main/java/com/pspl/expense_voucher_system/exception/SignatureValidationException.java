package com.pspl.expense_voucher_system.exception;

/**
 * SignatureValidationException is thrown when signature file validation fails.
 */
public class SignatureValidationException extends RuntimeException {

	public SignatureValidationException(String message) {
		super(message);
	}
}
