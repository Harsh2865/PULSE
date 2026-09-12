export type TopicDifficulty = "low" | "medium" | "high";
export type TopicImportance = "low" | "medium" | "high";

export type SyllabusTopic = {
  id: string;
  name: string;
  unit: string;
  difficulty: TopicDifficulty;
  importance: TopicImportance;
  confidence: number; // 0 to 100
  estimated_minutes: number;
  completed: boolean;
};

export type ScheduledSession = {
  id: string;
  topic_id: string;
  topic_name: string;
  scheduled_day: string; // e.g. "Today", "Tomorrow", "Day 3"
  minutes: number;
  completed: boolean;
  missed: boolean;
  priority_score: number;
};

export type ExamPlan = {
  id: string;
  subject: string;
  exam_date: string;
  daily_available_minutes: number;
  topics: SyllabusTopic[];
  schedule: ScheduledSession[];
};

const WEIGHT_MAP: Record<TopicDifficulty, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Deterministic Topic Priority Formula:
 * priority = (difficulty_weight + importance_weight) * (1 - confidence / 100)
 * Higher priority topics get scheduled first.
 */
export function calculateTopicPriority(topic: SyllabusTopic): number {
  const diffWeight = WEIGHT_MAP[topic.difficulty];
  const impWeight = WEIGHT_MAP[topic.importance];
  const confidenceFactor = 1 - Math.min(100, Math.max(0, topic.confidence)) / 100;
  return Number(((diffWeight + impWeight) * confidenceFactor).toFixed(2));
}

/**
 * Generates a day-by-day study schedule fitting topics into daily available time slots.
 */
export function generateSchedule(
  topics: SyllabusTopic[],
  dailyAvailableMinutes = 120,
): ScheduledSession[] {
  // Sort incomplete topics by deterministic priority descending
  const sorted = [...topics]
    .filter((t) => !t.completed)
    .sort((a, b) => calculateTopicPriority(b) - calculateTopicPriority(a));

  const sessions: ScheduledSession[] = [];
  let currentDayIndex = 0;
  let currentDayAllocated = 0;
  const dayNames = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];

  for (const topic of sorted) {
    const dayLabel = dayNames[currentDayIndex] || `Day ${currentDayIndex + 1}`;

    if (currentDayAllocated + topic.estimated_minutes > dailyAvailableMinutes && currentDayAllocated > 0) {
      currentDayIndex++;
      currentDayAllocated = 0;
    }

    const assignedDay = dayNames[currentDayIndex] || `Day ${currentDayIndex + 1}`;
    sessions.push({
      id: `ses-${topic.id}-${sessions.length}`,
      topic_id: topic.id,
      topic_name: topic.name,
      scheduled_day: assignedDay,
      minutes: topic.estimated_minutes,
      completed: false,
      missed: false,
      priority_score: calculateTopicPriority(topic),
    });

    currentDayAllocated += topic.estimated_minutes;
  }

  return sessions;
}

/**
 * Recovery Mode Algorithm:
 * Takes missed sessions from previous days and remaining incomplete sessions,
 * compresses/rebalances them across remaining days, prioritizing critical unmastered topics.
 */
export function rebalanceScheduleForRecovery(
  currentSessions: ScheduledSession[],
  dailyAvailableMinutes = 120,
): {
  oldPlan: ScheduledSession[];
  newPlan: ScheduledSession[];
  missedCount: number;
} {
  const missed = currentSessions.filter((s) => s.missed || (s.scheduled_day === "Today" && !s.completed));
  const remainingIncomplete = currentSessions.filter((s) => !s.completed);

  // In new plan, missed topics move to front of queue with high priority
  const reordered = [...remainingIncomplete].sort((a, b) => {
    if (a.missed && !b.missed) return -1;
    if (!a.missed && b.missed) return 1;
    return b.priority_score - a.priority_score;
  });

  const dayNames = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];
  let dayIdx = 0;
  let dayMins = 0;

  const newPlan: ScheduledSession[] = reordered.map((session, idx) => {
    if (dayMins + session.minutes > dailyAvailableMinutes && dayMins > 0) {
      dayIdx++;
      dayMins = 0;
    }
    const dayLabel = dayNames[dayIdx] || `Day ${dayIdx + 1}`;
    dayMins += session.minutes;

    return {
      ...session,
      id: `recov-${session.topic_id}-${idx}`,
      scheduled_day: dayLabel,
      missed: false,
    };
  });

  return {
    oldPlan: currentSessions,
    newPlan,
    missedCount: missed.length,
  };
}

import { SupabaseClient } from "@supabase/supabase-js";

// ... existing types and logic above this replacement ...

