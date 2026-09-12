"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Plus,
  Sparkles,
  ThumbsUp,
  X,
} from "lucide-react";
import type { ClassRecap } from "@/lib/catchup";

export function RecapDetailModal({
  recap,
  onClose,
  onConfirmRecap,
  onAddToDeadlines,
}: {
  recap: ClassRecap;
  onClose: () => void;
  onConfirmRecap: (recap: ClassRecap) => void;
  onAddToDeadlines?: (title: string, subject: string, dueDate: string) => void;
}) {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [addedDeadline, setAddedDeadline] = useState(false);

  function handleConfirm() {
    if (hasConfirmed) return;
    const updated = {
      ...recap,
      confirmations: recap.confirmations + 1,
    };
    setHasConfirmed(true);
    onConfirmRecap(updated);
  }

  function handleAddDeadline() {
    if (addedDeadline || !onAddToDeadlines) return;
    onAddToDeadlines(
      recap.assignment_details || `${recap.course} Assignment`,
      recap.course,
      recap.assignment_due_date || "2026-09-15",
    );
    setAddedDeadline(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recap-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-[2rem] border border-border-subtle bg-surface shadow-2xl p-6 sm:p-10 space-y-8 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 rounded-full p-2 text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-2 block">{recap.course}</span>
          <h2 id="recap-modal-title" className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Class Recap — {recap.class_date}
          </h2>
          <p className="text-sm font-medium text-muted mt-2">
            Contributed by <span className="font-bold text-foreground">{recap.contributor_name}</span> ·{" "}
            <span className="text-accent font-bold">{recap.contributor_trust}</span>
          </p>
        </div>

        {/* Topics */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            <span>Topics Covered</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {recap.topics.map((t, i) => (
              <span
                key={i}
                className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-foreground font-medium border border-border-subtle"
              >
                • {t}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            What Was Taught
          </h3>
          <div className="rounded-xl border border-border-subtle bg-surface-2/40 p-4 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {recap.summary}
          </div>
        </div>

        {/* Assignment Announced */}
        {recap.assignment_announced && (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-warning uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Assignment Announced
              </span>
              {recap.assignment_due_date && (
                <span className="text-xs text-warning font-bold">
                  Due: {recap.assignment_due_date}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground font-medium leading-relaxed">
              {recap.assignment_details}
            </p>
            {onAddToDeadlines && (
              <button
                type="button"
                onClick={handleAddDeadline}
                disabled={addedDeadline}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                  addedDeadline
                    ? "bg-success text-white shadow-md scale-[1.02]"
                    : "bg-warning text-black hover:scale-[1.02] shadow-md shadow-warning/20"
                }`}
              >
                {addedDeadline ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Added to Deadline Radar!</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add to my Deadlines</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Important Announcements */}
        {recap.important_notes && (
          <div className="rounded-2xl border border-accent/30 bg-accent-soft/30 p-5 space-y-2 shadow-inner">
            <span className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Important Announcement / Exam Hint
            </span>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {recap.important_notes}
            </p>
          </div>
        )}

        {/* Attached Material */}
        {recap.notes_url && (
          <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-2 p-4 text-sm shadow-inner">
            <div className="flex items-center gap-2.5 text-foreground font-bold">
              <FileText className="h-5 w-5 text-accent" />
              <span>Class Lecture Notes / PDF attached</span>
            </div>
            <a
              href={recap.notes_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-accent hover:underline font-bold"
            >
              <span>View Notes</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Community Verification Footer */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-6">
          <div className="flex items-center gap-2 text-success font-bold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>Confirmed by {recap.confirmations} students</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={hasConfirmed}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
              hasConfirmed
                ? "bg-success/20 text-success"
                : "bg-surface-3 text-foreground hover:bg-surface-2 shadow-sm hover:shadow-md"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{hasConfirmed ? "Confirmed ✓" : "Confirm Helpful"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
