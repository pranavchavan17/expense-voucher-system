package com.pspl.expense_voucher_system.service.impl;

import com.pspl.expense_voucher_system.dto.AuthResponse;
import com.pspl.expense_voucher_system.dto.LoginRequest;
import com.pspl.expense_voucher_system.dto.RegisterRequest;
import com.pspl.expense_voucher_system.dto.UserResponse;
import com.pspl.expense_voucher_system.entity.Role;
import com.pspl.expense_voucher_system.entity.User;
import com.pspl.expense_voucher_system.exception.DuplicateResourceException;
import com.pspl.expense_voucher_system.exception.InvalidCredentialsException;
import com.pspl.expense_voucher_system.repository.UserRepository;
import com.pspl.expense_voucher_system.security.JwtUtil;
import com.pspl.expense_voucher_system.service.AuthService;
import java.util.List;
import java.util.Locale;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthServiceImpl implements the registration and login flow and also acts as the
 * UserDetailsService used by Spring Security and the JWT filter.
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService, UserDetailsService {

	private static final String AUTHORITY_PREFIX = "ROLE_";
	private static final String BEARER = "Bearer";

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	/**
	 * Public registration always creates an EMPLOYEE account and never accepts elevated roles.
	 */
	@Override
	public AuthResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.getEmail());

		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new DuplicateResourceException("Email is already registered.");
		}

		User user = new User();
		user.setFullName(request.getFullName().trim());
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setRole(Role.EMPLOYEE);

		User savedUser = userRepository.save(user);
		String token = jwtUtil.generateToken(toUserDetails(savedUser));

		return new AuthResponse(
				"Registration successful.",
				BEARER,
				token,
				jwtUtil.getExpirationMillis(),
				toUserResponse(savedUser));
	}

	/**
	 * Login validates the password and returns a signed JWT token when the credentials match.
	 */
	@Override
	public AuthResponse login(LoginRequest request) {
		String email = normalizeEmail(request.getEmail());
		User user = userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new InvalidCredentialsException("Invalid email or password.");
		}

		String token = jwtUtil.generateToken(toUserDetails(user));

		return new AuthResponse(
				"Login successful.",
				BEARER,
				token,
				jwtUtil.getExpirationMillis(),
				toUserResponse(user));
	}

	/**
	 * Spring Security uses this method to locate the user behind a JWT subject or login email.
	 */
	@Override
	public UserDetails loadUserByUsername(String username) {
		if (username == null || username.isBlank()) {
			throw new UsernameNotFoundException("User not found.");
		}
		User user = userRepository.findByEmailIgnoreCase(normalizeEmail(username))
				.orElseThrow(() -> new UsernameNotFoundException("User not found."));
		return toUserDetails(user);
	}

	private UserDetails toUserDetails(User user) {
		List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(AUTHORITY_PREFIX + user.getRole().name()));
		return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
	}

	private UserResponse toUserResponse(User user) {
		return new UserResponse(
				user.getId(),
				user.getFullName(),
				user.getEmail(),
				user.getRole(),
				user.getCreatedAt(),
				user.getUpdatedAt());
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}
}
