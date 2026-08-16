import { describe, expect, it } from "vitest";
import {
  buildDistrictVerificationEvidence,
  districtAuthorityReady,
} from "@/lib/district-verification/policy";

describe("District verification policy", () => {
  it("builds evidence from the District onboarding contract", () => {
    expect(buildDistrictVerificationEvidence({
      school_district: "Oakland Unified",
      school: "Oakland School for the Arts",
      official_email: "admin@district.org",
      administrator_title: "Director of College and Career Readiness",
      administrative_scope: ["District", "College and career readiness"],
    })).toMatchObject({
      schoolDistrict: "Oakland Unified",
      officialEmail: "admin@district.org",
      administratorTitle: "Director of College and Career Readiness",
      administrativeScope: ["District", "College and career readiness"],
    });
  });

  it("fails closed without required institutional evidence", () => {
    expect(() => buildDistrictVerificationEvidence({ school_district: "Oakland Unified" })).toThrow("official institutional email");
  });

  it("requires approved identity and approved administrative scope", () => {
    expect(districtAuthorityReady({ verificationStatus: "pending", hasApprovedAdministrativeScope: true })).toBe(false);
    expect(districtAuthorityReady({ verificationStatus: "approved", hasApprovedAdministrativeScope: false })).toBe(false);
    expect(districtAuthorityReady({ verificationStatus: "approved", hasApprovedAdministrativeScope: true })).toBe(true);
  });
});
