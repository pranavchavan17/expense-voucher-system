package com.pspl.expense_voucher_system.exception;

import com.pspl.expense_voucher_system.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

/**
 * GlobalExceptionHandler centralizes JSON error mapping for application-level exceptions.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ApiErrorResponse> handleDuplicateResource(DuplicateResourceException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(UsernameNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleUsernameNotFound(UsernameNotFoundException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", "Authentication failed.", request.getRequestURI(), null);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
		List<String> details = ex.getBindingResult().getFieldErrors().stream()
				.map(this::formatFieldError)
				.collect(Collectors.toList());

		return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", "Validation failed.", request.getRequestURI(), details);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(VoucherNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleVoucherNotFound(VoucherNotFoundException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(VoucherStateException.class)
	public ResponseEntity<ApiErrorResponse> handleVoucherState(VoucherStateException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(ReceiptValidationException.class)
	public ResponseEntity<ApiErrorResponse> handleReceiptValidation(ReceiptValidationException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(ReceiptNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleReceiptNotFound(ReceiptNotFoundException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(ReceiptStorageException.class)
	public ResponseEntity<ApiErrorResponse> handleReceiptStorage(ReceiptStorageException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(MissingServletRequestPartException.class)
	public ResponseEntity<ApiErrorResponse> handleMissingPart(MissingServletRequestPartException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", "Receipt file is required.", request.getRequestURI(), null);
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiErrorResponse> handleMaxUpload(MaxUploadSizeExceededException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", "Receipt file must not exceed 5 MB.", request.getRequestURI(), null);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred.", request.getRequestURI(), null);
	}

	private String formatFieldError(FieldError fieldError) {
		return fieldError.getField() + ": " + fieldError.getDefaultMessage();
	}

	private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String error, String message, String path, List<String> details) {
		ApiErrorResponse response = new ApiErrorResponse(
				java.time.LocalDateTime.now(),
				status.value(),
				error,
				message,
				path,
				details);
		return ResponseEntity.status(status).body(response);
	}
}
