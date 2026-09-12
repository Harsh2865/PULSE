"use client";

import { useState } from "react";
import { BookOpen, Calendar, X } from "lucide-react";
import type { ClassRecap } from "@/lib/catchup";

export function CreateRecapModal({
  onClose,
  onRecapCreated,
}: {
  onClose: () => void;
  onRecapCreated: (recap: ClassRecap) => void;
}) {
  const [course, setCourse] = useState("Data Structures & Algorithms");
  const [classDate, setClassDate] = useState("2026-09-12");
  const [topicsInput, setTopicsInput] = useState("");
  const [summary, setSummary] = useState("");
  const [hasAssignment, setHasAssignment] = useState(false);
  const [assignmentDetails, setAssignmentDetails] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [importantNotes, setImportantNotes] = useState("");
  const [notesUrl, setNotesUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim() || !course) {
      setError("Please provide the course and what was taught.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to contribute.");

      const topics = topicsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { data, error: insertError } = await supabase.from("class_recaps").insert({
        creator_id: user.id,
        course_name: course,
        class_date: classDate,
        topics: topics.length > 0 ? topics : ["General Discussion"],
        summary: summary.trim(),
        assignment_announced: hasAssignment,
        assignment_details: hasAssignment ? `${assignmentDetails.trim()}${assignmentDueDate ? ` (Due: ${assignmentDueDate.trim()})` : ""}` : null,
        important_notes: importantNotes.trim() || null,
        notes_url: notesUrl.trim() || null,
      }).select().single();

      if (insertError || !data) {
        throw new Error("Failed to submit recap.");
      }

      const newRecap: ClassRecap = {
        id: data.id,
        course: data.course_name,
        class_date: data.class_date,
        contributor_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "You",
        contributor_trust: "Active Contributor",
        topics: data.topics,
        summary: data.summary,
        assignment_announced: data.assignment_announced,
        assignment_details: data.assignment_details || undefined,
        assignment_due_date: undefined, // DB doesn't store this separately
        important_notes: data.important_notes || undefined,
        notes_url: data.notes_url || undefined,
        confirmations: 1, // Start with 1 self-confirmation conceptually
        created_at: new Date(data.created_at).toLocaleDateString(),
      };

      // Also self-confirm the recap automatically to match UI logic
      await supabase.from("recap_confirmations").insert({
        recap_id: data.id,
        user_id: user.id,
        is_helpful: true
      });

      onRecapCreated(newRecap);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const field =
    "w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted";
  const label = "block text-sm font-medium text-foreground mb-1";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-recap-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-surface shadow-2xl p-6 sm:p-8 my-8">
        <div className="flex items-center justify-between mb-5">
          <h2 id="create-recap-title" className="text-xl font-bold text-foreground">
            Contribute Class Recap
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="course" className={label}>
                Course *
              </label>
              <select
                id="course"
                className={field}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                <option value="Digital Logic Design">Digital Logic Design</option>
                <option value="Database Management Systems">Database Management Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Theory of Computation">Theory of Computation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="classDate" className={label}>
                Date *
              </label>
              <input
                id="classDate"
                type="date"
                required
                className={field}
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="topics" className={label}>
              Topics Covered (comma-separated)
            </label>
            <input
              id="topics"
              className={field}
              placeholder="e.g. Binary Trees, Tree Traversals, BST"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="summary" className={label}>
              What Was Taught? *
            </label>
            <textarea
              id="summary"
              rows={3}
              required
              className={field}
              placeholder="Explain the key concepts, theorems, proofs, or practical examples shown by the professor..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-2/40 p-3 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={hasAssignment}
                onChange={(e) => setHasAssignment(e.target.checked)}
                className="h-4 w-4 rounded border-border-subtle text-accent focus:ring-accent"
              />
              <span>Assignment was announced in this class</span>
            </label>

            {hasAssignment && (
              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="assignDetails" className="block text-xs font-medium text-foreground mb-1">
                    Assignment Questions / Details
                  </label>
                  <input
                    id="assignDetails"
                    className={field}
                    placeholder="e.g. Problems 1 to 4 on page 142..."
                    value={assignmentDetails}
                    onChange={(e) => setAssignmentDetails(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="assignDue" className="block text-xs font-medium text-foreground mb-1">
                    Submission Due Date
                  </label>
                  <input
                    id="assignDue"
                    className={field}
                    placeholder="e.g. Sept 16, 11:59 PM"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="important" className={label}>
              Important Faculty Hints / Announcements
            </label>
            <input
              id="important"
              className={field}
              placeholder="e.g. Sir said this topic will be 10 marks on the quiz..."
              value={importantNotes}
              onChange={(e) => setImportantNotes(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="notes" className={label}>
              Notes / Slides URL
            </label>
            <input
              id="notes"
              type="url"
              className={field}
              placeholder="https://drive.google.com/... or https://..."
              value={notesUrl}
              onChange={(e) => setNotesUrl(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90 shadow-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Recap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
