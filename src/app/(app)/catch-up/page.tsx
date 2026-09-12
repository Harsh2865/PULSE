"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  aggregateMissedKnowledge,
  fetchRecaps,
  getLocalSchedule,
  saveLocalSchedule,
  type ClassRecap,
  type ClassScheduleItem,
} from "@/lib/catchup";
import { MissedClassReporter } from "@/components/catchup/MissedClassReporter";
import { RecapCard } from "@/components/catchup/RecapCard";
import { RecapDetailModal } from "@/components/catchup/RecapDetailModal";
import { CreateRecapModal } from "@/components/catchup/CreateRecapModal";
import { createClient } from "@/lib/supabase/client";

export default function CatchUpPage() {
  const [schedule, setSchedule] = useState<ClassScheduleItem[]>([]);
  const [recaps, setRecaps] = useState<ClassRecap[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecap, setSelectedRecap] = useState<ClassRecap | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    setSchedule(getLocalSchedule());
    async function loadRecaps() {
      const supabase = createClient();
      const dbRecaps = await fetchRecaps(supabase);
      setRecaps(dbRecaps);
    }
    loadRecaps();
  }, []);

  function handleScheduleStatusChange(id: string, status: ClassScheduleItem["status"]) {
    const next = schedule.map((s) => (s.id === id ? { ...s, status } : s));
    setSchedule(next);
    saveLocalSchedule(next);
  }

  function handleRecapCreated(newRecap: ClassRecap) {
    const next = [newRecap, ...recaps];
    setRecaps(next);
    setFlashMessage("Thank you for contributing! Your classmates can now catch up.");
    setTimeout(() => setFlashMessage(null), 4000);
  }

  async function handleConfirmRecap(updated: ClassRecap) {
    const next = recaps.map((r) => (r.id === updated.id ? updated : r));
    setRecaps(next);
    setSelectedRecap(updated);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      import("@/lib/catchup").then(({ submitRecapConfirmation }) => {
        submitRecapConfirmation(supabase, updated.id, user.id, true);
      });
    }
  }

  async function handleAddToDeadlines(title: string, subject: string, dueDate: string) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("deadlines").insert({
          user_id: user.id,
          title,
          subject,
          due_date: dueDate.includes("2026") ? dueDate : "2026-09-16",
          priority: "high",
          type: "assignment",
          status: "open",
        });
      }
    } catch {
      // Ignored if local
    }
    setFlashMessage(`Added "${title}" directly to your Deadline Radar!`);
    setTimeout(() => setFlashMessage(null), 4000);
  }

  const missedKnowledge = useMemo(
    () => aggregateMissedKnowledge(schedule, recaps),
    [schedule, recaps],
  );

  const filteredRecaps = useMemo(() => {
    return recaps.filter((r) => {
      const matchesCourse =
        selectedCourseFilter === "All" || r.course === selectedCourseFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        r.course.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.topics.some((t) => t.toLowerCase().includes(q));
      return matchesCourse && matchesQuery;
    });
  }, [recaps, selectedCourseFilter, searchQuery]);

  const uniqueCourses = useMemo(() => {
    return ["All", ...Array.from(new Set(recaps.map((r) => r.course)))];
  }, [recaps]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Catch Up Hub</h1>
            <span className="rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
              Academic Knowledge Layer
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Missed a lecture? View student-contributed recaps, announced assignments, and lecture notes.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 hover:scale-[1.02] hover:bg-accent-hover transition-all shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>Contribute Recap</span>
        </button>
      </div>

      {flashMessage && (
        <div
          role="status"
          className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-xs font-medium text-emerald-300"
        >
          {flashMessage}
        </div>
      )}

      {/* Missed Class Attendance Check Widget */}
      <MissedClassReporter
        schedule={schedule}
        onStatusChange={handleScheduleStatusChange}
      />

      {/* Aggregated "What Did I Miss?" Summary Box */}
      {missedKnowledge.missedCoursesCount > 0 && (
        <section
          aria-labelledby="what-i-missed-title"
          className="relative overflow-hidden rounded-3xl border border-warning/30 bg-surface p-6 sm:p-8 space-y-6 shadow-2xl shadow-warning/5"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-warning/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/20 text-warning shadow-inner">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <h2 id="what-i-missed-title" className="text-xl font-black tracking-tight text-foreground">
                  What You Missed ({missedKnowledge.missedCoursesCount} Class
                  {missedKnowledge.missedCoursesCount > 1 ? "es" : ""})
                </h2>
                <p className="text-xs font-medium text-muted mt-1">
                  Aggregated from verified student recaps for {missedKnowledge.missedCourses.join(", ")}.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Key Topics */}
            <div className="rounded-2xl border border-border-subtle bg-surface-2/40 p-5 space-y-3 hover:bg-surface-2 transition-colors">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest block">
                Topics Covered
              </span>
              <ul className="space-y-2 text-xs font-medium text-foreground">
                {missedKnowledge.allTopics.slice(0, 4).map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assignments Announced */}
            <div className="rounded-2xl border border-border-subtle bg-surface-2/40 p-5 space-y-3 hover:bg-surface-2 transition-colors">
              <span className="text-[10px] font-black text-warning uppercase tracking-widest block">
                Announced Assignments
              </span>
              {missedKnowledge.assignments.length === 0 ? (
                <p className="text-xs font-medium text-muted">No assignments announced in missed classes.</p>
              ) : (
                <ul className="space-y-2.5 text-xs text-foreground">
                  {missedKnowledge.assignments.map((a, i) => (
                    <li key={i} className="rounded-xl bg-surface p-3 border border-border-subtle shadow-sm">
                      <span className="font-bold block text-warning mb-1">{a.course}</span>
                      <span className="block text-muted leading-relaxed">{a.details}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Priority Move */}
            <div className="rounded-2xl border border-accent/40 bg-accent-soft/30 p-5 space-y-4 flex flex-col justify-between shadow-inner">
              <div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  Do This First
                </span>
                <p className="text-sm font-bold text-foreground mt-2 leading-relaxed">
                  Review Binary Tree traversals and begin Problem Set 4. Faculty warned this is on Midterm 1.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (missedKnowledge.relevantRecaps[0]) {
                    setSelectedRecap(missedKnowledge.relevantRecaps[0]);
                  }
                }}
                className="mt-4 w-full justify-center inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-accent/20 hover:scale-[1.02] transition-all"
              >
                <span>Read full DSA recap & notes →</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recaps Feed */}
      <section className="space-y-6 pt-4 border-t border-border-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black tracking-tight text-foreground">Verified Class Recaps</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="search"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-border-subtle bg-surface-2/50 px-10 py-2.5 text-sm font-medium text-foreground transition-all duration-200 placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none focus:ring-4 focus:ring-accent-soft shadow-inner"
              />
            </div>

            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="rounded-xl border border-border-subtle bg-surface-2/50 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 focus:border-accent focus:outline-none shadow-inner"
            >
              {uniqueCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredRecaps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-subtle bg-surface p-10 text-center space-y-2">
            <GraduationCap className="h-8 w-8 text-accent mx-auto opacity-75" />
            <h3 className="text-sm font-semibold text-foreground">No recaps found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              No recaps found matching your search. Be the first to help your classmates by contributing one!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Contribute Recap</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecaps.map((recap) => (
              <RecapCard
                key={recap.id}
                recap={recap}
                onClick={() => setSelectedRecap(recap)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recap Detail Modal */}
      {selectedRecap && (
        <RecapDetailModal
          recap={selectedRecap}
          onClose={() => setSelectedRecap(null)}
          onConfirmRecap={handleConfirmRecap}
          onAddToDeadlines={handleAddToDeadlines}
        />
      )}

      {/* Create Recap Modal */}
      {isCreateOpen && (
        <CreateRecapModal
          onClose={() => setIsCreateOpen(false)}
          onRecapCreated={handleRecapCreated}
        />
      )}
    </div>
  );
}
