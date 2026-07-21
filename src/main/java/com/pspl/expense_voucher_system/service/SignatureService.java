package com.pspl.expense_voucher_system.service;

import com.pspl.expense_voucher_system.dto.SignatureFileResponse;
import com.pspl.expense_voucher_system.dto.UserResponse;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

/**
 * SignatureService manages employee and director signatures and signature downloads.
 */
public interface SignatureService {

	UserResponse uploadEmployeeSignature(MultipartFile signature);

	SignatureFileResponse getEmployeeSignature();

	UserResponse uploadDirectorSignature(MultipartFile signature);

	SignatureFileResponse getDirectorSignature();

	SignatureFileResponse getVoucherEmployeeSignature(Long voucherId);

	SignatureFileResponse getVoucherDirectorSignature(Long voucherId);

	boolean currentEmployeeHasSignature();

	boolean currentDirectorHasSignature();

	void ensureCurrentEmployeeHasSignature();

	void ensureCurrentDirectorHasSignature();
}
