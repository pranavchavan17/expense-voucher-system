package com.pspl.expense_voucher_system.dto;

/**
 * AuthResponse is the success payload returned by register and login endpoints.
 */
public class AuthResponse {

	private String message;
	private String tokenType;
	private String token;
	private Long expiresIn;
	private UserResponse user;

	public AuthResponse() {
	}

	public AuthResponse(String message, String tokenType, String token, Long expiresIn, UserResponse user) {
		this.message = message;
		this.tokenType = tokenType;
		this.token = token;
		this.expiresIn = expiresIn;
		this.user = user;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getTokenType() {
		return tokenType;
	}

	public void setTokenType(String tokenType) {
		this.tokenType = tokenType;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public Long getExpiresIn() {
		return expiresIn;
	}

	public void setExpiresIn(Long expiresIn) {
		this.expiresIn = expiresIn;
	}

	public UserResponse getUser() {
		return user;
	}

	public void setUser(UserResponse user) {
		this.user = user;
	}
}
