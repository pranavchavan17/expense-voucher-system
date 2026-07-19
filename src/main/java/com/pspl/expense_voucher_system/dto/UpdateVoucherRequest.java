package com.pspl.expense_voucher_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * UpdateVoucherRequest carries the editable fields for a draft voucher.
 */
public class UpdateVoucherRequest {

	@NotNull(message = "Voucher date is required")
	@PastOrPresent(message = "Voucher date cannot be in the future")
	private LocalDate voucherDate;

	@NotNull(message = "Expense date is required")
	@PastOrPresent(message = "Expense date cannot be in the future")
	private LocalDate expenseDate;

	@NotBlank(message = "Department is required")
	private String department;

	@NotBlank(message = "Expense title is required")
	private String expenseTitle;

	@NotBlank(message = "Expense category is required")
	private String expenseCategory;

	@NotBlank(message = "Expense description is required")
	private String expenseDescription;

	@NotNull(message = "Amount is required")
	private BigDecimal amount;

	public UpdateVoucherRequest() {
	}

	public UpdateVoucherRequest(LocalDate voucherDate, LocalDate expenseDate, String department, String expenseTitle,
			String expenseCategory, String expenseDescription, BigDecimal amount) {
		this.voucherDate = voucherDate;
		this.expenseDate = expenseDate;
		this.department = department;
		this.expenseTitle = expenseTitle;
		this.expenseCategory = expenseCategory;
		this.expenseDescription = expenseDescription;
		this.amount = amount;
	}

	public LocalDate getVoucherDate() {
		return voucherDate;
	}

	public void setVoucherDate(LocalDate voucherDate) {
		this.voucherDate = voucherDate;
	}

	public LocalDate getExpenseDate() {
		return expenseDate;
	}

	public void setExpenseDate(LocalDate expenseDate) {
		this.expenseDate = expenseDate;
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public String getExpenseTitle() {
		return expenseTitle;
	}

	public void setExpenseTitle(String expenseTitle) {
		this.expenseTitle = expenseTitle;
	}

	public String getExpenseCategory() {
		return expenseCategory;
	}

	public void setExpenseCategory(String expenseCategory) {
		this.expenseCategory = expenseCategory;
	}

	public String getExpenseDescription() {
		return expenseDescription;
	}

	public void setExpenseDescription(String expenseDescription) {
		this.expenseDescription = expenseDescription;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
}
