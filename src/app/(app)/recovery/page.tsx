"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import {
  fetchExamPlan,
  rebalanceScheduleForRecovery,
  saveNewSchedule,
  type ExamPlan,
  type ScheduledSession,
} from "@/lib/planner";
import { createClient } from "@/lib/supabase/client";

export default function RecoveryPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<ExamPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rebalanced, setRebalanced] = useState<{
    oldPlan: ScheduledSession[];
    newPlan: ScheduledSession[];
    missedCount: number;
  } | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const current = await fetchExamPlan(supabase, user.id);
      if (!current) {
        router.push("/planner");
        return;
      }
      setPlan(current);
      const result = rebalanceScheduleForRecovery(
        current.schedule,
        current.daily_available_minutes,
      );
      setRebalanced(result);
    }
    loadPlan();
  }, [router]);

  async function handleAcceptPlan() {
    if (!plan || !rebalanced || !userId) return;
    setAccepted(true);
    const supabase = createClient();
    await saveNewSchedule(supabase, userId, rebalanced.newPlan);
    setTimeout(() => {
      router.push("/planner");
    }, 1200);
  }

  if (!plan || !rebalanced) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Recovery Mode</h1>
          <span className="rounded-full bg-warning/15 text-warning px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-warning/20 shadow-inner">
            Rebalance Engine
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-muted">
          Life happens. Instead of marking tasks overdue, PULSE algorithmically redistributes your study load.
        </p>
      </div>

      {/* Hero Alert Card */}
      <div className="rounded-[2rem] border border-warning/40 bg-gradient-to-r from-warning/15 via-surface to-surface p-8 space-y-6 shadow-xl">
        <div className="flex items-start gap-5">
          <div className="rounded-2xl bg-warning/20 p-4 text-warning shrink-0 shadow-inner">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2 pt-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {rebalanced.missedCount > 0
                ? `You're behind by ${rebalanced.missedCount} session${rebalanced.missedCount > 1 ? "s" : ""}. Let's rebalance.`
                : "Plan rebalance ready."}
            </h2>
            <p className="text-sm font-medium text-muted leading-relaxed max-w-2xl">
              We recalculated your remaining study time before the{" "}
              <span className="font-bold text-foreground">{plan.subject}</span> exam on{" "}
              {plan.exam_date}. High-priority unmastered topics have been re-slotted into your daily{" "}
              {plan.daily_available_minutes}-minute blocks.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-warning/20">
          <Link
            href="/planner"
            className="rounded-xl px-5 py-3 text-sm font-bold text-muted hover:text-foreground transition-colors"
          >
            Keep Old Schedule
          </Link>
          <button
            type="button"
            onClick={handleAcceptPlan}
            disabled={accepted}
            className="inline-flex items-center gap-2 rounded-xl bg-warning px-6 py-3 text-sm font-bold text-black hover:bg-warning/90 shadow-lg shadow-warning/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {accepted ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>New Plan Activated!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Accept New Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison: Old Plan vs New Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old Plan */}
        <div className="rounded-3xl border border-border-subtle bg-surface p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">
                Current State
              </span>
              <h3 className="text-xl font-black text-foreground tracking-tight">Old Schedule</h3>
            </div>
            <span className="rounded-full bg-surface-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted border border-border-subtle">
              Previous Order
            </span>
          </div>

          <ul className="space-y-3">
            {rebalanced.oldPlan.slice(0, 5).map((session, i) => (
              <li
                key={i}
                className={`rounded-2xl border p-4 flex items-center justify-between text-sm ${
                  session.missed
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : session.completed
                      ? "border-border-subtle bg-surface-2/40 line-through text-muted"
                      : "border-border-subtle bg-surface-2"
                }`}
              >
                <div>
                  <span className="font-bold block">{session.topic_name}</span>
                  <span className="text-xs font-medium opacity-80">{session.minutes} min</span>
                </div>
                <span className="font-bold shrink-0">
                  {session.missed ? "⚠️ Missed" : session.scheduled_day}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* New Rebalanced Plan */}
        <div className="rounded-3xl border border-accent/40 bg-gradient-to-b from-accent/10 to-surface p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
                Optimized
              </span>
              <h3 className="text-xl font-black text-foreground tracking-tight">New Rebalanced Plan</h3>
            </div>
            <span className="rounded-full bg-accent/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent border border-accent/30 shadow-inner">
              Smart Redistribution
            </span>
          </div>

          <ul className="space-y-3">
            {rebalanced.newPlan.slice(0, 5).map((session, i) => (
              <li
                key={i}
                className="rounded-2xl border border-accent/30 bg-surface p-4 flex items-center justify-between text-sm shadow-md"
              >
                <div>
                  <span className="font-bold text-foreground block">
                    {session.topic_name}
                  </span>
                  <span className="text-xs text-accent font-bold mt-0.5 block">
                    {session.minutes} min · Priority {session.priority_score}
                  </span>
                </div>
                <span className="rounded-xl bg-surface-2 border border-border-subtle px-3 py-1.5 font-bold text-foreground shrink-0 text-xs">
                  {session.scheduled_day}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
