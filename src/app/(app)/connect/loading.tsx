export default function ConnectLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading connect data">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-surface-2" />
          <div className="h-4 w-72 rounded bg-surface-2" />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="h-9 w-28 rounded-xl bg-surface-2" />
        <div className="h-9 w-28 rounded-xl bg-surface-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
