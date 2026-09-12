"use client";

import { AlertCircle, BookOpen, CheckCircle, FileText, Sparkles } from "lucide-react";
import type { ClassRecap } from "@/lib/catchup";

export function RecapCard({
  recap,
  onClick,
}: {
  recap: ClassRecap;
  onClick: () => void;
}) {
  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      className="group rounded-3xl border border-border-subtle bg-surface p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1 cursor-pointer text-left space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-1 block">{recap.course}</span>
          <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
            Class Recap — {recap.class_date}
          </h3>
          <p className="text-xs font-medium text-muted mt-1.5">
            Submitted by <span className="font-bold text-foreground">{recap.contributor_name}</span> · {recap.contributor_trust}
          </p>
        </div>

        <span className="rounded-full bg-surface-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted shrink-0 border border-border-subtle">
          {recap.created_at}
        </span>
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-2">
        {recap.topics.map((t, i) => (
          <span
            key={i}
            className="rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground border border-border-subtle shadow-sm"
          >
            {t}
          </span>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-muted line-clamp-2">
        {recap.summary}
      </p>

      {/* Assignment alert if announced */}
      {recap.assignment_announced && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 flex items-start gap-3 text-xs text-warning shadow-inner">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <span className="font-bold block uppercase tracking-wider text-[10px] mb-0.5">Assignment Announced:</span>
            <span className="truncate block font-medium">{recap.assignment_details}</span>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-xs font-medium text-muted">
        <div className="flex items-center gap-1.5 text-success">
          <CheckCircle className="h-4 w-4" aria-hidden />
          <span className="font-bold tracking-wide">Confirmed by {recap.confirmations} classmates</span>
        </div>

        {recap.notes_url && (
          <div className="flex items-center gap-1.5 text-accent">
            <FileText className="h-4 w-4" aria-hidden />
            <span className="font-bold tracking-wide">Notes attached</span>
          </div>
        )}
      </div>
    </article>
  );
}
