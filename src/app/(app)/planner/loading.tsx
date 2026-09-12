export default function PlannerLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading study planner">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-surface-2" />
          <div className="h-4 w-72 rounded bg-surface-2" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-surface-2" />
      </div>

      <div className="h-32 rounded-2xl bg-surface-2" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-surface-2" />
        <div className="h-80 rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
