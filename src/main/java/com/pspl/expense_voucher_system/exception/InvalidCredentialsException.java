package com.pspl.expense_voucher_system.exception;

/**
 * InvalidCredentialsException is thrown when login credentials do not match a known user.
 */
public class InvalidCredentialsException extends RuntimeException {

	public InvalidCredentialsException(String message) {
		super(message);
	}
}
