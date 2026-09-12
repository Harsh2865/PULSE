import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/SetupNotice";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "Profile — PULSE" };

import { Award, CalendarClock, CheckCircle2, Flame, GraduationCap, ShieldCheck, Sparkles, Star, Trophy, Users } from "lucide-react";
import { fetchUserReputation } from "@/lib/reputation";

const ICON_MAP: Record<string, any> = {
  CalendarClock,
  GraduationCap,
  Sparkles,
  Users,
  Trophy,
  Award,
  Star,
};

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, course, year, bio, reputation")
    .eq("id", user!.id)
    .single();

  if (error || !profile) {
    return (
      <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
        Couldn’t load your profile. Make sure{" "}
        <code className="font-mono">0001_init.sql</code> has been run in
        Supabase.
      </div>
    );
  }

  const reputation = await fetchUserReputation(supabase, user!.id);
  const effectiveScore = reputation.score > 0 ? reputation.score : profile.reputation;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Student Profile & Trust</h1>
        <p className="mt-2 text-sm text-muted">
          Signed in as {user!.email}
        </p>
      </div>

      {/* Trust Score & Contribution Card */}
      <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-surface p-6 sm:p-8 space-y-6 shadow-2xl shadow-accent/5">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent-hover text-white text-3xl font-black shadow-lg shadow-accent/30">
              {profile.full_name ? profile.full_name[0].toUpperCase() : "S"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  {profile.full_name || "PULSE Student"}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 border border-success/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-success">
                  <ShieldCheck className="h-4 w-4" />
                  {reputation.trust_level}
                </span>
              </div>
              <p className="text-sm font-medium text-muted mt-2">
                {profile.course || "B.Tech Computer Science"} · Year {profile.year || "2"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 rounded-2xl border border-border-subtle bg-surface-2/60 p-5 sm:min-w-[160px] shadow-inner">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1">Reputation</span>
              <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-accent to-info flex items-center justify-center gap-1.5">
                <Star className="h-7 w-7 fill-accent text-accent" />
                {effectiveScore}
              </span>
            </div>
          </div>
        </div>

        {/* Contribution Counters */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-border-subtle pt-6">
          <div className="rounded-2xl border border-border-subtle bg-surface-2/40 p-4 text-center transition-colors hover:bg-surface-2">
            <span className="text-2xl font-black text-foreground block">{reputation.events_posted}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1 block">Events Posted</span>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-2/40 p-4 text-center transition-colors hover:bg-surface-2">
            <span className="text-2xl font-black text-foreground block">{reputation.recaps_submitted}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1 block">Class Recaps</span>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-2/40 p-4 text-center transition-colors hover:bg-surface-2">
            <span className="text-2xl font-black text-foreground block">{reputation.students_helped}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1 block">Students Helped</span>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-2/40 p-4 text-center transition-colors hover:bg-surface-2">
            <span className="text-2xl font-black text-foreground block">{reputation.skill_sessions}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1 block">Skill Sessions</span>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-2/40 p-4 text-center col-span-2 sm:col-span-1 transition-colors hover:bg-surface-2">
            <span className="text-2xl font-black text-foreground block">{reputation.confirmations_given}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1 block">Confirmations</span>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span>Earned Badges & Milestones</span>
            </h3>
            <p className="text-xs text-muted">
              Badges unlock automatically when your verified contributions help campus peers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reputation.badges.map((badge) => {
            const pct = Math.min(
              100,
              Math.round((badge.current_progress / badge.required_progress) * 100),
            );

            const BadgeIcon = ICON_MAP[badge.icon] || Star;

            return (
              <div
                key={badge.id}
                className={`group relative overflow-hidden rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition-all duration-300 ${
                  badge.unlocked
                    ? "border-success/30 bg-surface hover:border-success/50 hover:shadow-lg hover:shadow-success/5"
                    : "border-border-subtle bg-surface-2/30 opacity-70 hover:opacity-100"
                }`}
              >
                {badge.unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
                )}

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <BadgeIcon className="h-6 w-6 text-foreground" />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        badge.unlocked
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-surface-3 text-muted border border-border-subtle"
                      }`}
                    >
                      {badge.unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold tracking-tight text-foreground">{badge.name}</h4>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">{badge.description}</p>
                </div>

                <div className="relative z-10 space-y-2 border-t border-border-subtle pt-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted">Progress</span>
                    <span className={badge.unlocked ? "text-success font-bold" : "text-foreground"}>
                      {badge.current_progress} / {badge.required_progress}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        badge.unlocked ? "bg-success shadow-[0_0_8px_var(--color-success)]" : "bg-accent/50"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Profile Edit Form */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Edit Profile Information</h3>
          <p className="text-xs text-muted">
            Update your program, year, and bio so teammates can find you.
          </p>
        </div>

        <ProfileForm
          initial={{
            fullName: profile.full_name ?? "",
            course: profile.course ?? "",
            year: profile.year?.toString() ?? "",
            bio: profile.bio ?? "",
          }}
        />
      </section>
    </div>
  );
}
