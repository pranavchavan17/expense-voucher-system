package com.pspl.expense_voucher_system.security;

import com.pspl.expense_voucher_system.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * RestAuthenticationEntryPoint converts unauthenticated security failures into JSON responses.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
			throws IOException {
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		ApiErrorResponse errorResponse = new ApiErrorResponse(
				java.time.LocalDateTime.now(),
				HttpServletResponse.SC_UNAUTHORIZED,
				"Unauthorized",
				"Authentication is required to access this resource.",
				request.getRequestURI(),
				null);
		response.getWriter().write(errorResponse.toJson());
	}
}
