import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Card from "@/components/Card";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { getEmployeeDashboard } from "@/services/dashboardService";
import { formatAmount, formatCount, isZeroMetrics } from "@/utils/dashboardFormatters";

/**
 * EmployeeDashboardPage renders live dashboard metrics for the authenticated employee.
 */
export default function EmployeeDashboardPage() {
  const { currentUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getEmployeeDashboard();
        if (active) {
          setDashboard(data);
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || "Unable to load employee dashboard.");
          setDashboard(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const metrics = dashboard
    ? {
        totalVouchers: dashboard.totalVouchers,
        draftCount: dashboard.draftCount,
        submittedCount: dashboard.submittedCount,
        approvedCount: dashboard.approvedCount,
        rejectedCount: dashboard.rejectedCount,
        paidCount: dashboard.paidCount,
        totalClaimAmount: dashboard.totalClaimAmount,
        totalPaidAmount: dashboard.totalPaidAmount
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Dashboard"
        description={`Live summary for ${currentUser?.fullName || "the logged-in employee"}.`}
      />

      {loading ? (
        <Card className="p-6">
          <LoadingSpinner label="Loading employee dashboard..." />
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3 text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Unable to load dashboard</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <Button type="button" onClick={() => window.location.reload()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      ) : metrics && isZeroMetrics(metrics) ? (
        <EmptyState
          title="No dashboard data available"
          description="All employee dashboard values are currently zero."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard label="Total Vouchers" value={formatCount(metrics.totalVouchers)} />
          <DashboardMetricCard label="Draft Count" value={formatCount(metrics.draftCount)} />
          <DashboardMetricCard label="Submitted Count" value={formatCount(metrics.submittedCount)} />
          <DashboardMetricCard label="Approved Count" value={formatCount(metrics.approvedCount)} />
          <DashboardMetricCard label="Rejected Count" value={formatCount(metrics.rejectedCount)} />
          <DashboardMetricCard label="Paid Count" value={formatCount(metrics.paidCount)} />
          <DashboardMetricCard label="Total Claim Amount" value={formatAmount(metrics.totalClaimAmount)} />
          <DashboardMetricCard label="Total Paid Amount" value={formatAmount(metrics.totalPaidAmount)} />
        </div>
      )}
    </div>
  );
}
