import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/SetupNotice";
import { DeadlineList, type DeadlineRow } from "./DeadlineList";

export const metadata = { title: "Deadline Radar — PULSE" };

const flashMessages: Record<string, string> = {
  created: "Deadline added.",
  updated: "Deadline updated.",
};

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{ flash?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const { flash } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deadlines, error } = await supabase
    .from("deadlines")
    .select(
      "id, title, subject, description, due_date, due_time, priority, type, status, link",
    )
    .eq("user_id", user!.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Deadline Radar</h1>
          <p className="mt-2 text-sm text-muted">
            Everything that needs your action, ordered by urgency.
          </p>
        </div>
        <Link
          href="/deadlines/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-accent-hover"
        >
          <Plus className="h-5 w-5" aria-hidden />
          <span>Add Deadline</span>
        </Link>
      </div>

      {flash && flashMessages[flash] && (
        <p
          role="status"
          className="rounded-xl bg-success/15 border border-success/30 px-4 py-3 text-xs font-bold tracking-wide text-success shadow-inner"
        >
          {flashMessages[flash]}
        </p>
      )}

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300"
        >
          Couldn’t load deadlines: {error.message}
        </div>
      ) : (
        <DeadlineList deadlines={(deadlines as DeadlineRow[]) ?? []} />
      )}
    </div>
  );
}
