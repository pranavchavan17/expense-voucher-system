package com.pspl.expense_voucher_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Voucher is the core expense record managed by Module 3.
 * Each voucher belongs to one employee and moves through the voucher status lifecycle.
 */
@Entity
@Table(name = "vouchers")
public class Voucher {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 50)
	private String voucherNumber;

	@Column(nullable = false)
	private LocalDate voucherDate;

	@Column(nullable = false)
	private LocalDate expenseDate;

	@Column(nullable = false, length = 150)
	private String department;

	@Column(nullable = false, length = 255)
	private String expenseTitle;

	@Column(nullable = false, length = 150)
	private String expenseCategory;

	@Column(nullable = false, length = 1000)
	private String expenseDescription;

	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal amount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private VoucherStatus status;

	@Column
	private LocalDateTime approvalDate;

	@Column
	private LocalDateTime paymentDate;

	@Column(unique = true, length = 50)
	private String paymentReference;

	@Column(length = 1000)
	private String rejectionReason;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	public Voucher() {
	}

	public Voucher(Long id, String voucherNumber, LocalDate voucherDate, LocalDate expenseDate, String department,
			String expenseTitle, String expenseCategory, String expenseDescription, BigDecimal amount,
			VoucherStatus status, LocalDateTime approvalDate, LocalDateTime paymentDate, String paymentReference,
			String rejectionReason, User user,
			LocalDateTime createdAt, LocalDateTime updatedAt) {
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
		this.approvalDate = approvalDate;
		this.paymentDate = paymentDate;
		this.paymentReference = paymentReference;
		this.rejectionReason = rejectionReason;
		this.user = user;
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

	public LocalDateTime getApprovalDate() {
		return approvalDate;
	}

	public void setApprovalDate(LocalDateTime approvalDate) {
		this.approvalDate = approvalDate;
	}

	public LocalDateTime getPaymentDate() {
		return paymentDate;
	}

	public void setPaymentDate(LocalDateTime paymentDate) {
		this.paymentDate = paymentDate;
	}

	public String getPaymentReference() {
		return paymentReference;
	}

	public void setPaymentReference(String paymentReference) {
		this.paymentReference = paymentReference;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
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

	/**
	 * Keeps audit timestamps current for each insert and update.
	 */
	@PrePersist
	protected void onCreate() {
		LocalDateTime now = LocalDateTime.now();
		createdAt = now;
		updatedAt = now;
	}

	/**
	 * Refreshes the update timestamp whenever the voucher changes.
	 */
	@PreUpdate
	protected void onUpdate() {
		updatedAt = LocalDateTime.now();
	}
}
