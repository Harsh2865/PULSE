export type Project = {
  id: string;
  name: string;
  description: string;
  project_type: "Hackathon" | "Course Project" | "Startup" | "Open Source" | "Study Group";
  current_members: number;
  total_needed: number;
  needed_roles: string[];
  created_by: string;
  requests_sent: string[];
};

export type StudentCandidate = {
  id: string;
  name: string;
  avatar_url?: string;
  course: string;
  year: number;
  skills: string[];
  interests: string[];
  available_hours_per_week: number;
  reputation: number;
};

export type SkillSwapMatch = {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_trust: string;
  they_teach: string;
  they_learn: string;
  match_percentage: number;
  status: "idle" | "requested" | "scheduled" | "completed";
  rating?: number;
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "AI Resume & Portfolio Analyzer",
    description: "Building an automated portfolio optimizer with multi-agent critique for campus placement drives.",
    project_type: "Hackathon",
    current_members: 3,
    total_needed: 4,
    needed_roles: ["UI/UX Designer"],
    created_by: "You",
    requests_sent: [],
  },
  {
    id: "proj-2",
    name: "Campus Roommate & Housing Finder",
    description: "Decentralized verified listing board for students searching for nearby flats and flatmates.",
    project_type: "Startup",
    current_members: 2,
    total_needed: 4,
    needed_roles: ["Backend Developer (Node/Go)", "Product Marketer"],
    created_by: "Kabir S.",
    requests_sent: [],
  },
  {
    id: "proj-3",
    name: "Autonomous Quadcopter Obstacle Avoidance",
    description: "ROS2 & OpenCV computer vision pipeline for indoor drone navigation testbed.",
    project_type: "Course Project",
    current_members: 2,
    total_needed: 3,
    needed_roles: ["Embedded C++ / ROS2"],
    created_by: "Pooja D.",
    requests_sent: [],
  },
];

export const CANDIDATES: StudentCandidate[] = [
  {
    id: "cand-1",
    name: "Ananya Sharma",
    course: "B.Tech CSE",
    year: 3,
    skills: ["UI/UX", "Figma", "React", "Design Systems"],
    interests: ["Hackathons", "Design", "Web Dev"],
    available_hours_per_week: 8,
    reputation: 840,
  },
  {
    id: "cand-2",
    name: "Rohan Verma",
    course: "B.Tech CSE",
    year: 2,
    skills: ["Figma", "Illustrator", "Prototyping"],
    interests: ["UI Design", "Mobile Apps"],
    available_hours_per_week: 6,
    reputation: 720,
  },
  {
    id: "cand-3",
    name: "Siddharth Nair",
    course: "B.Tech IT",
    year: 3,
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    interests: ["Backend", "Cloud Architecture"],
    available_hours_per_week: 10,
    reputation: 910,
  },
  {
    id: "cand-4",
    name: "Priya Menon",
    course: "B.Tech AI & Data",
    year: 2,
    skills: ["Python", "PyTorch", "Data Analysis", "Computer Vision"],
    interests: ["AI Research", "Robotics"],
    available_hours_per_week: 7,
    reputation: 680,
  },
];

export const INITIAL_SWAPS: SkillSwapMatch[] = [
  {
    id: "swap-1",
    partner_id: "swp-p1",
    partner_name: "Rohan V.",
    partner_trust: "Trusted Contributor",
    they_teach: "Python & Data Structures",
    they_learn: "React & Tailwind CSS",
    match_percentage: 94,
    status: "idle",
  },
  {
    id: "swap-2",
    partner_id: "swp-p2",
    partner_name: "Priya M.",
    partner_trust: "Skill Mentor",
    they_teach: "Video Editing (Premiere / DaVinci)",
    they_learn: "Figma UI Prototyping",
    match_percentage: 88,
    status: "idle",
  },
  {
    id: "swap-3",
    partner_id: "swp-p3",
    partner_name: "Aditya S.",
    partner_trust: "Active Contributor",
    they_teach: "System Design & Docker",
    they_learn: "Java Spring Boot",
    match_percentage: 81,
    status: "completed",
    rating: 5,
  },
];

/**
 * Deterministic Team Matching Score:
 * Skill Overlap: 50%
 * Availability Factor: 30% (target: >= 6 hrs/week)
 * Interests Overlap: 20%
 */
export function calculateTeamMatchScore(
  neededSkill: string,
  candidate: StudentCandidate,
  projectInterests: string[] = ["Hackathons", "Web Dev"],
): number {
  const normNeeded = neededSkill.toLowerCase();
  const hasDirectSkill = candidate.skills.some((s) => s.toLowerCase().includes(normNeeded) || normNeeded.includes(s.toLowerCase()));
  const skillScore = hasDirectSkill ? 50 : 20;

  const availabilityScore = Math.min(30, (candidate.available_hours_per_week / 10) * 30);

  const sharedInterests = candidate.interests.filter((i) =>
    projectInterests.some((pi) => pi.toLowerCase() === i.toLowerCase()),
  );
  const interestScore = Math.min(20, sharedInterests.length * 10);

  return Math.round(skillScore + availabilityScore + interestScore);
}

