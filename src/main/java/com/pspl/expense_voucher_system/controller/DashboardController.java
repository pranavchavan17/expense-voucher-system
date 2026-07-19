package com.pspl.expense_voucher_system.controller;

import com.pspl.expense_voucher_system.dto.AccountsDashboardResponse;
import com.pspl.expense_voucher_system.dto.DirectorDashboardResponse;
import com.pspl.expense_voucher_system.dto.EmployeeDashboardResponse;
import com.pspl.expense_voucher_system.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * DashboardController exposes role-specific aggregated voucher summaries.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	/**
	 * Returns the employee dashboard summary for the logged-in employee.
	 */
	@GetMapping("/employee")
	public ResponseEntity<EmployeeDashboardResponse> getEmployeeDashboard() {
		return ResponseEntity.ok(dashboardService.getEmployeeDashboard());
	}

	/**
	 * Returns the director dashboard summary.
	 */
	@GetMapping("/director")
	public ResponseEntity<DirectorDashboardResponse> getDirectorDashboard() {
		return ResponseEntity.ok(dashboardService.getDirectorDashboard());
	}

	/**
	 * Returns the accounts dashboard summary.
	 */
	@GetMapping("/accounts")
	public ResponseEntity<AccountsDashboardResponse> getAccountsDashboard() {
		return ResponseEntity.ok(dashboardService.getAccountsDashboard());
	}
}
