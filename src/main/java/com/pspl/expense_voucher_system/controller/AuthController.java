package com.pspl.expense_voucher_system.controller;

import com.pspl.expense_voucher_system.dto.AuthResponse;
import com.pspl.expense_voucher_system.dto.LoginRequest;
import com.pspl.expense_voucher_system.dto.RegisterRequest;
import com.pspl.expense_voucher_system.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AuthController exposes the registration and login endpoints for Module 2.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	/**
	 * Public endpoint that creates only EMPLOYEE accounts.
	 */
	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
	}

	/**
	 * Public endpoint that validates credentials and returns a JWT token.
	 */
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}
}