export async function fetchExamPlan(supabase: SupabaseClient, userId: string): Promise<ExamPlan | null> {
  // Fetch the most recently created exam for this user
  const { data: exams, error: examErr } = await supabase
    .from("exams")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (examErr || !exams || exams.length === 0) return null;
  const exam = exams[0];

  // Fetch topics belonging to this specific exam
  const { data: topicsData, error: topicsErr } = await supabase
    .from("syllabus_topics")
    .select("*")
    .eq("exam_id", exam.id);

  if (topicsErr) return null;

  // Map to frontend types
  const topics: SyllabusTopic[] = topicsData.map((t: any) => ({
    id: t.id,
    name: t.name,
    unit: "Unit", // We don't store unit in DB yet, mock it
    difficulty: t.difficulty,
    importance: t.importance,
    confidence: t.confidence,
    estimated_minutes: t.estimated_minutes,
    completed: t.completed,
  }));

  // Build a set of topic IDs belonging to this exam for efficient lookup
  const examTopicIds = new Set(topics.map(t => t.id));

  // Fetch sessions and filter to only those referencing this exam's topics
  const { data: sessionsData, error: sessionsErr } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId);

  if (sessionsErr) return null;

  const schedule: ScheduledSession[] = sessionsData
    .filter((s: any) => examTopicIds.has(s.topic_id))
    .map((s: any) => {
      const topic = topics.find(t => t.id === s.topic_id)!;
      // Approximate scheduled_day based on date diff
      const dayLabel = calculateDayLabel(s.scheduled_date);
      return {
        id: s.id,
        topic_id: s.topic_id,
        topic_name: topic.name,
        scheduled_day: dayLabel,
        minutes: s.planned_minutes,
        completed: s.completed,
        missed: s.missed,
        priority_score: calculateTopicPriority(topic),
      };
    });

  return {
    id: exam.id,
    subject: exam.subject,
    exam_date: exam.exam_date,
    daily_available_minutes: exam.daily_available_minutes,
    topics,
    schedule: schedule.sort((a, b) => a.scheduled_day.localeCompare(b.scheduled_day) || b.priority_score - a.priority_score),
  };
}

function calculateDayLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "Past";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `Day ${diffDays + 1}`;
}

export async function createNewExamPlan(
  supabase: SupabaseClient,
  userId: string,
  subject: string,
  examDateStr: string,
  dailyAvailableMinutes: number,
  topicsInput: Omit<SyllabusTopic, "id" | "unit" | "completed">[]
) {
  // Insert Exam
  const { data: examData, error: examErr } = await supabase
    .from("exams")
    .insert({
      user_id: userId,
      subject,
      exam_date: examDateStr,
      daily_available_minutes: dailyAvailableMinutes
    })
    .select()
    .single();

  if (examErr || !examData) return null;

  // Insert Topics
  const topicPayloads = topicsInput.map(t => ({
    exam_id: examData.id,
    name: t.name,
    difficulty: t.difficulty,
    importance: t.importance,
    confidence: t.confidence,
    estimated_minutes: t.estimated_minutes,
    completed: false
  }));

  const { data: newTopics } = await supabase
    .from("syllabus_topics")
    .insert(topicPayloads)
    .select();

  if (!newTopics) return null;

  // Map input topics with new DB IDs to generate schedule
  const mappedTopics = topicsInput.map((t, i) => ({
    ...t,
    id: newTopics[i].id,
    unit: "Unit", // default/mock
    completed: false
  }));

  const initialSchedule = generateSchedule(mappedTopics, dailyAvailableMinutes);

  // Insert Sessions
  const today = new Date();
  const sessionPayloads = initialSchedule.map(s => {
    let dayOffset = 0;
    if (s.scheduled_day === "Tomorrow") dayOffset = 1;
    else if (s.scheduled_day.startsWith("Day ")) dayOffset = parseInt(s.scheduled_day.replace("Day ", "")) - 1;
    
    const schedDate = new Date(today);
    schedDate.setDate(schedDate.getDate() + dayOffset);

    return {
      user_id: userId,
      topic_id: s.topic_id,
      scheduled_date: schedDate.toISOString().slice(0, 10),
      planned_minutes: s.minutes,
      completed: s.completed,
      missed: s.missed
    };
  });

  await supabase.from("study_sessions").insert(sessionPayloads);

  return fetchExamPlan(supabase, userId);
}

export async function updateSessionStatus(supabase: SupabaseClient, sessionId: string, updates: { completed: boolean, missed: boolean }) {
  return supabase.from("study_sessions").update(updates).eq("id", sessionId);
}

export async function updateTopicConfidence(supabase: SupabaseClient, topicId: string, confidence: number) {
  return supabase.from("syllabus_topics").update({ confidence }).eq("id", topicId);
}

export async function saveNewSchedule(supabase: SupabaseClient, userId: string, newSchedule: ScheduledSession[]) {
  // Since rescheduling completely rewrites sessions, delete uncompleted ones and re-insert
  await supabase.from("study_sessions")
    .delete()
    .eq("user_id", userId)
    .eq("completed", false);

  const today = new Date();
  const sessionPayloads = newSchedule.filter(s => !s.completed).map(s => {
    let dayOffset = 0;
    if (s.scheduled_day === "Tomorrow") dayOffset = 1;
    else if (s.scheduled_day.startsWith("Day ")) dayOffset = parseInt(s.scheduled_day.replace("Day ", "")) - 1;
    
    const schedDate = new Date(today);
    schedDate.setDate(schedDate.getDate() + dayOffset);

    return {
      user_id: userId,
      topic_id: s.topic_id,
      scheduled_date: schedDate.toISOString().slice(0, 10),
      planned_minutes: s.minutes,
      completed: s.completed,
      missed: s.missed
    };
  });

  const { data, error } = await supabase.from("study_sessions").insert(sessionPayloads);
  return { data, error };
}
