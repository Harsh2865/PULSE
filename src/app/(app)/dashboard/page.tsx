import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Plus,
  RefreshCcw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { deadlineStatus } from "@/lib/deadlines";
import { SetupNotice } from "@/components/SetupNotice";

const quickActions = [
  {
    label: "Add Deadline",
    description: "Put it on the radar",
    href: "/deadlines/new",
    icon: Plus,
  },
  {
    label: "Study Planner",
    description: "Adaptive exam prep",
    href: "/planner",
    icon: BookOpen,
  },
  {
    label: "Catch Up",
    description: "What did I miss?",
    href: "/catch-up",
    icon: GraduationCap,
  },
  {
    label: "Campus Events",
    description: "Venue & time updates",
    href: "/campus",
    icon: CalendarClock,
  },
  {
    label: "Connect",
    description: "TeamUp & SkillSwap",
    href: "/connect",
    icon: Users,
  },
];

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deadlines } = await supabase
    .from("deadlines")
    .select("id, title, subject, due_date, due_time, status, priority")
    .eq("status", "open")
    .order("due_date", { ascending: true })
    .limit(5);

  const open = deadlines ?? [];
  const topDeadline = open[0];

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Hey, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here is your high-priority action runway across all 4 PULSE pillars.
        </p>
      </section>

      {/* 1. NEXT MOVE HERO BANNER */}
      <section aria-labelledby="next-move-title" className="animate-slide-up">
        <h2 id="next-move-title" className="sr-only">Your Next Move</h2>
        <div className="relative overflow-hidden rounded-3xl border border-warning/30 bg-surface p-6 sm:p-8 shadow-2xl shadow-warning/5 group hover:border-warning/50 transition-colors">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-warning/10 blur-3xl transition-opacity group-hover:bg-warning/20" />
          
          <div className="relative z-10 flex items-center gap-2 mb-4">
            <span className="rounded-full bg-danger/10 border border-danger/20 px-3 py-1 text-[10px] font-black tracking-widest text-danger flex items-center gap-1.5 uppercase">
              <Flame className="h-3.5 w-3.5 text-danger" />
              High Priority · Your Next Move
            </span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {topDeadline ? topDeadline.title : "DSA Assignment (Binary Trees)"}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-muted">
                <span className="text-foreground">
                  {topDeadline ? topDeadline.subject : "Data Structures & Algorithms"}
                </span>
                <span className="text-border-subtle">•</span>
                <span className="flex items-center gap-1.5 text-warning">
                  <Clock className="h-4 w-4" />
                  Due tomorrow · 11:59 PM
                </span>
                <span className="text-border-subtle">•</span>
                <span>Estimated: 2 hours</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/deadlines"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-warning px-6 py-3.5 text-sm font-bold text-warning-foreground shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-warning/90 hover:scale-[1.02] transition-all duration-200 text-black"
              >
                <span>Open Radar</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DO & CATCH UP CARDS (2 COLUMNS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* DO: Exam Study Plan Card */}
        <div className="group rounded-3xl border border-border-subtle bg-surface p-6 flex flex-col justify-between space-y-5 hover:border-warning/30 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-warning uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                DO · Study Plan
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-muted uppercase tracking-wider">
                5 days left
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">Digital Logic Design Exam</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              4 topics remaining in your adaptive schedule. Today's top target: K-Maps & Don't Care Conditions (45 min).
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-muted font-medium">
                <span>Prep Completion</span>
                <span className="font-bold text-foreground">78% planned</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-surface-2 overflow-hidden shadow-inner">
                <div className="h-full bg-warning w-[78%] rounded-full shadow-[0_0_10px_var(--color-warning)]" />
              </div>
            </div>
          </div>

          <Link
            href="/planner"
            className="inline-flex items-center justify-between rounded-2xl bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground hover:bg-warning hover:text-black transition-colors"
          >
            <span>Continue Daily Plan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* CATCH UP: Missed Class Recap Card */}
        <div className="group rounded-3xl border border-border-subtle bg-surface p-6 flex flex-col justify-between space-y-5 hover:border-accent/30 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                CATCH UP · Missed Class
              </span>
              <span className="rounded-full bg-danger/10 text-danger border border-danger/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                1 Class Missed
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">Data Structures & Algorithms</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              You reported missing yesterday's lecture. Classmates posted 1 confirmed recap covering Binary Trees and Inorder Traversal.
            </p>

            <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 p-3.5 text-sm font-medium text-accent flex items-start gap-3">
              <Zap className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Assignment announced: Problem Set 4 due Sept 15.</span>
            </div>
          </div>

          <Link
            href="/catch-up"
            className="inline-flex items-center justify-between rounded-2xl bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent hover:text-white transition-colors"
          >
            <span>View Verified Class Recap</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 3. CAMPUS & CONNECT CARDS (2 COLUMNS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CAMPUS EVENTS: Latest Live Update Card */}
        <div className="group rounded-3xl border border-border-subtle bg-surface p-6 flex flex-col justify-between space-y-5 hover:border-success/30 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-success uppercase tracking-widest flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" />
                CAMPUS · Live Update
              </span>
              <span className="rounded-full bg-success/10 text-success px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                91% Reliable
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">HackPulse 2026 — 36hr Hackathon</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              📍 Venue changed from Block A to Block C Auditorium. Confirmed by 8 campus peers.
            </p>

            <div className="mt-5 text-sm font-medium text-success flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Registration extended to Sept 16, 11:59 PM</span>
            </div>
          </div>

          <Link
            href="/campus"
            className="inline-flex items-center justify-between rounded-2xl bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground hover:bg-success hover:text-black transition-colors"
          >
            <span>Explore Campus Events</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* CONNECT: TeamUp Card */}
        <div className="group rounded-3xl border border-border-subtle bg-surface p-6 flex flex-col justify-between space-y-5 hover:border-info/30 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-info uppercase tracking-widest flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                CONNECT · TeamUp Match
              </span>
              <span className="rounded-full bg-info/10 text-info px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                91% Match Found
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">AI Resume Analyzer Project</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Your hackathon project is looking for a <span className="font-semibold text-foreground">UI/UX Designer</span>.
            </p>

            <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-2/60 p-3.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block text-sm">Ananya Sharma</span>
                <span className="text-xs font-medium text-muted mt-0.5 block">Figma · React · 8h/wk</span>
              </div>
              <span className="text-info font-black text-sm tracking-wide">91% MATCH</span>
            </div>
          </div>

          <Link
            href="/connect"
            className="inline-flex items-center justify-between rounded-2xl bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground hover:bg-info hover:text-black transition-colors"
          >
            <span>Review & Invite Candidate</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 4. QUICK SHORTCUTS */}
      <section aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="mb-4 text-xs font-black uppercase tracking-widest text-muted">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center sm:items-start text-center sm:text-left rounded-3xl border border-border-subtle bg-surface p-5 transition-all duration-200 hover:bg-surface-2 hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-3 rounded-2xl bg-surface-2 p-2.5 text-accent transition-colors group-hover:bg-accent/10">
                <action.icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                {action.label}
              </p>
              <p className="mt-1 text-xs font-medium text-muted hidden sm:block">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
