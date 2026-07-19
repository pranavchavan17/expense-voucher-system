package com.pspl.expense_voucher_system.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ApiErrorResponse keeps all error responses consistent across controller and security layers.
 */
public class ApiErrorResponse {

	private LocalDateTime timestamp;
	private int status;
	private String error;
	private String message;
	private String path;
	private List<String> details;

	public ApiErrorResponse() {
		this.timestamp = LocalDateTime.now();
	}

	public ApiErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path, List<String> details) {
		this.timestamp = timestamp;
		this.status = status;
		this.error = error;
		this.message = message;
		this.path = path;
		this.details = details;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public List<String> getDetails() {
		return details;
	}

	public void setDetails(List<String> details) {
		this.details = details;
	}

	/**
	 * Produces a compact JSON payload for the security layer, which writes errors directly to the response.
	 */
	public String toJson() {
		StringBuilder json = new StringBuilder();
		json.append("{");
		appendStringField(json, "timestamp", timestamp != null ? timestamp.toString() : null);
		json.append(",");
		json.append("\"status\":").append(status).append(",");
		appendStringField(json, "error", error);
		json.append(",");
		appendStringField(json, "message", message);
		json.append(",");
		appendStringField(json, "path", path);
		json.append(",");
		json.append("\"details\":");
		if (details == null) {
			json.append("null");
		} else {
			json.append("[");
			for (int i = 0; i < details.size(); i++) {
				if (i > 0) {
					json.append(",");
				}
				appendJsonString(json, details.get(i));
			}
			json.append("]");
		}
		json.append("}");
		return json.toString();
	}

	private void appendStringField(StringBuilder json, String name, String value) {
		json.append("\"").append(name).append("\":");
		if (value == null) {
			json.append("null");
		} else {
			appendJsonString(json, value);
		}
	}

	private void appendJsonString(StringBuilder json, String value) {
		json.append("\"");
		for (char ch : value.toCharArray()) {
			switch (ch) {
				case '\\' -> json.append("\\\\");
				case '"' -> json.append("\\\"");
				case '\b' -> json.append("\\b");
				case '\f' -> json.append("\\f");
				case '\n' -> json.append("\\n");
				case '\r' -> json.append("\\r");
				case '\t' -> json.append("\\t");
				default -> {
					if (ch < 0x20) {
						json.append(String.format("\\u%04x", (int) ch));
					} else {
						json.append(ch);
					}
				}
			}
		}
		json.append("\"");
	}
}
