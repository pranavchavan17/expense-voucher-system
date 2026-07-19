package com.pspl.expense_voucher_system.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * SecurityConfig defines the stateless JWT security rules for Module 2.
 */
@Configuration
public class SecurityConfig {

	/**
	 * BCrypt is used to store passwords securely in the database.
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * Configures a stateless security filter chain that exposes only auth endpoints publicly.
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			JwtFilter jwtFilter,
			AuthenticationEntryPoint restAuthenticationEntryPoint,
			AccessDeniedHandler restAccessDeniedHandler) throws Exception {
		return http
				.csrf(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint(restAuthenticationEntryPoint)
						.accessDeniedHandler(restAccessDeniedHandler))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/api/v1/auth/**", "/error").permitAll()
						.requestMatchers("/api/v1/director/**").hasRole("DIRECTOR")
						.requestMatchers("/api/v1/accounts/**").hasRole("ACCOUNTS")
						.requestMatchers("/api/v1/dashboard/employee").hasRole("EMPLOYEE")
						.requestMatchers("/api/v1/dashboard/director").hasRole("DIRECTOR")
						.requestMatchers("/api/v1/dashboard/accounts").hasRole("ACCOUNTS")
						.anyRequest().authenticated())
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
				.build();
	}
}