const PROJECTS_KEY = "pulse_projects";
const SWAPS_KEY = "pulse_skill_swaps";

import { SupabaseClient } from "@supabase/supabase-js";

export function getLocalProjects(): Project[] {
  if (typeof window === "undefined") return INITIAL_PROJECTS;
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PROJECTS;
  } catch {
    return INITIAL_PROJECTS;
  }
}

export function saveLocalProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {}
}

export async function fetchProjects(supabase: SupabaseClient): Promise<Project[]> {
  // Try the full query with nested joins first
  let { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      roles:project_roles(skill, filled),
      requests:team_requests(id)
    `)
    .order("created_at", { ascending: false });

  // If nested join fails (e.g. missing RLS policies on project_roles/team_requests),
  // fall back to a simple query so projects still appear
  if (error) {
    console.warn("[PULSE] Projects nested query failed, falling back to simple query:", error.message);
    const fallback = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) {
    console.error("[PULSE] Projects query failed:", error?.message);
    return getLocalProjects();
  }

  if (data.length === 0) return [];

  // Fetch creator profiles separately (PostgREST blocks joins on auth.users)
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
      name: d.name,
      description: d.description,
      project_type: d.project_type,
      current_members: (d.roles || []).filter((r: any) => r.filled).length + 1, // +1 for creator
      total_needed: (d.roles || []).length + 1,
      needed_roles: (d.roles || []).filter((r: any) => !r.filled).map((r: any) => r.skill),
      created_by: creatorProfile?.full_name || creatorProfile?.email?.split('@')[0] || "Student",
      requests_sent: d.requests || [],
    };
  });
}

export async function createProject(supabase: SupabaseClient, userId: string, payload: { name: string, description: string, project_type: string, roles: string[] }) {
  const { data: project, error: projErr } = await supabase.from("projects").insert({
    creator_id: userId,
    name: payload.name,
    description: payload.description,
    project_type: payload.project_type
  }).select().single();

  if (projErr || !project) throw new Error("Failed to create project");

  if (payload.roles.length > 0) {
    const rolePayloads = payload.roles.map(r => ({
      project_id: project.id,
      skill: r,
      filled: false
    }));
    await supabase.from("project_roles").insert(rolePayloads);
  }
  return project.id;
}

export async function deleteProject(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error("Failed to delete project");
}

export function getLocalSwaps(): SkillSwapMatch[] {
  if (typeof window === "undefined") return INITIAL_SWAPS;
  try {
    const raw = localStorage.getItem(SWAPS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SWAPS;
  } catch {
    return INITIAL_SWAPS;
  }
}

export async function fetchSwaps(supabase: SupabaseClient): Promise<SkillSwapMatch[]> {
  let { data, error } = await supabase
    .from("skill_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[PULSE] Swaps query failed:", error?.message);
    return getLocalSwaps();
  }

  if (data.length === 0) return [];

  // Fetch profiles for teacher/learner
  const userIds = Array.from(new Set(data.flatMap((d: any) => [d.teacher_id, d.learner_id])));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  const profileMap = new Map();
  if (profiles) {
    profiles.forEach((p: any) => profileMap.set(p.id, p));
  }

  return data.map((d: any) => {
    const teacherProfile = profileMap.get(d.teacher_id);
    return {
      id: d.id,
      partner_id: d.teacher_id,
      partner_name: teacherProfile?.full_name || teacherProfile?.email?.split('@')[0] || "Student",
      partner_trust: "Verified",
      they_teach: d.skill_name,
      they_learn: "N/A", // MVP simplification
      match_percentage: 90,
      status: d.status as "idle" | "requested" | "scheduled" | "completed",
      rating: d.rating,
    };
  });
}

export function saveLocalSwaps(swaps: SkillSwapMatch[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SWAPS_KEY, JSON.stringify(swaps));
  } catch {}
}

const PROFILE_SKILLS_KEY = "pulse_profile_skills";

export type ProfileSkills = {
  teach: string[];
  learn: string[];
};

export const INITIAL_PROFILE_SKILLS: ProfileSkills = {
  teach: ["React & Next.js", "Java", "Figma Prototyping"],
  learn: ["Python & Data Science", "Video Editing", "System Design"],
};

export function getLocalProfileSkills(): ProfileSkills {
  if (typeof window === "undefined") return INITIAL_PROFILE_SKILLS;
  try {
    const raw = localStorage.getItem(PROFILE_SKILLS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PROFILE_SKILLS;
  } catch {
    return INITIAL_PROFILE_SKILLS;
  }
}

export function saveLocalProfileSkills(skills: ProfileSkills) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_SKILLS_KEY, JSON.stringify(skills));
  } catch {}
}
