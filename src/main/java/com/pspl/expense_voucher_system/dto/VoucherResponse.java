package com.pspl.expense_voucher_system.dto;

import com.pspl.expense_voucher_system.entity.VoucherStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * VoucherResponse exposes voucher data without leaking entity relationships.
 */
public class VoucherResponse {

	private Long id;
	private String voucherNumber;
	private LocalDate voucherDate;
	private LocalDate expenseDate;
	private String department;
	private String expenseTitle;
	private String expenseCategory;
	private String expenseDescription;
	private BigDecimal amount;
	private VoucherStatus status;
	private Long employeeId;
	private String employeeName;
	private String employeeEmail;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public VoucherResponse() {
	}

	public VoucherResponse(Long id, String voucherNumber, LocalDate voucherDate, LocalDate expenseDate, String department,
			String expenseTitle, String expenseCategory, String expenseDescription, BigDecimal amount,
			VoucherStatus status, Long employeeId, String employeeName, String employeeEmail, LocalDateTime createdAt,
			LocalDateTime updatedAt) {
		this.id = id;
		this.voucherNumber = voucherNumber;
		this.voucherDate = voucherDate;
		this.expenseDate = expenseDate;
		this.department = department;
		this.expenseTitle = expenseTitle;
		this.expenseCategory = expenseCategory;
		this.expenseDescription = expenseDescription;
		this.amount = amount;
		this.status = status;
		this.employeeId = employeeId;
		this.employeeName = employeeName;
		this.employeeEmail = employeeEmail;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getVoucherNumber() {
		return voucherNumber;
	}

	public void setVoucherNumber(String voucherNumber) {
		this.voucherNumber = voucherNumber;
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

	public VoucherStatus getStatus() {
		return status;
	}

	public void setStatus(VoucherStatus status) {
		this.status = status;
	}

	public Long getEmployeeId() {
		return employeeId;
	}

	public void setEmployeeId(Long employeeId) {
		this.employeeId = employeeId;
	}

	public String getEmployeeName() {
		return employeeName;
	}

	public void setEmployeeName(String employeeName) {
		this.employeeName = employeeName;
	}

	public String getEmployeeEmail() {
		return employeeEmail;
	}

	public void setEmployeeEmail(String employeeEmail) {
		this.employeeEmail = employeeEmail;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
