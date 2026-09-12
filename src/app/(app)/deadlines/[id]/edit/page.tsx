import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { DeadlineFormValues } from "@/lib/deadlineSchema";
import { DeadlineForm } from "../../DeadlineForm";

export const metadata = { title: "Edit deadline — PULSE" };

export default async function EditDeadlinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="rounded-xl border border-border-subtle bg-surface p-6 text-sm text-muted">
          Supabase is not configured.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deadline } = await supabase
    .from("deadlines")
    .select(
      "id, title, subject, description, due_date, due_time, priority, type, link, notes",
    )
    .eq("id", id)
    .single();

  if (!deadline || !user) {
    notFound();
  }

  const initial: DeadlineFormValues = {
    title: deadline.title,
    subject: deadline.subject === "General" ? "" : (deadline.subject ?? ""),
    description: deadline.description ?? "",
    due_date: deadline.due_date,
    due_time: deadline.due_time ?? "",
    estimated_minutes: 60,
    importance: "medium",
    priority: deadline.priority as DeadlineFormValues["priority"],
    type: deadline.type as DeadlineFormValues["type"],
    link: deadline.link ?? "",
    notes: deadline.notes ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/deadlines"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Deadline Radar
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Edit deadline</h1>
      </div>
      <div className="rounded-3xl border border-border-subtle bg-surface p-8 shadow-xl">
        <DeadlineForm initial={initial} deadlineId={deadline.id} />
      </div>
    </div>
  );
}
