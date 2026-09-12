import { createClient } from "@/lib/supabase/client";

export type EventCategory =
  | "Hackathons"
  | "Clubs"
  | "Workshops"
  | "Competitions"
  | "Academic"
  | "Other";

export type EventUpdate = {
  id: string;
  update_type: "venue_change" | "time_change" | "deadline_extended" | "announcement";
  content: string;
  created_at: string;
  confirmations_count: number;
};

export type CampusEvent = {
  id: string;
  title: string;
  category: EventCategory;
  organizer: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  poster_url?: string | null;
  registration_url?: string | null;
  status: "open" | "closed" | "postponed";
  confirmations: number;
  disputes: number;
  interested_count: number;
  updates: EventUpdate[];
  created_at: string;
};

export const EVENT_CATEGORIES: Array<"All" | EventCategory> = [
  "All",
  "Hackathons",
  "Workshops",
  "Competitions",
  "Clubs",
  "Academic",
  "Other",
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: "evt-1",
    title: "HackPulse 2026 — 36hr National Hackathon",
    category: "Hackathons",
    organizer: "GCSRM Innovation Cell",
    description:
      "The flagship annual hackathon bringing together builders, designers, and problem solvers. Build real-world solutions across AI, Web3, and HealthTech.",
    event_date: "2026-09-18",
    event_time: "10:00 AM",
    location: "Block C Auditorium",
    poster_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    registration_url: "https://hackpulse2026.devpost.com",
    status: "open",
    confirmations: 14,
    disputes: 0,
    interested_count: 142,
    updates: [
      {
        id: "upd-1",
        update_type: "venue_change",
        content: "Venue changed from Block A to Block C Auditorium to accommodate more teams.",
        created_at: "2 hours ago",
        confirmations_count: 8,
      },
      {
        id: "upd-2",
        update_type: "deadline_extended",
        content: "Team registration deadline extended to Sept 16, 11:59 PM.",
        created_at: "Yesterday",
        confirmations_count: 12,
      },
    ],
    created_at: "2026-09-10T10:00:00Z",
  },
  {
    id: "evt-2",
    title: "AI & Large Language Models in Practice Workshop",
    category: "Workshops",
    organizer: "AI Student Society",
    description:
      "Hands-on workshop on fine-tuning, embeddings, and building autonomous agent pipelines with modern web apps.",
    event_date: "2026-09-15",
    event_time: "02:00 PM",
    location: "Tech Lab 4, CS Block",
    poster_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    registration_url: "https://forms.gle/ai-workshop-2026",
    status: "open",
    confirmations: 9,
    disputes: 0,
    interested_count: 86,
    updates: [
      {
        id: "upd-3",
        update_type: "announcement",
        content: "Please bring your laptops with Node.js and Python 3.11 installed.",
        created_at: "3 hours ago",
        confirmations_count: 6,
      },
    ],
    created_at: "2026-09-11T12:00:00Z",
  },
  {
    id: "evt-3",
    title: "Inter-College Algorithmic Showdown",
    category: "Competitions",
    organizer: "Coding Club",
    description:
      "Competitive programming speedrun testing graph theory, dynamic programming, and data structure speed.",
    event_date: "2026-09-20",
    event_time: "04:30 PM",
    location: "Online (Codeforces contest)",
    poster_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    registration_url: "https://codeforces.com/contest/pulse26",
    status: "open",
    confirmations: 11,
    disputes: 0,
    interested_count: 98,
    updates: [],
    created_at: "2026-09-09T15:00:00Z",
  },
  {
    id: "evt-4",
    title: "Robotics & Hardware Showcase Orientation",
    category: "Clubs",
    organizer: "Robotics Guild",
    description:
      "Introduction to drone flight controllers, Arduino automation, and open project recruitment for national competitions.",
    event_date: "2026-09-22",
    event_time: "03:00 PM",
    location: "Mechanical Workshop Ground Floor",
    poster_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    registration_url: "https://robotics-guild.club/join",
    status: "open",
    confirmations: 7,
    disputes: 0,
    interested_count: 64,
    updates: [],
    created_at: "2026-09-08T09:00:00Z",
  },
];

const STORAGE_KEY = "pulse_campus_events";

/**
 * Deterministic Event Reliability Formula:
 * Base: 50%
 * + 20% if poster is provided
 * + 5% per confirmation (capped at 30%)
 * - 15% per reported dispute
 * Min: 10%, Max: 100%
 */
export function calculateEventReliability(event: CampusEvent): number {
  let score = 50;
  if (event.poster_url && event.poster_url.trim().length > 0) {
    score += 20;
  }
  score += Math.min(30, event.confirmations * 5);
  score -= event.disputes * 15;
  return Math.max(10, Math.min(100, score));
}

export function getLocalEvents(): CampusEvent[] {
  if (typeof window === "undefined") return INITIAL_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EVENTS;
  }
}

export function saveLocalEvents(events: CampusEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export async function fetchEvents(): Promise<CampusEvent[]> {
  try {
    const supabase = createClient();

    // Try the full query with nested joins first
    let { data, error } = await supabase
      .from("events")
      .select(`
        *,
        updates:event_updates(
          id,
          update_type,
          content,
          created_at,
          confirmations:event_confirmations(count)
        )
      `)
      .order("event_date", { ascending: true });

    // If the nested join fails (e.g. missing RLS policies on event_updates),
    // fall back to a simple query so events still appear
    if (error) {
      console.warn("[PULSE] Events nested query failed, falling back to simple query:", error.message);
      const fallback = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("[PULSE] Events query failed:", error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Fetch creator profiles separately since joining on auth.users directly is blocked by PostgREST
    const creatorIds = Array.from(new Set(data.map((d: any) => d.creator_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", creatorIds);

    const profileMap = new Map();
    if (profiles) {
      profiles.forEach((p: any) => profileMap.set(p.id, p));
    }

    return data.map((d: any) => {
      const creatorProfile = profileMap.get(d.creator_id);
      return {
        id: d.id,
        title: d.title,
        category: d.category as EventCategory,
        organizer: creatorProfile?.full_name || creatorProfile?.email?.split('@')[0] || "Campus Organizer",
        description: d.description ?? "",
        event_date: d.event_date,
        event_time: d.event_time ? d.event_time.slice(0, 5) : "10:00",
        location: d.location,
        poster_url: d.poster_url,
        registration_url: d.registration_url,
        status: (d.status as "open" | "closed" | "postponed") ?? "open",
        confirmations: 5, // Mock baseline
        disputes: 0,
        interested_count: Math.floor(Math.random() * 50) + 10, // Mock for UI
        updates: (d.updates || []).map((u: any) => ({
          id: u.id,
          update_type: u.update_type,
          content: u.content,
          created_at: new Date(u.created_at).toLocaleDateString(),
          confirmations_count: u.confirmations?.[0]?.count || 0
        })),
        created_at: d.created_at,
      };
    });
  } catch (err) {
    console.error("[PULSE] fetchEvents unexpected error:", err);
    return [];
  }
}

export async function submitEventUpdateConfirmation(supabase: any, eventId: string, updateId: string, userId: string, isConfirmed: boolean) {
  return supabase.from("event_confirmations").insert({
    event_id: eventId,
    update_id: updateId,
    user_id: userId,
    is_confirmed: isConfirmed
  });
}
