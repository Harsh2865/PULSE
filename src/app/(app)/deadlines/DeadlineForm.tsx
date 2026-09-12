"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DEADLINE_PRIORITIES,
  DEADLINE_TYPES,
  deadlineFormSchema,
  emptyDeadlineForm,
  toDeadlineRow,
  type DeadlineFormValues,
} from "@/lib/deadlineSchema";
import { deadlineTypeLabels } from "@/lib/deadlines";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

const field =
  "w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-all duration-200 placeholder:text-muted focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft shadow-inner";
const label = "block text-sm font-semibold text-foreground mb-2";

export function DeadlineForm({
  initial,
  deadlineId,
}: {
  initial?: DeadlineFormValues;
  deadlineId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(deadlineFormSchema),
    defaultValues: initial ?? emptyDeadlineForm,
  });

  async function onSubmit(values: DeadlineFormValues) {
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Your session expired. Please sign in again.");
      return;
    }
    const payload = { ...toDeadlineRow(values), user_id: user.id };

    const result = deadlineId
      ? await supabase
          .from("deadlines")
          .update(payload)
          .eq("id", deadlineId)
      : await supabase.from("deadlines").insert(payload);

    if (result.error) {
      setError("Couldn’t save the deadline. Please try again.");
      return;
    }
    router.push(deadlineId ? "/deadlines?flash=updated" : "/deadlines?flash=created");
  }

  const fieldError = (message: string | undefined) =>
    message ? (
      <p role="alert" className="mt-1 text-xs text-red-300">
        {message}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <label htmlFor="title" className={label}>
          Title *
        </label>
        <input
          id="title"
          className={field}
          placeholder="Submit DB assignment"
          {...register("title")}
        />
        {fieldError(errors.title?.message)}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="subject" className={label}>
            Subject
          </label>
          <input
            id="subject"
            className={field}
            placeholder="Database Systems"
            {...register("subject")}
          />
          {fieldError(errors.subject?.message)}
        </div>
        <div className="space-y-2">
          <label htmlFor="type" className={label}>
            Type
          </label>
          <select id="type" className={field} {...register("type")}>
            {DEADLINE_TYPES.map((t) => (
              <option key={t} value={t}>
                {deadlineTypeLabels[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="space-y-2">
          <label htmlFor="due_date" className={label}>
            Due date *
          </label>
          <input id="due_date" type="date" className={field} {...register("due_date")} />
          {fieldError(errors.due_date?.message)}
        </div>
        <div className="space-y-2">
          <label htmlFor="due_time" className={label}>
            Due time
          </label>
          <input id="due_time" type="time" className={field} {...register("due_time")} />
          {fieldError(errors.due_time?.message)}
        </div>
        <div className="space-y-2">
          <label htmlFor="estimated_minutes" className={label}>
            Est. effort (mins)
          </label>
          <input
            id="estimated_minutes"
            type="number"
            step="15"
            min="5"
            max="1440"
            className={field}
            placeholder="60"
            {...register("estimated_minutes")}
          />
          {fieldError(errors.estimated_minutes?.message)}
        </div>
        <div className="space-y-2">
          <label htmlFor="importance" className={label}>
            Importance
          </label>
          <select id="importance" className={field} {...register("importance")}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="priority" className={label}>
            Priority Strategy
          </label>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Auto balances urgency + effort + importance
          </span>
        </div>
        <select id="priority" className={field} {...register("priority")}>
          <option value="auto">Auto (Deterministic Formula)</option>
          <option value="high">Manual: High</option>
          <option value="medium">Manual: Medium</option>
          <option value="low">Manual: Low</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="link" className={label}>
          Link
        </label>
        <input
          id="link"
          type="url"
          className={field}
          placeholder="https://lms.university.edu/assignment/123"
          {...register("link")}
        />
        {fieldError(errors.link?.message)}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className={label}>
          Description
        </label>
        <textarea
          id="description"
          rows={2}
          className={field}
          placeholder="What exactly needs to be done?"
          {...register("description")}
        />
        {fieldError(errors.description?.message)}
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className={label}>
          Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          className={field}
          placeholder="Reminders, resources, anything useful."
          {...register("notes")}
        />
        {fieldError(errors.notes?.message)}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-accent-hover disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSubmitting ? "Saving…" : deadlineId ? "Save changes" : "Add deadline"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
          Cancel
        </button>
      </div>
    </form>
  );
}
