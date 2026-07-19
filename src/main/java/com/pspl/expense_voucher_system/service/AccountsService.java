package com.pspl.expense_voucher_system.service;

import com.pspl.expense_voucher_system.dto.PaymentResponse;
import com.pspl.expense_voucher_system.dto.VoucherResponse;
import java.util.List;

/**
 * AccountsService defines the payment workflow for approved vouchers.
 */
public interface AccountsService {

	List<VoucherResponse> getApprovedVouchers();

	VoucherResponse getApprovedVoucherById(Long id);

	PaymentResponse payVoucher(Long id);
}
