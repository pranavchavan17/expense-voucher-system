package com.pspl.expense_voucher_system.exception;

/**
 * SignatureRequiredException is thrown when a signature is mandatory before a business action.
 */
public class SignatureRequiredException extends RuntimeException {

	public SignatureRequiredException(String message) {
		super(message);
	}
}
