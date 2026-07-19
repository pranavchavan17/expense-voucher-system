package com.pspl.expense_voucher_system.service;

import com.pspl.expense_voucher_system.dto.AccountsDashboardResponse;
import com.pspl.expense_voucher_system.dto.DirectorDashboardResponse;
import com.pspl.expense_voucher_system.dto.EmployeeDashboardResponse;

/**
 * DashboardService defines summary views for each role-specific dashboard.
 */
public interface DashboardService {

	EmployeeDashboardResponse getEmployeeDashboard();

	DirectorDashboardResponse getDirectorDashboard();

	AccountsDashboardResponse getAccountsDashboard();
}
