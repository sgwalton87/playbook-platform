import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const preflight = fs.readFileSync(
  path.join(process.cwd(), "supabase/tests/relationship_authority_preflight.sql"),
  "utf8"
);

describe("relationship authority certification preflight", () => {
  it("checks every required verification and relationship table", () => {
    for (const table of [
      "support_relationships",
      "support_invitations",
      "mentor_validation_requests",
      "mentor_validation_approvals",
      "coach_verification_requests",
      "educator_verification_requests",
      "counselor_verification_requests",
      "district_verification_requests",
      "recruiting_verification_requests",
      "admissions_verification_requests",
      "employer_verification_requests",
      "brand_partner_verification_requests",
      "community_partner_verification_requests",
      "athlete_abroad_readiness_reviews",
      "relationship_security_events",
    ]) {
      expect(preflight).toContain(`('${table}')`);
    }
  });

  it("checks the core relationship workflow functions", () => {
    expect(preflight).toContain("public.claim_support_invitation(text,text)");
    expect(preflight).toContain("public.approve_mentor_validation(uuid)");
    expect(preflight).toContain("public.finalize_mentor_validation(uuid)");
    expect(preflight).toContain("public.revoke_support_relationship(uuid,text)");
  });

  it("requires the observability helper to live outside public", () => {
    expect(preflight).toContain("private.capture_relationship_security_event()");
    expect(preflight).toContain("public.capture_relationship_security_event()");
    expect(preflight).toContain("must not exist in public");
  });

  it("is explicitly non-persistent", () => {
    expect(preflight.trimStart().startsWith("-- Read-only")).toBe(true);
    expect(preflight).toContain("begin;");
    expect(preflight.trimEnd().endsWith("rollback;")).toBe(true);
  });
});
