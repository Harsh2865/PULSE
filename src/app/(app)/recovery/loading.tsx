export default function RecoveryLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading recovery mode">
      <div className="h-28 rounded-2xl bg-surface-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-96 rounded-2xl bg-surface-2" />
        <div className="h-96 rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
