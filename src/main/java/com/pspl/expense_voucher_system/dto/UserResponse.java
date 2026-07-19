package com.pspl.expense_voucher_system.dto;

import com.pspl.expense_voucher_system.entity.Role;
import java.time.LocalDateTime;

/**
 * UserResponse exposes safe user information without the password field.
 */
public class UserResponse {

	private Long id;
	private String fullName;
	private String email;
	private Role role;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	public UserResponse() {
	}

	public UserResponse(Long id, String fullName, String email, Role role, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.fullName = fullName;
		this.email = email;
		this.role = role;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
