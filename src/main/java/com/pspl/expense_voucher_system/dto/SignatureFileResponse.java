package com.pspl.expense_voucher_system.dto;

import org.springframework.core.io.Resource;

/**
 * SignatureFileResponse carries a stored signature file for download responses.
 */
public class SignatureFileResponse {

	private final Resource resource;
	private final String fileName;
	private final String contentType;

	public SignatureFileResponse(Resource resource, String fileName, String contentType) {
		this.resource = resource;
		this.fileName = fileName;
		this.contentType = contentType;
	}

	public Resource getResource() {
		return resource;
	}

	public String getFileName() {
		return fileName;
	}

	public String getContentType() {
		return contentType;
	}
}
