import { describe, expect, it } from "vitest";
import {
  calculateTopicPriority,
  generateSchedule,
  rebalanceScheduleForRecovery,
  type SyllabusTopic,
} from "./planner";

describe("calculateTopicPriority", () => {
  it("gives higher priority to hard, high-importance topics with low confidence", () => {
    const hardTopic: SyllabusTopic = {
      id: "1",
      name: "K-Maps",
      unit: "Unit 1",
      difficulty: "high", // 3
      importance: "high", // 3 -> total weight = 6
      confidence: 20, // confidence factor = 0.8
      estimated_minutes: 60,
      completed: false,
    };
    // Expected: (3 + 3) * (1 - 0.2) = 4.8
    expect(calculateTopicPriority(hardTopic)).toBe(4.8);
  });

  it("gives lower priority to easy topics with high confidence", () => {
    const easyTopic: SyllabusTopic = {
      id: "2",
      name: "Basic Logic Gates",
      unit: "Unit 1",
      difficulty: "low", // 1
      importance: "medium", // 2 -> total weight = 3
      confidence: 90, // confidence factor = 0.1
      estimated_minutes: 30,
      completed: false,
    };
    // Expected: (1 + 2) * (1 - 0.9) = 0.3
    expect(calculateTopicPriority(easyTopic)).toBe(0.3);
  });
});

describe("generateSchedule", () => {
  it("schedules highest priority topics on Day 1 (Today)", () => {
    const topics: SyllabusTopic[] = [
      {
        id: "easy",
        name: "Easy Topic",
        unit: "U1",
        difficulty: "low",
        importance: "low",
        confidence: 90,
        estimated_minutes: 60,
        completed: false,
      },
      {
        id: "hard",
        name: "Hard Topic",
        unit: "U1",
        difficulty: "high",
        importance: "high",
        confidence: 20,
        estimated_minutes: 60,
        completed: false,
      },
    ];

    const schedule = generateSchedule(topics, 120);
    expect(schedule[0].topic_name).toBe("Hard Topic");
    expect(schedule[0].scheduled_day).toBe("Today");
  });

  it("does not exceed daily available minutes on a single day", () => {
    const topics: SyllabusTopic[] = [
      { id: "1", name: "T1", unit: "U", difficulty: "high", importance: "high", confidence: 20, estimated_minutes: 60, completed: false },
      { id: "2", name: "T2", unit: "U", difficulty: "high", importance: "high", confidence: 20, estimated_minutes: 60, completed: false },
      { id: "3", name: "T3", unit: "U", difficulty: "high", importance: "high", confidence: 20, estimated_minutes: 60, completed: false },
    ];

    const schedule = generateSchedule(topics, 120);
    const todaySessions = schedule.filter((s) => s.scheduled_day === "Today");
    const totalTodayMinutes = todaySessions.reduce((acc, s) => acc + s.minutes, 0);
    expect(totalTodayMinutes).toBeLessThanOrEqual(120);
    expect(schedule.some((s) => s.scheduled_day === "Tomorrow")).toBe(true);
  });
});

describe("rebalanceScheduleForRecovery", () => {
  it("moves missed sessions to Today in the rebalanced plan", () => {
    const topics: SyllabusTopic[] = [
      { id: "1", name: "Missed Session", unit: "U", difficulty: "high", importance: "high", confidence: 30, estimated_minutes: 45, completed: false },
      { id: "2", name: "Upcoming Session", unit: "U", difficulty: "medium", importance: "medium", confidence: 50, estimated_minutes: 45, completed: false },
    ];

    const initialSchedule = generateSchedule(topics, 120);
    // Simulate user missing the first session
    initialSchedule[0].missed = true;

    const recovery = rebalanceScheduleForRecovery(initialSchedule, 120);
    expect(recovery.newPlan[0].topic_name).toBe("Missed Session");
    expect(recovery.newPlan[0].scheduled_day).toBe("Today");
    expect(recovery.missedCount).toBeGreaterThan(0);
  });
});
