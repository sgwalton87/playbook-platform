import { describe, expect, it } from "vitest";
import { buildPrivateScholarResumeDraft } from "@/lib/scholar/private-resume-draft";
import type { ScholarConsumerProjection } from "@/lib/scholar/consumer-projection";

const privateProjection: ScholarConsumerProjection = {
  schemaVersion: "sj-00/v1", scholarId: "synthetic-1", name: "Test Scholar",
  school: "Test School", disclosure: "Private owner view; not approved for external sharing",
  entries: [
    { id:"service:1", category:"service", title:"Volunteer", organization:"Food Bank",
      role:null, startDate:null, endDate:null, hours:20, verification:"unverified", source:"scholar-community" },
    { id:"award:2", category:"award", title:"Excellence Award", organization:"School",
      role:null, startDate:null, endDate:null, hours:null, verification:"verified", source:"scholar-community" },
  ],
};

describe("SJ-00 private resume selection", () => {
  it("includes only explicitly selected canonical entries and preserves evidence labeling", () => {
    const draft = buildPrivateScholarResumeDraft(privateProjection, ["service:1", "nonexistent"]);
    expect(draft.sharingStatus).toBe("private");
    expect(draft.sections.service).toMatchObject([{id:"service:1",hours:20,verification:"unverified"}]);
    expect(draft.sections.awards).toEqual([]);
    expect(draft.sections.credentials).toEqual([]);
  });
  it("defaults to zero publishable entries when the scholar selects nothing", () => {
    const draft = buildPrivateScholarResumeDraft(privateProjection, []);
    expect(Object.values(draft.sections).every(items=>items.length===0)).toBe(true);
  });
  it("rejects projections without the private owner-view boundary", () => {
    expect(() => buildPrivateScholarResumeDraft(
      {...privateProjection,disclosure:"Public" as ScholarConsumerProjection["disclosure"]}, ["service:1"]
    )).toThrow(/authorized/);
  });
});
