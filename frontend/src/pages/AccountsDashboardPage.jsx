import { useEffect, useState } from "react";
import { AlertTriangle, BadgeDollarSign, RefreshCw, WalletCards } from "lucide-react";
import Card from "@/components/Card";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { getAccountsDashboard } from "@/services/dashboardService";
import { formatAmount, formatCount, isZeroMetrics } from "@/utils/dashboardFormatters";

/**
 * AccountsDashboardPage renders live dashboard metrics for the authenticated accounts user.
 */
export default function AccountsDashboardPage() {
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
        const data = await getAccountsDashboard();
        if (active) {
          setDashboard(data);
        }
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err?.message || "Unable to load accounts dashboard.");
          setDashboard(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    const handleRefresh = () => {
      loadDashboard();
    };

    window.addEventListener("dashboard:refresh", handleRefresh);

    return () => {
      active = false;
      window.removeEventListener("dashboard:refresh", handleRefresh);
    };
  }, []);

  const metrics = dashboard
    ? {
        pendingPaymentCount: dashboard.pendingPaymentCount,
        paidCount: dashboard.paidCount,
        totalPaidAmount: dashboard.totalPaidAmount
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Dashboard"
        description={`Live summary for ${currentUser?.fullName || "the logged-in accounts user"}.`}
      />

      {loading ? (
        <Card className="p-6">
          <LoadingSpinner label="Loading accounts dashboard..." />
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
          description="All accounts dashboard values are currently zero."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardMetricCard label="Pending Payment Count" value={formatCount(metrics.pendingPaymentCount)} icon={WalletCards} tone="blue" />
          <DashboardMetricCard label="Paid Count" value={formatCount(metrics.paidCount)} icon={WalletCards} tone="emerald" />
          <DashboardMetricCard label="Total Paid Amount" value={formatAmount(metrics.totalPaidAmount)} icon={BadgeDollarSign} tone="purple" />
        </div>
      )}
    </div>
  );
}
