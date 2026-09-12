export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-surface-2" />
        <div className="h-4 w-64 rounded bg-surface-2" />
      </div>

      <div className="h-44 rounded-2xl bg-surface-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="h-44 rounded-2xl bg-surface-2" />
        <div className="h-44 rounded-2xl bg-surface-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="h-36 rounded-2xl bg-surface-2" />
        <div className="h-36 rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
