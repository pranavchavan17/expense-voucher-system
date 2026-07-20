package com.pspl.expense_voucher_system.service;

import com.pspl.expense_voucher_system.dto.CreateVoucherRequest;
import com.pspl.expense_voucher_system.dto.ReceiptFileResponse;
import com.pspl.expense_voucher_system.dto.UpdateVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

/**
 * VoucherService defines the business operations for employee voucher management.
 * The DTOs expose the full voucher payload: voucherDate, expenseDate, department,
 * expenseTitle, expenseCategory, expenseDescription, and amount.
 */
public interface VoucherService {

	VoucherResponse createVoucher(CreateVoucherRequest request);

	List<VoucherResponse> getMyVouchers();

	VoucherResponse getVoucherById(Long id);

	VoucherResponse updateVoucher(Long id, UpdateVoucherRequest request);

	void deleteVoucher(Long id);

	VoucherResponse submitVoucher(Long id);

	VoucherResponse uploadReceipt(Long id, MultipartFile receipt);

	ReceiptFileResponse downloadReceipt(Long id);
}
