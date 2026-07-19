package com.pspl.expense_voucher_system.exception;

/**
 * DuplicateResourceException is thrown when a unique business key already exists.
 */
public class DuplicateResourceException extends RuntimeException {

	public DuplicateResourceException(String message) {
		super(message);
	}
}
