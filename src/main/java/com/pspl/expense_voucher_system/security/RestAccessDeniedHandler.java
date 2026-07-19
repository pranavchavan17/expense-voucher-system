package com.pspl.expense_voucher_system.security;

import com.pspl.expense_voucher_system.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/**
 * RestAccessDeniedHandler converts authorization failures into JSON responses.
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
			throws IOException {
		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		ApiErrorResponse errorResponse = new ApiErrorResponse(
				java.time.LocalDateTime.now(),
				HttpServletResponse.SC_FORBIDDEN,
				"Forbidden",
				"You do not have permission to access this resource.",
				request.getRequestURI(),
				null);
		response.getWriter().write(errorResponse.toJson());
	}
}
