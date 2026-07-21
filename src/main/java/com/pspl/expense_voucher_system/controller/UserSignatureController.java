package com.pspl.expense_voucher_system.controller;

import com.pspl.expense_voucher_system.dto.UserResponse;
import com.pspl.expense_voucher_system.service.SignatureService;
import com.pspl.expense_voucher_system.dto.SignatureFileResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * UserSignatureController manages the logged-in employee signature lifecycle.
 */
@RestController
@RequestMapping("/api/v1/users/signature")
public class UserSignatureController {

	private final SignatureService signatureService;

	public UserSignatureController(SignatureService signatureService) {
		this.signatureService = signatureService;
	}

	/**
	 * Uploads or replaces the logged-in employee signature.
	 */
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<UserResponse> uploadSignature(@RequestPart("signature") MultipartFile signature) {
		return ResponseEntity.ok(signatureService.uploadEmployeeSignature(signature));
	}

	/**
	 * Returns the logged-in employee signature metadata.
	 */
	@GetMapping
	public ResponseEntity<Resource> getSignature() {
		SignatureFileResponse signature = signatureService.getEmployeeSignature();
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(signature.getContentType()))
				.header("Content-Disposition", "inline; filename=\"" + signature.getFileName() + "\"")
				.body(signature.getResource());
	}
}
