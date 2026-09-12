export default function CampusLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading events">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-surface-2" />
          <div className="h-4 w-72 rounded bg-surface-2" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-surface-2" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 rounded-lg bg-surface-2 shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 rounded-2xl border border-border-subtle bg-surface p-4 space-y-3">
            <div className="h-32 rounded-xl bg-surface-2" />
            <div className="h-5 w-3/4 rounded bg-surface-2" />
            <div className="h-4 w-1/2 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
