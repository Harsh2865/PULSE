export type DeadlineStatus =
  | "completed"
  | "overdue"
  | "due today"
  | "due soon"
  | "upcoming";

export type DeadlineLike = {
  status: string;
  due_date: string;
  due_time?: string | null;
  priority?: string;
  estimated_minutes?: number | null;
  importance?: string | null;
};

const DUE_SOON_DAYS = 3;

const STATUS_WEIGHT: Record<DeadlineStatus, number> = {
  overdue: 0,
  "due today": 1,
  "due soon": 2,
  upcoming: 3,
  completed: 9,
};

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Deterministic Priority Formula:
 * priority = urgency_score + effort_score + importance_score
 *
 * Urgency Score:
 *   - Overdue / Due Today: 3 (multiplied by 2 for critical timing)
 *   - Due in 1-2 days: 2
 *   - Due in 3-5 days: 1
 *   - > 5 days: 0
 *
 * Effort Score:
 *   - > 180 min (>3h): 3
 *   - 61-180 min (1-3h): 2
 *   - <= 60 min (<=1h): 1
 *
 * Importance Score:
 *   - High: 3
 *   - Medium: 2
 *   - Low: 1
 *
 * Mapping:
 *   - Score >= 7: "high"
 *   - Score >= 5: "medium"
 *   - Score < 5: "low"
 */
export function calculatePriority(
  days: number,
  estimatedMinutes?: number | null,
  importance?: string | null,
): "high" | "medium" | "low" {
  // Urgent override: anything overdue or due today with medium/high importance is High
  const imp = (importance ?? "medium").toLowerCase();
  const impScore = imp === "high" ? 3 : imp === "low" ? 1 : 2;

  let urgencyScore = 0;
  if (days <= 0) urgencyScore = 3;
  else if (days <= 2) urgencyScore = 2;
  else if (days <= 5) urgencyScore = 1;

  const mins = estimatedMinutes ?? 60;
  let effortScore = 1;
  if (mins > 180) effortScore = 3;
  else if (mins > 60) effortScore = 2;

  const total = urgencyScore * 2 + effortScore + impScore;

  if (total >= 7) return "high";
  if (total >= 5) return "medium";
  return "low";
}

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function daysUntil(dueDate: string, today = todayISO()): number {
  const diff = Date.parse(dueDate) - Date.parse(today);
  return Math.round(diff / 86_400_000);
}

/**
 * Deterministic status derived only from status, due date, and the
 * 3-day "due soon" window — no machine learning involved.
 */
export function deadlineStatus(
  deadline: { status: string; due_date: string },
  today = todayISO(),
): DeadlineStatus {
  if (deadline.status === "completed") return "completed";
  const days = daysUntil(deadline.due_date, today);
  if (days < 0) return "overdue";
  if (days === 0) return "due today";
  if (days <= DUE_SOON_DAYS) return "due soon";
  return "upcoming";
}

/**
 * Deterministic radar order: urgency bucket first (overdue → completed
 * last), then priority, then earliest due date/time. Explainable by design.
 */
export function compareDeadlines(
  a: DeadlineLike,
  b: DeadlineLike,
  today = todayISO(),
): number {
  const statusDiff =
    STATUS_WEIGHT[deadlineStatus(a, today)] -
    STATUS_WEIGHT[deadlineStatus(b, today)];
  if (statusDiff !== 0) return statusDiff;

  const priorityDiff =
    (PRIORITY_WEIGHT[a.priority ?? "medium"] ?? 1) -
    (PRIORITY_WEIGHT[b.priority ?? "medium"] ?? 1);
  if (priorityDiff !== 0) return priorityDiff;

  const dateDiff = Date.parse(a.due_date) - Date.parse(b.due_date);
  if (dateDiff !== 0) return dateDiff;

  const timeA = a.due_time ?? "99:99";
  const timeB = b.due_time ?? "99:99";
  return timeA.localeCompare(timeB);
}

export type DeadlineFilter = {
  status: "all" | "open" | "completed";
  type: "all" | string;
  priority: "all" | string;
};

export function filterDeadlines<T extends DeadlineLike & { type: string }>(
  deadlines: T[],
  filter: DeadlineFilter,
): T[] {
  return deadlines.filter((d) => {
    if (filter.status === "open" && d.status !== "open") return false;
    if (filter.status === "completed" && d.status !== "completed") return false;
    if (filter.type !== "all" && d.type !== filter.type) return false;
    if (filter.priority !== "all" && d.priority !== filter.priority) return false;
    return true;
  });
}

export function formatDueDate(dueDate: string): string {
  return new Date(`${dueDate}T00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const deadlineTypeLabels: Record<string, string> = {
  assignment: "Assignment",
  exam: "Exam",
  quiz: "Quiz",
  project: "Project",
  application: "Application",
  event: "Event",
  personal: "Personal",
  other: "Other",
};
