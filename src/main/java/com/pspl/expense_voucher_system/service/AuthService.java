package com.pspl.expense_voucher_system.service;

import com.pspl.expense_voucher_system.dto.AuthResponse;
import com.pspl.expense_voucher_system.dto.LoginRequest;
import com.pspl.expense_voucher_system.dto.RegisterRequest;

/**
 * AuthService defines the business operations for registration and login.
 */
public interface AuthService {

	AuthResponse register(RegisterRequest request);

	AuthResponse login(LoginRequest request);
}
