package com.pspl.expense_voucher_system.service;

import com.pspl.expense_voucher_system.dto.RejectVoucherRequest;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import java.util.List;

/**
 * DirectorService defines the approval workflow for submitted vouchers.
 */
public interface DirectorService {

	List<VoucherResponse> getSubmittedVouchers();

	VoucherResponse getSubmittedVoucherById(Long id);

	VoucherResponse approveVoucher(Long id);

	VoucherResponse rejectVoucher(Long id, RejectVoucherRequest request);
}
