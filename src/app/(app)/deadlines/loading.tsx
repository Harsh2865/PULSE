export default function DeadlinesLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading deadlines">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-44 rounded-lg bg-surface-2" />
          <div className="mt-2 h-4 w-72 rounded bg-surface-2" />
        </div>
        <div className="h-9 w-20 rounded-lg bg-surface-2" />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="h-8 w-40 rounded-lg bg-surface-2" />
        <div className="h-8 w-28 rounded-lg bg-surface-2" />
        <div className="h-8 w-28 rounded-lg bg-surface-2" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-52 rounded bg-surface-2" />
                <div className="h-3 w-36 rounded bg-surface-2" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-surface-2" />
                <div className="h-5 w-20 rounded-full bg-surface-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
