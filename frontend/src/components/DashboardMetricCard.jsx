import Card from "@/components/Card";

/**
 * DashboardMetricCard renders a single live metric tile.
 */
export default function DashboardMetricCard({ label, value, hint }) {
  return (
    <Card className="p-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
    </Card>
  );
}
