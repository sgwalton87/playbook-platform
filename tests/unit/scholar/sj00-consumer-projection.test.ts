import { describe, expect, it } from "vitest";
import { buildOwnerScholarConsumerProjection } from "@/lib/scholar/consumer-projection";
import type { ScholarRecord } from "@/lib/scholar/types";

function fixture(): ScholarRecord {
  return {
    id: "scholar-1",
    identity: { fullName: "Synthetic Scholar" },
    academics: { school: "Test High School" },
    community: { experiences: [
      { id: "service-1", kind: "volunteer", name: "Food bank service",
        organization: "Community Pantry", roleTitle: "Volunteer", startDate: "2026-01-01",
        endDate: "2026-06-01", volunteerHours: 24, verified: false },
      { id: "award-1", kind: "award", name: "Academic Excellence",
        organization: "Test High School", roleTitle: null, startDate: null, endDate: null,
        volunteerHours: 0, verified: true },
      { id: "private-other", kind: "hobby", name: "Private hobby",
        organization: null, roleTitle: null, startDate: null, endDate: null,
        volunteerHours: 0, verified: false },
    ] },
    achievements: { certificates: [{ id: "cert-1", title: "First Aid" }] },
  } as unknown as ScholarRecord;
}

describe("SJ-00 owner-bound Scholar consumer projection", () => {
  it("denies missing owner identity and cross-scholar access", () => {
    expect(() => buildOwnerScholarConsumerProjection(fixture(), "")).toThrow(/authorization/);
    expect(() => buildOwnerScholarConsumerProjection(fixture(), "scholar-2")).toThrow(/authorization/);
  });
  it("preserves service hours and verification evidence without inventing certificate approval", () => {
    const p = buildOwnerScholarConsumerProjection(fixture(), "scholar-1");
    expect(p.entries).toHaveLength(3);
    expect(p.entries[0]).toMatchObject({ category: "service", hours: 24, verification: "unverified" });
    expect(p.entries[1]).toMatchObject({ category: "award", verification: "verified" });
    expect(p.entries[2]).toMatchObject({ category: "credential", verification: "unverified" });
    expect(p.entries.some((e) => e.title === "Private hobby")).toBe(false);
    expect(p.disclosure).toMatch(/not approved for external sharing/);
  });
});
