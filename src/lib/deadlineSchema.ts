import { z } from "zod";
import { calculatePriority, daysUntil } from "./deadlines";

export const DEADLINE_TYPES = [
  "assignment",
  "exam",
  "quiz",
  "project",
  "application",
  "event",
  "personal",
  "other",
] as const;

export const DEADLINE_PRIORITIES = ["auto", "high", "medium", "low"] as const;
export const IMPORTANCE_LEVELS = ["low", "medium", "high"] as const;

export type DeadlineType = (typeof DEADLINE_TYPES)[number];
export type DeadlinePriority = (typeof DEADLINE_PRIORITIES)[number];
export type ImportanceLevel = (typeof IMPORTANCE_LEVELS)[number];

export const deadlineFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the deadline a title.")
    .max(200, "Keep the title under 200 characters."),
  subject: z
    .string()
    .trim()
    .max(120, "Keep the subject under 120 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2000 characters."),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date.")
    .refine((v) => {
      const d = new Date(`${v}T00:00:00`);
      return !isNaN(d.getTime()) && v >= "2020-01-01";
    }, "Pick a valid calendar date (2020 or later)."),
  due_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Pick a valid time.")
    .or(z.literal("")),
  estimated_minutes: z.coerce
    .number()
    .min(5, "Minimum 5 minutes")
    .max(1440, "Maximum 24 hours (1440 min)"),
  importance: z.enum(IMPORTANCE_LEVELS),
  priority: z.enum(DEADLINE_PRIORITIES),
  type: z.enum(DEADLINE_TYPES),
  link: z
    .string()
    .trim()
    .max(2048)
    .refine((v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid web URL starting with http:// or https://.")
    .or(z.literal("")),
  notes: z.string().trim().max(2000, "Keep notes under 2000 characters."),
});

export type DeadlineFormValues = z.infer<typeof deadlineFormSchema>;

export const emptyDeadlineForm: DeadlineFormValues = {
  title: "",
  subject: "",
  description: "",
  due_date: "",
  due_time: "",
  estimated_minutes: 60,
  importance: "medium",
  priority: "auto",
  type: "assignment",
  link: "",
  notes: "",
};

/** Map validated form values to a Supabase row payload ("" → null). */
export function toDeadlineRow(values: DeadlineFormValues) {
  // Determine effective priority: if 'auto', use deterministic formula
  const calculated = calculatePriority(
    values.due_date ? daysUntil(values.due_date) : 5,
    values.estimated_minutes,
    values.importance,
  );
  const effectivePriority = values.priority === "auto" ? calculated : values.priority;

  return {
    title: values.title,
    subject: values.subject === "" ? "General" : values.subject,
    description: values.description === "" ? null : values.description,
    due_date: values.due_date,
    due_time: values.due_time === "" ? null : values.due_time.slice(0, 5),
    priority: effectivePriority,
    type: values.type,
    estimated_minutes: values.estimated_minutes,
    importance: values.importance,
    link: values.link === "" ? null : values.link,
    notes: values.notes === "" ? null : values.notes,
  };
}
