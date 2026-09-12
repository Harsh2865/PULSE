import { AlertTriangle } from "lucide-react";

export function SetupNotice() {
  return (
    <div
      role="status"
      className="rounded-xl border border-border-subtle bg-surface p-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">
            Supabase is not configured yet
          </p>
          <p className="text-muted">
            Add your project URL and publishable key to{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground">
              .env.local
            </code>{" "}
            , then run{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground">
              supabase/migrations/0001_init.sql
            </code>{" "}
            in the Supabase SQL Editor (see{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground">
              docs/DATABASE.md
            </code>
            ). Restart the dev server afterwards.
          </p>
        </div>
      </div>
    </div>
  );
}
