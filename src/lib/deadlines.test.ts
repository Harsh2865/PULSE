import { describe, expect, it } from "vitest";
import {
  calculatePriority,
  compareDeadlines,
  deadlineStatus,
  daysUntil,
  filterDeadlines,
} from "./deadlines";

const TODAY = "2026-09-12";

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    expect(daysUntil("2026-09-12", TODAY)).toBe(0);
  });

  it("returns negative for past dates", () => {
    expect(daysUntil("2026-09-10", TODAY)).toBe(-2);
  });
});

describe("deadlineStatus", () => {
  it("reports completed regardless of date", () => {
    expect(deadlineStatus({ status: "completed", due_date: "2026-01-01" }, TODAY)).toBe(
      "completed",
    );
  });

  it("reports overdue for past open deadlines", () => {
    expect(deadlineStatus({ status: "open", due_date: "2026-09-11" }, TODAY)).toBe(
      "overdue",
    );
  });

  it("reports due today", () => {
    expect(deadlineStatus({ status: "open", due_date: "2026-09-12" }, TODAY)).toBe(
      "due today",
    );
  });

  it("reports due soon inside the 3-day window", () => {
    expect(deadlineStatus({ status: "open", due_date: "2026-09-15" }, TODAY)).toBe(
      "due soon",
    );
  });

  it("reports upcoming beyond the 3-day window", () => {
    expect(deadlineStatus({ status: "open", due_date: "2026-09-16" }, TODAY)).toBe(
      "upcoming",
    );
  });
});

describe("compareDeadlines (radar order)", () => {
  const d = (over: Partial<Parameters<typeof compareDeadlines>[0]>) => ({
    status: "open",
    due_date: "2026-10-01",
    priority: "medium",
    ...over,
  });

  it("puts overdue before upcoming regardless of priority", () => {
    const overdue = d({ due_date: "2026-09-01", priority: "low" });
    const upcoming = d({ due_date: "2026-10-01", priority: "high" });
    expect(compareDeadlines(overdue, upcoming, TODAY)).toBeLessThan(0);
  });

  it("breaks ties inside the same day by priority", () => {
    const high = d({ due_date: "2026-09-12", priority: "high" });
    const medium = d({ due_date: "2026-09-12", priority: "medium" });
    expect(compareDeadlines(high, medium, TODAY)).toBeLessThan(0);
  });

  it("breaks same-day, same-priority ties by time", () => {
    const early = d({ due_date: "2026-09-12", due_time: "09:00" });
    const late = d({ due_date: "2026-09-12", due_time: "17:00" });
    expect(compareDeadlines(early, late, TODAY)).toBeLessThan(0);
  });

  it("sinks completed deadlines to the end", () => {
    const completed = d({ status: "completed", due_date: "2020-01-01" });
    const open = d({ due_date: "2027-01-01" });
    expect(compareDeadlines(completed, open, TODAY)).toBeGreaterThan(0);
  });
});

describe("filterDeadlines", () => {
  const rows = [
    { status: "open", due_date: "2026-09-12", type: "exam", priority: "high" },
    { status: "open", due_date: "2026-10-01", type: "assignment", priority: "low" },
    { status: "completed", due_date: "2026-08-01", type: "exam", priority: "medium" },
  ];

  it("filters by status", () => {
    const open = filterDeadlines(rows as never, { status: "open", type: "all", priority: "all" });
    expect(open).toHaveLength(2);
  });

  it("filters by type and priority together", () => {
    const both = filterDeadlines(rows as never, {
      status: "all",
      type: "exam",
      priority: "high",
    });
    expect(both).toHaveLength(1);
  });
});

describe("calculatePriority (deterministic formula)", () => {
  it("calculates high priority for urgent items due today with high importance", () => {
    // days = 0 (urgency: 3 * 2 = 6), effort = 120 (effort: 2), importance = 'high' (3) -> total 11 >= 7 -> high
    expect(calculatePriority(0, 120, "high")).toBe("high");
  });

  it("calculates high priority for overdue items with medium effort", () => {
    // days = -1 (urgency: 3 * 2 = 6), effort = 60 (effort: 1), importance = 'medium' (2) -> total 9 >= 7 -> high
    expect(calculatePriority(-1, 60, "medium")).toBe("high");
  });

  it("calculates medium priority for items due in 4 days with high effort and medium importance", () => {
    // days = 4 (urgency: 1 * 2 = 2), effort = 240 (effort: 3), importance = 'medium' (2) -> total 7 -> high
    expect(calculatePriority(4, 240, "medium")).toBe("high");
    // days = 4 (urgency: 1 * 2 = 2), effort = 60 (effort: 1), importance = 'medium' (2) -> total 5 -> medium
    expect(calculatePriority(4, 60, "medium")).toBe("medium");
  });

  it("calculates low priority for items due far in advance with low effort and importance", () => {
    // days = 10 (urgency: 0), effort = 30 (effort: 1), importance = 'low' (1) -> total 2 -> low
    expect(calculatePriority(10, 30, "low")).toBe("low");
  });
});
