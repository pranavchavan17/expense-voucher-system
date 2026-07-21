import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Card from "@/components/Card";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { getDirectorDashboard } from "@/services/dashboardService";
import { formatAmount, formatCount, isZeroMetrics } from "@/utils/dashboardFormatters";

/**
 * DirectorDashboardPage renders live dashboard metrics for the authenticated director.
 */
export default function DirectorDashboardPage() {
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
        const data = await getDirectorDashboard();
        if (active) {
          setDashboard(data);
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || "Unable to load director dashboard.");
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
        pendingApprovalCount: dashboard.pendingApprovalCount,
        approvedCount: dashboard.approvedCount,
        rejectedCount: dashboard.rejectedCount,
        totalApprovedAmount: dashboard.totalApprovedAmount
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Director Dashboard"
        description={`Live summary for ${currentUser?.fullName || "the logged-in director"}.`}
      />

      {loading ? (
        <Card className="p-6">
          <LoadingSpinner label="Loading director dashboard..." />
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
          description="All director dashboard values are currently zero."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard label="Pending Approval Count" value={formatCount(metrics.pendingApprovalCount)} />
          <DashboardMetricCard label="Approved Count" value={formatCount(metrics.approvedCount)} />
          <DashboardMetricCard label="Rejected Count" value={formatCount(metrics.rejectedCount)} />
          <DashboardMetricCard label="Total Approved Amount" value={formatAmount(metrics.totalApprovedAmount)} />
        </div>
      )}
    </div>
  );
}
