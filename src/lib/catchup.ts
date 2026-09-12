import { SupabaseClient } from "@supabase/supabase-js";

export type ClassScheduleItem = {
  id: string;
  course: string;
  time: string;
  room: string;
  professor: string;
  status: "attended" | "missed" | "unreported";
};

export type ClassRecap = {
  id: string;
  course: string;
  class_date: string;
  contributor_name: string;
  contributor_trust: string;
  topics: string[];
  summary: string;
  assignment_announced: boolean;
  assignment_details?: string;
  assignment_due_date?: string;
  important_notes?: string;
  notes_url?: string;
  confirmations: number;
  created_at: string;
};

export const INITIAL_SCHEDULE: ClassScheduleItem[] = [
  {
    id: "sch-1",
    course: "Data Structures & Algorithms",
    time: "10:00 AM – 11:30 AM",
    room: "CS Hall 201",
    professor: "Prof. Arvind Sharma",
    status: "missed",
  },
  {
    id: "sch-2",
    course: "Digital Logic Design",
    time: "12:00 PM – 01:15 PM",
    room: "EC Lab 104",
    professor: "Dr. Meenakshi Rao",
    status: "unreported",
  },
  {
    id: "sch-3",
    course: "Database Management Systems",
    time: "02:30 PM – 03:45 PM",
    room: "Tech Block Audi 1",
    professor: "Prof. K. Sundaram",
    status: "attended",
  },
];

export const INITIAL_RECAPS: ClassRecap[] = [
  {
    id: "rcp-1",
    course: "Data Structures & Algorithms",
    class_date: "2026-09-11",
    contributor_name: "Rohan V.",
    contributor_trust: "Trusted Contributor",
    topics: ["Binary Search Trees", "Inorder & Preorder Traversals", "Tree Height & Depth"],
    summary:
      "Covered BST insertions and deletion edge cases (node with 2 children replaced by in-order successor). Faculty solved 2 LeetCode-style traversal recursion patterns.",
    assignment_announced: true,
    assignment_details: "Problem Set 4: Implement BST recursive validation & Level-order zigzag traversal.",
    assignment_due_date: "Sept 15, 11:59 PM",
    important_notes: "Faculty announced: 1 tree traversal question will definitely appear on Midterm 1.",
    notes_url: "https://drive.google.com/file/d/sample-dsa-unit3/view",
    confirmations: 8,
    created_at: "Yesterday",
  },
  {
    id: "rcp-2",
    course: "Digital Logic Design",
    class_date: "2026-09-10",
    contributor_name: "Ananya K.",
    contributor_trust: "Active Contributor",
    topics: ["4-to-1 Multiplexers (MUX)", "De-multiplexers (DEMUX)", "Full Adder using MUX"],
    summary:
      "Analyzed Boolean function realization using 8:1 and 4:1 multiplexers with enable inputs. Solved practice problem for active-low strobed decoders.",
    assignment_announced: false,
    important_notes: "Lab manual experiment 5 must be completed before Friday.",
    notes_url: "https://drive.google.com/file/d/sample-dld-mux/view",
    confirmations: 6,
    created_at: "2 days ago",
  },
  {
    id: "rcp-3",
    course: "Database Management Systems",
    class_date: "2026-09-09",
    contributor_name: "Ayush G.",
    contributor_trust: "Class Reporter",
    topics: ["BCNF Decomposition", "3NF Synthesis Algorithm", "Lossless Join Property"],
    summary:
      "Went over minimal cover algorithm and tested functional dependency preservation during Boyce-Codd normal form decomposition.",
    assignment_announced: true,
    assignment_details: "Submit schema normalization worksheet questions 1-5.",
    assignment_due_date: "Sept 14, 5:00 PM",
    important_notes: "Quiz on Normalization scheduled for next Tuesday.",
    notes_url: "https://drive.google.com/file/d/sample-dbms-bcnf/view",
    confirmations: 12,
    created_at: "3 days ago",
  },
];

const SCHEDULE_STORAGE_KEY = "pulse_class_schedule";
const RECAPS_STORAGE_KEY = "pulse_class_recaps";

export function getLocalSchedule(): ClassScheduleItem[] {
  if (typeof window === "undefined") return INITIAL_SCHEDULE;
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SCHEDULE;
  } catch {
    return INITIAL_SCHEDULE;
  }
}

export function saveLocalSchedule(schedule: ClassScheduleItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
  } catch {}
}

export function getLocalRecaps(): ClassRecap[] {
  if (typeof window === "undefined") return INITIAL_RECAPS;
  try {
    const raw = localStorage.getItem(RECAPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_RECAPS;
  } catch {
    return INITIAL_RECAPS;
  }
}

export function saveLocalRecaps(recaps: ClassRecap[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECAPS_STORAGE_KEY, JSON.stringify(recaps));
  } catch {}
}

export async function fetchRecaps(supabase: SupabaseClient): Promise<ClassRecap[]> {
  const { data, error } = await supabase
    .from("class_recaps")
    .select(`
      *,
      creator:creator_id(email, user_metadata),
      confirmations:recap_confirmations(count)
    `)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    course: row.course_name,
    class_date: row.class_date,
    contributor_name: row.creator?.user_metadata?.full_name || row.creator?.email?.split('@')[0] || "Student",
    contributor_trust: "Active Contributor", // Mocked until reputation is fully mapped
    topics: row.topics || [],
    summary: row.summary,
    assignment_announced: row.assignment_announced,
    assignment_details: row.assignment_details,
    assignment_due_date: undefined, // DB doesn't store this, it's just in notes
    important_notes: row.important_notes,
    notes_url: row.notes_url,
    confirmations: row.confirmations?.[0]?.count || 0,
    created_at: new Date(row.created_at).toLocaleDateString(),
  }));
}

export async function submitRecapConfirmation(supabase: SupabaseClient, recapId: string, userId: string, isHelpful: boolean) {
  const { error } = await supabase.from("recap_confirmations").insert({
    recap_id: recapId,
    user_id: userId,
    is_helpful: isHelpful
  });
  return { error };
}

/**
 * Aggregates missed class information into actionable summaries.
 */
export function aggregateMissedKnowledge(
  schedule: ClassScheduleItem[],
  recaps: ClassRecap[],
) {
  const missedCourses = schedule
    .filter((s) => s.status === "missed")
    .map((s) => s.course);

  const relevantRecaps = recaps.filter((r) =>
    missedCourses.some((c) => r.course.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(r.course.toLowerCase())),
  );

  const allTopics = Array.from(new Set(relevantRecaps.flatMap((r) => r.topics)));
  const assignments = relevantRecaps
    .filter((r) => r.assignment_announced && r.assignment_details)
    .map((r) => ({
      course: r.course,
      details: r.assignment_details!,
      due: r.assignment_due_date,
    }));

  const urgentAnnouncements = relevantRecaps
    .filter((r) => r.important_notes)
    .map((r) => ({
      course: r.course,
      note: r.important_notes!,
    }));

  return {
    missedCoursesCount: missedCourses.length,
    missedCourses,
    relevantRecaps,
    allTopics,
    assignments,
    urgentAnnouncements,
  };
}
