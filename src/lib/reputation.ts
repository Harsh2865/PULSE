import { SupabaseClient } from "@supabase/supabase-js";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "Events" | "Academic" | "Skills" | "Collaboration" | "Champion";
  unlocked: boolean;
  current_progress: number;
  required_progress: number;
};

export type ReputationSummary = {
  score: number;
  trust_level: "New Contributor" | "Active Contributor" | "Trusted Contributor" | "Campus Champion";
  events_posted: number;
  recaps_submitted: number;
  students_helped: number;
  skill_sessions: number;
  confirmations_given: number;
  badges: Badge[];
};

export const INITIAL_REPUTATION: ReputationSummary = {
  score: 0,
  trust_level: "New Contributor",
  events_posted: 0,
  recaps_submitted: 0,
  students_helped: 0,
  skill_sessions: 0,
  confirmations_given: 0,
  badges: [],
};

const CATEGORY_MAP: Record<string, Badge["category"]> = {
  campus_scout: "Events",
  class_reporter: "Academic",
  skill_mentor: "Skills",
  team_builder: "Collaboration",
  campus_champion: "Champion"
};

export async function fetchUserReputation(supabase: SupabaseClient, userId: string): Promise<ReputationSummary> {
  const [eventsRes, badgesRes] = await Promise.all([
    supabase.from("reputation_events").select("*").eq("user_id", userId),
    supabase.from("badges").select("*")
  ]);

  if (eventsRes.error || badgesRes.error) {
    return INITIAL_REPUTATION;
  }

  const events = eventsRes.data || [];
  const dbBadges = badgesRes.data || [];

  let score = 0;
  let events_posted = 0;
  let recaps_submitted = 0;
  let students_helped = 0;
  let skill_sessions = 0;
  let confirmations_given = 0;

  for (const ev of events) {
    score += ev.points;
    const action = ev.action.toUpperCase();
    if (action === "EVENT_POSTED") events_posted++;
    else if (action === "RECAP_SUBMITTED") recaps_submitted++;
    else if (action === "SKILL_SESSION") skill_sessions++;
    else if (action === "TEAM_HELPED") students_helped++;
    else if (action === "EVENT_CONFIRMED" || action === "RECAP_HELPFUL") confirmations_given++;
  }

  const trust_level = 
    score >= 1000 ? "Campus Champion" :
    score >= 500 ? "Trusted Contributor" :
    score >= 100 ? "Active Contributor" : "New Contributor";

  const badges: Badge[] = dbBadges.map((b) => {
    let current_progress = 0;
    if (b.requirement_type === "events_posted") current_progress = events_posted;
    else if (b.requirement_type === "recaps_submitted") current_progress = recaps_submitted;
    else if (b.requirement_type === "skills_taught") current_progress = skill_sessions;
    else if (b.requirement_type === "teams_joined") current_progress = students_helped;
    else if (b.requirement_type === "reputation_score") current_progress = score;

    return {
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      category: CATEGORY_MAP[b.id] || "Academic",
      unlocked: current_progress >= b.requirement_value,
      current_progress: current_progress,
      required_progress: b.requirement_value
    };
  });

  return {
    score,
    trust_level,
    events_posted,
    recaps_submitted,
    students_helped,
    skill_sessions,
    confirmations_given,
    badges,
  };
}
