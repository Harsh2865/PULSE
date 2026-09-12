import { describe, expect, it } from "vitest";
import { calculateTeamMatchScore, type StudentCandidate } from "./connect";

describe("calculateTeamMatchScore (deterministic matching)", () => {
  const ananya: StudentCandidate = {
    id: "1",
    name: "Ananya",
    course: "B.Tech CSE",
    year: 3,
    skills: ["UI/UX", "Figma", "React"],
    interests: ["Hackathons", "Web Dev"],
    available_hours_per_week: 8,
    reputation: 840,
  };

  it("calculates high match for candidates with exact needed skill and high availability", () => {
    // Skill: 50 (UI/UX matches) + Availability: (8/10)*30 = 24 + Interest: 2*10 = 20 -> Total 94
    const score = calculateTeamMatchScore("UI/UX Designer", ananya, ["Hackathons", "Web Dev"]);
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("calculates lower score when skills and interests have minimal overlap", () => {
    const score = calculateTeamMatchScore("Embedded Rust", ananya, ["Hardware", "Robotics"]);
    expect(score).toBeLessThan(60);
  });
});
