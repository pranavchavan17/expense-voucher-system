package com.pspl.expense_voucher_system.exception;

/**
 * SignatureNotFoundException is thrown when a signature has not been uploaded yet.
 */
public class SignatureNotFoundException extends RuntimeException {

	public SignatureNotFoundException(String message) {
		super(message);
	}
}
