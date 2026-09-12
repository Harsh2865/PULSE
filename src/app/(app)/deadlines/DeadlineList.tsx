"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Link2,
  Pencil,
  Plus,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  compareDeadlines,
  deadlineStatus,
  deadlineTypeLabels,
  filterDeadlines,
  formatDueDate,
  type DeadlineFilter,
} from "@/lib/deadlines";
import { DEADLINE_TYPES, DEADLINE_PRIORITIES } from "@/lib/deadlineSchema";
import { createClient } from "@/lib/supabase/client";

export type DeadlineRow = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
  priority: string;
  type: string;
  status: string;
  link: string | null;
};

const statusChip: Record<string, string> = {
  overdue: "bg-danger/10 text-danger border border-danger/20",
  "due today": "bg-warning/10 text-warning border border-warning/20",
  "due soon": "bg-accent/10 text-accent border border-accent/20",
  upcoming: "bg-surface-2 text-muted border border-border-subtle",
  completed: "bg-success/10 text-success border border-success/20",
};

const priorityChip: Record<string, string> = {
  high: "bg-danger/10 text-danger border border-danger/20",
  medium: "bg-warning/10 text-warning border border-warning/20",
  low: "bg-surface-2 text-muted border border-border-subtle",
};

const select =
  "rounded-xl border border-border-subtle bg-surface-2 px-4 py-2 text-sm font-medium text-foreground transition-all focus:border-accent focus:outline-none shadow-inner";

export function DeadlineList({ deadlines }: { deadlines: DeadlineRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<DeadlineFilter>({
    status: "open",
    type: "all",
    priority: "all",
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visible = useMemo(
    () => [...filterDeadlines(deadlines, filter)].sort((a, b) => compareDeadlines(a, b)),
    [deadlines, filter],
  );

  async function toggleComplete(row: DeadlineRow) {
    setBusyId(row.id);
    const { error } = await createClient()
      .from("deadlines")
      .update({ status: row.status === "completed" ? "open" : "completed" })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      setMessage("Couldn’t update the deadline. Please try again.");
      return;
    }
    setMessage(
      row.status === "completed" ? "Deadline reopened." : "Deadline completed.",
    );
    router.refresh();
  }

  async function remove(row: DeadlineRow) {
    setBusyId(row.id);
    const { error } = await createClient()
      .from("deadlines")
      .delete()
      .eq("id", row.id);
    setBusyId(null);
    setConfirmingId(null);
    if (error) {
      setMessage("Couldn’t delete the deadline. Please try again.");
      return;
    }
    setMessage("Deadline deleted.");
    router.refresh();
  }

  const statusOptions: Array<DeadlineFilter["status"]> = [
    "open",
    "completed",
    "all",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter by status"
          className="flex overflow-hidden rounded-lg border border-border-subtle"
        >
          {statusOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter((f) => ({ ...f, status: s }))}
              aria-pressed={filter.status === s}
              className={`px-4 py-2 text-sm font-bold capitalize transition-colors ${
                filter.status === s
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "bg-surface text-muted hover:bg-surface-2"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          aria-label="Filter by type"
          className={select}
          value={filter.type}
          onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="all">All types</option>
          {DEADLINE_TYPES.map((t) => (
            <option key={t} value={t}>
              {deadlineTypeLabels[t]}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by priority"
          className={select}
          value={filter.priority}
          onChange={(e) => setFilter((f) => ({ ...f, priority: e.target.value }))}
        >
          <option value="all">All priorities</option>
          {DEADLINE_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p[0]!.toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <p className="ml-auto text-xs font-bold text-muted uppercase tracking-wider">
          Sorted by urgency, then priority
        </p>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-foreground"
        >
          {message}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-subtle bg-surface/50 p-12 text-center shadow-inner">
          <p className="text-lg font-black tracking-tight text-foreground">
            {filter.status === "open" && deadlines.length > 0
              ? "No open deadlines with these filters."
              : "You have a clear runway."}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-muted leading-relaxed">
            {deadlines.length === 0
              ? "Add your first deadline and the radar will keep it in view."
              : "Try widening the filters, or add a new deadline."}
          </p>
          <Link
            href="/deadlines/new"
            className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-accent-hover"
          >
            <Plus className="h-5 w-5" aria-hidden />
            <span>Add Deadline</span>
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((row) => {
            const status = deadlineStatus(row);
            const done = row.status === "completed";
            const busy = busyId === row.id;
            return (
              <li
                key={row.id}
                className="group rounded-2xl border border-border-subtle bg-surface px-5 py-4 transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className={`truncate text-lg font-bold tracking-tight ${done ? "text-muted line-through" : "text-foreground group-hover:text-accent transition-colors"}`}
                    >
                      {row.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-muted">
                      <span className="font-bold uppercase tracking-wider text-[10px] mr-1.5">{row.subject}</span> · {deadlineTypeLabels[row.type] ?? row.type} · due{" "}
                      {formatDueDate(row.due_date)}
                      {row.due_time ? ` at ${row.due_time.slice(0, 5)}` : ""}
                    </p>
                    {row.link && (
                      <a
                        href={row.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                      >
                        <Link2 className="h-4 w-4" aria-hidden />
                        Open link
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${priorityChip[row.priority] ?? priorityChip.low}`}
                    >
                      {row.priority}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusChip[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-border-subtle pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => toggleComplete(row)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-surface-3 hover:text-foreground disabled:opacity-50"
                  >
                    {done ? (
                      <>
                        <Undo2 className="h-4 w-4" aria-hidden />
                        Reopen
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" aria-hidden />
                        Mark complete
                      </>
                    )}
                  </button>
                  <Link
                    href={`/deadlines/${row.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-surface-3 hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </Link>
                  {confirmingId === row.id ? (
                    <span className="ml-auto inline-flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => remove(row)}
                        disabled={busy}
                        className="rounded-xl bg-danger/15 px-3 py-2 font-bold text-danger disabled:opacity-50 shadow-inner"
                      >
                        {busy ? "Deleting…" : "Confirm delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="px-2 py-2 font-bold text-muted hover:text-foreground"
                      >
                        Keep it
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(row.id)}
                      disabled={busy}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
