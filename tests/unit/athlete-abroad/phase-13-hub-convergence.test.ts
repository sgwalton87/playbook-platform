import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/athlete-abroad-os/page.tsx", "utf8");
const readinessGate = readFileSync("components/athlete-abroad/AthleteAbroadReadinessGate.tsx", "utf8");

const requiredCapabilities = [
  "Go Abroad",
  "Living Abroad",
  "Life After Sport",
  "Global Athlete Profile",
  "Career History",
  "Country Channels",
  "Sport Channels",
  "Global Locker Room",
  "Summit Integration",
  "Summit Meetings",
  "Meetups",
  "Housing Resources",
  "Healthcare Resources",
  "Tax Resources",
  "Contract Resources",
  "Alumni Network",
] as const;

describe("Phase 13 Athlete Abroad Hub convergence", () => {
  it("exposes every canonical Phase 13 capability", () => {
    for (const capability of requiredCapabilities) expect(page).toContain(`label: \"${capability}\"`);
    expect(page).toContain("data-phase-13-capabilities={pathways.length}");
  });

  it("composes shared platform services instead of parallel Athlete Abroad systems", () => {
    for (const route of [
      "/opportunities",
      "/courses/athletes-abroad-global-hub",
      "/career",
      "/profile",
      "/transcript",
      "/connections",
      "/messages",
      "/events",
      "/support-network",
      "/financial-intelligence",
    ]) expect(page).toContain(`href: \"${route}\"`);

    expect(page).toContain("Scholar Record first");
    expect(page).toContain("Human authority");
    expect(page).not.toContain("athlete_abroad_opportunities");
    expect(page).not.toContain("athlete_abroad_messages");
    expect(page).not.toContain("athlete_abroad_events");
  });

  it("keeps jurisdiction-sensitive global workflows behind readiness authority", () => {
    expect(readinessGate).toContain('review.review_status === "approved"');
    expect(readinessGate).toContain('review.jurisdiction_scope_status === "approved"');
    expect(readinessGate).toContain("contract, tax, visa, eligibility, and jurisdiction-sensitive opportunity workflows stay locked");
  });
});
