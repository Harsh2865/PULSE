"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  Flame,
  Plus,
  RefreshCcw,
  Sparkles,
  Undo2,
  XCircle,
} from "lucide-react";
import {
  calculateTopicPriority,
  generateSchedule,
  fetchExamPlan,
  updateSessionStatus,
  updateTopicConfidence,
  saveNewSchedule,
  type ExamPlan,
  type ScheduledSession,
  type SyllabusTopic,
} from "@/lib/planner";
import { createClient } from "@/lib/supabase/client";
import { CreatePlanModal } from "@/components/planner/CreatePlanModal";

export default function PlannerPage() {
  const [plan, setPlan] = useState<ExamPlan | null>(null);
  const [filterUnit, setFilterUnit] = useState<string>("All");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  async function loadPlan() {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in to access the planner.");
      setIsLoading(false);
      return;
    }
    setUserId(user.id);

    const existingPlan = await fetchExamPlan(supabase, user.id);
    if (existingPlan) {
      setPlan(existingPlan);
    } else {
      setPlan(null);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadPlan();
  }, []);

  async function handleToggleSession(sessionId: string, markCompleted: boolean) {
    if (!plan || !userId) return;
    const supabase = createClient();
    
    // Determine what we're updating
    const sessionToUpdate = plan.schedule.find(s => s.id === sessionId);
    if (!sessionToUpdate) return;
    
    const newCompleted = markCompleted ? !sessionToUpdate.completed : false;
    const newMissed = markCompleted ? false : !sessionToUpdate.missed;

    const { error } = await updateSessionStatus(supabase, sessionId, {
      completed: newCompleted,
      missed: newMissed
    });

    if (error) {
      alert("Failed to update session status.");
      return;
    }

    const nextSessions = plan.schedule.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          completed: newCompleted,
          missed: newMissed,
        };
      }
      return s;
    });

    setPlan({ ...plan, schedule: nextSessions });
  }

  const [isUpdatingConfidence, setIsUpdatingConfidence] = useState(false);

  async function handleConfidenceChange(topicId: string, newConfidence: number) {
    if (!plan || !userId || isUpdatingConfidence) return;
    setIsUpdatingConfidence(true);
    
    try {
      const supabase = createClient();
      
      const { error: confError } = await updateTopicConfidence(supabase, topicId, newConfidence);
      if (confError) {
        alert("Failed to update topic confidence.");
        return;
      }

      const nextTopics = plan.topics.map((t) =>
        t.id === topicId ? { ...t, confidence: newConfidence } : t,
      );
      
      const nextSchedule = generateSchedule(nextTopics, plan.daily_available_minutes);
      
      const { error: schedError } = await saveNewSchedule(supabase, userId, nextSchedule);
      if (schedError) {
        alert("Failed to save new schedule.");
        return;
      }

      setPlan({ ...plan, topics: nextTopics, schedule: nextSchedule });
    } finally {
      setIsUpdatingConfidence(false);
    }
  }

  const todaySessions = useMemo(() => {
    return plan?.schedule.filter((s) => s.scheduled_day === "Today") ?? [];
  }, [plan]);

  const upcomingSessions = useMemo(() => {
    return plan?.schedule.filter((s) => s.scheduled_day !== "Today") ?? [];
  }, [plan]);

  const missedCount = useMemo(() => {
    return plan?.schedule.filter((s) => s.missed).length ?? 0;
  }, [plan]);

  const progressPercent = useMemo(() => {
    if (!plan || plan.schedule.length === 0) return 0;
    const completed = plan.schedule.filter((s) => s.completed).length;
    return Math.round((completed / plan.schedule.length) * 100);
  }, [plan]);

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center animate-in zoom-in-95">
        <div className="rounded-full bg-red-500/10 p-6">
          <CalendarClock className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">Planner Unavailable</h2>
        <p className="max-w-md text-sm text-muted">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse" />;
  }

  if (!plan) {
    return (
      <>
        <CreatePlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            loadPlan();
          }}
        />
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-accent/10 p-6">
            <BookOpen className="h-12 w-12 text-accent" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Create your first study plan</h2>
          <p className="max-w-md text-sm text-muted">
            Add an exam and its topics to generate a deterministic daily study schedule.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background"
          >
            Create Plan
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePlanModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setPlan(null); // trigger skeleton loader briefly
          loadPlan();
        }}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Adaptive Study Planner</h1>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent border border-accent/20 shadow-inner">
              Deterministic Scheduler
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-muted">
            Algorithmically prioritized day-by-day plan targeting your lowest confidence topics first.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/recovery"
            className="inline-flex items-center gap-2 rounded-xl border border-warning/40 bg-surface-2 px-5 py-3 text-sm font-bold text-warning shadow-lg hover:scale-[1.02] hover:bg-warning/10 hover:shadow-warning/20 transition-all"
          >
            <RefreshCcw className="h-5 w-5" />
            <span className="hidden sm:inline">Recovery Mode</span>
            {missedCount > 0 && (
              <span className="rounded-full bg-warning px-2 py-0.5 text-[10px] font-black text-black">
                {missedCount} missed
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background shadow-lg hover:scale-[1.02] hover:bg-foreground/90 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Exam Overview Card */}
      <div className="rounded-[2rem] border border-border-subtle bg-gradient-to-r from-surface via-surface-2/50 to-surface p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-2 block">
              Target Exam
            </span>
            <h2 className="text-3xl font-black text-foreground">{plan.subject}</h2>
            <div className="flex items-center gap-3 mt-3 text-xs font-bold text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-accent" />
                Exam: {plan.exam_date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-warning" />
                5 days remaining
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted" />
                {plan.daily_available_minutes} min/day capacity
              </span>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-foreground uppercase tracking-wider">Syllabus Completion</span>
              <span className="text-accent">{progressPercent}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-2 overflow-hidden border border-border-subtle shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-accent to-success transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted block text-right">
              {plan.schedule.filter((s) => s.completed).length} of {plan.schedule.length} sessions completed
            </span>
          </div>
        </div>
      </div>

      {/* Missed sessions recovery banner if student missed something */}
      {missedCount > 0 && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
            <div>
              <p className="text-sm font-black text-warning tracking-tight">
                You fell behind by {missedCount} session{missedCount > 1 ? "s" : ""}.
              </p>
              <p className="text-xs font-medium text-foreground mt-0.5 leading-relaxed">
                Don't panic! Recovery Mode can rebalance your remaining hours so you stay on track.
              </p>
            </div>
          </div>
          <Link
            href="/recovery"
            className="rounded-xl bg-warning px-5 py-2.5 text-xs font-bold text-black hover:bg-warning/90 transition-all shadow-md hover:scale-[1.02] shrink-0"
          >
            Rebalance Plan
          </Link>
        </div>
      )}

      {/* Main Grid: Daily Plan on Left, Syllabus Topics Confidence on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Today's Plan & Upcoming */}
        <div className="space-y-5">
          <section className="rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground flex items-center gap-2 tracking-tight">
                  <Flame className="h-5 w-5 text-accent" />
                  Today's Study Plan
                </h3>
                <p className="text-sm font-medium text-muted mt-1">
                  Focus on these high-priority blocks today ({plan.daily_available_minutes} min total)
                </p>
              </div>
            </div>

            {todaySessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-subtle bg-surface/50 p-8 text-center text-sm font-bold text-muted shadow-inner">
                No sessions scheduled for today. You are fully caught up!
              </div>
            ) : (
              <ul className="space-y-4">
                {todaySessions.map((session) => {
                  const isDone = session.completed;
                  const isMissed = session.missed;

                  return (
                    <li
                      key={session.id}
                      className={`group rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        isDone
                          ? "border-success/30 bg-success/5 opacity-75"
                          : isMissed
                            ? "border-danger/30 bg-danger/5"
                            : "border-border-subtle bg-surface-2/60 hover:border-accent/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <span
                            className={`text-lg font-bold tracking-tight block ${
                              isDone ? "line-through text-muted" : "text-foreground group-hover:text-accent transition-colors"
                            }`}
                          >
                            {session.topic_name}
                          </span>
                          <span className="text-xs text-accent font-bold flex items-center gap-1.5 mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            {session.minutes} minutes · Priority: {session.priority_score}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSession(session.id, true)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md ${
                              isDone
                                ? "bg-surface-3 text-foreground hover:bg-surface-2"
                                : "bg-success text-white hover:bg-success/90 hover:scale-[1.02]"
                            }`}
                          >
                            {isDone ? (
                              <>
                                <Undo2 className="h-4 w-4" />
                                <span>Undo</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Done</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleSession(session.id, false)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md ${
                              isMissed
                                ? "bg-danger text-white"
                                : "bg-surface-2 text-muted hover:text-danger hover:bg-danger/10"
                            }`}
                          >
                            <XCircle className="h-4 w-4" />
                            <span>{isMissed ? "Missed" : "Miss"}</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Upcoming Schedule */}
          <section className="rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-black text-foreground tracking-tight">Upcoming Days</h3>
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border-subtle bg-surface-2/40 p-4 flex items-center justify-between transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-foreground block truncate">
                      {session.topic_name}
                    </span>
                    <span className="text-xs font-medium text-muted mt-0.5 block">{session.minutes} minutes</span>
                  </div>
                  <span className="rounded-xl bg-surface px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted border border-border-subtle shrink-0">
                    {session.scheduled_day}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Syllabus Topics & Confidence Rating */}
        <section className="rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Syllabus & Confidence Ratings</h3>
            <p className="text-sm font-medium text-muted mt-2 leading-relaxed">
              Adjust your confidence level for each topic. PULSE algorithmically re-ranks and reschedules your sessions in real time.
            </p>
          </div>

          <ul className="space-y-4">
            {plan.topics.map((topic) => {
              const priority = calculateTopicPriority(topic);
              return (
                <li
                  key={topic.id}
                  className="rounded-2xl border border-border-subtle bg-surface-2/50 p-5 space-y-4 transition-all hover:bg-surface-2 hover:border-accent/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">
                        {topic.unit}
                      </span>
                      <h4 className="text-base font-bold text-foreground leading-tight">{topic.name}</h4>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      <span className="rounded-lg bg-surface px-2.5 py-1 text-[10px] font-black text-foreground uppercase tracking-wider border border-border-subtle">
                        Diff: {topic.difficulty}
                      </span>
                      <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-black text-accent uppercase tracking-wider border border-accent/20">
                        Score: {priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border-subtle/50">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted uppercase tracking-wider">My Confidence Level:</span>
                      <span className="text-foreground">{topic.confidence}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={topic.confidence}
                      onChange={(e) =>
                        handleConfidenceChange(topic.id, parseInt(e.target.value, 10))
                      }
                      className="w-full accent-accent h-2 bg-surface rounded-full cursor-pointer appearance-none outline-none border border-border-subtle [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
