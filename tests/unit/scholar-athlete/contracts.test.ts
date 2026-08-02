import { describe, expect, it } from "vitest";
import {
  parseAthleteProfileCommand,
  parseNILDealCommand,
  parseNILProfileCommand,
  parseRecruitingTargetCommand,
} from "@/lib/scholar-athlete/contracts";

describe("Scholar-Athlete command contracts", () => {
  it("normalizes a bounded athlete-owned profile", () => {
    const result = parseAthleteProfileCommand({
      sport: " Basketball ", position: "Guard", graduationYear: "2028",
      athleteLevel: "high_school", governingPath: "ncaa_d1",
      teams: ["Varsity", "Varsity"], leagues: ["Metro"], awards: [],
      leadershipExperience: ["Captain"], visibility: "recruiting",
      highlightUrl: "https://media.example/highlight",
    });
    expect(result).toEqual(expect.objectContaining({ ok: true }));
    if (result.ok) {
      expect(result.value.sport).toBe("Basketball");
      expect(result.value.teams).toEqual(["Varsity"]);
    }
  });

  it("rejects insecure media and invalid recruiting contacts", () => {
    expect(parseAthleteProfileCommand({
      sport: "Soccer", graduationYear: 2027, highlightUrl: "http://media.example/video",
    })).toEqual(expect.objectContaining({ ok: false }));
    expect(parseRecruitingTargetCommand({
      schoolName: "Example University", coachEmail: "not-an-email", stage: "researching",
    })).toEqual(expect.objectContaining({ ok: false }));
  });

  it("bounds NIL money tracking without representing guaranteed earnings", () => {
    const result = parseNILDealCommand({
      brandName: "Community Brand", opportunityTitle: "Clinic appearance",
      opportunityType: "clinic", compensationType: "cash", compensationAmount: "250",
    });
    expect(result).toEqual(expect.objectContaining({ ok: true }));
    expect(parseNILDealCommand({
      brandName: "Brand", opportunityTitle: "Offer", compensationAmount: -1,
    })).toEqual(expect.objectContaining({ ok: false }));
  });

  it("requires explicit consent for marketplace discovery", () => {
    expect(parseNILProfileCommand({
      athleteProfileId: "profile-id", visibility: "marketplace", discoverable: true,
      marketplaceConsent: false,
    })).toEqual(expect.objectContaining({ ok: false }));
    expect(parseNILProfileCommand({
      athleteProfileId: "profile-id", visibility: "marketplace", discoverable: true,
      marketplaceConsent: true, brandValues: ["Leadership"], brandCategories: ["Wellness"],
    })).toEqual(expect.objectContaining({ ok: true }));
  });
});
