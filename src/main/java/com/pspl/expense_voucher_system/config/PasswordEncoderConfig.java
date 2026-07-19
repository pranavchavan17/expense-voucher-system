package com.pspl.expense_voucher_system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * PasswordEncoderConfig exposes the primary BCryptPasswordEncoder bean used by Module 2.
 * The existing security config can keep its bean declaration, but application code will inject this primary bean.
 */
@Configuration
public class PasswordEncoderConfig {

	@Bean
	@Primary
	public PasswordEncoder primaryPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
