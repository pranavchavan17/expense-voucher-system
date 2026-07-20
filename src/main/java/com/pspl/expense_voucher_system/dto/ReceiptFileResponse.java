package com.pspl.expense_voucher_system.dto;

import org.springframework.core.io.Resource;

/**
 * ReceiptFileResponse carries the downloaded receipt resource and its response metadata.
 */
public class ReceiptFileResponse {

	private final Resource resource;
	private final String fileName;
	private final String contentType;

	public ReceiptFileResponse(Resource resource, String fileName, String contentType) {
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
