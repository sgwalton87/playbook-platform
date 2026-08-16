import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608160031_verification_reviewer_authority.sql", "utf8");
const api = readFileSync("app/api/admin/verification/route.ts", "utf8");
const admin = readFileSync("app/admin/page.tsx", "utf8");
const familyGate = readFileSync("components/role-os/RoleAuthorityGate.tsx", "utf8");

const activationRoutes = [
  ["app/coach-os/page.tsx", "requiredRelationship=\"coach\""],
  ["app/educator-os/page.tsx", "requiredRelationship=\"educator\""],
  ["app/counselor-os/page.tsx", "requiredRelationship=\"counselor\""],
  ["app/community-partner-os/page.tsx", "requiredRelationship=\"community_partner\""],
  ["app/district-os/page.tsx", "verificationEndpoint=\"/api/district-verification\""],
  ["app/recruiting-os/page.tsx", "verificationEndpoint=\"/api/recruiting-verification\""],
  ["app/admissions-os/page.tsx", "verificationEndpoint=\"/api/admissions-verification\""],
  ["app/employer-os/page.tsx", "verificationEndpoint=\"/api/employer-verification\""],
] as const;

describe("verification review authority", () => {
  it("uses a narrow DB-backed reviewer contract with audit history and self-review denial", () => {
    expect(migration).toContain("current_user_is_verification_reviewer");
    expect(migration).toContain("verification_review_events");
    expect(migration).toContain("reviewers cannot approve their own verification request");
    expect(migration).toContain("set search_path = ''");
    expect(migration).not.toContain("execute format");
  });

  it("keeps review API request-bound and avoids service-role authority", () => {
    expect(api).toContain("requireUser");
    expect(api).toContain('rpc("get_verification_review_queue")');
    expect(api).toContain('rpc("review_verification_request"');
    expect(api).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(api).not.toContain("createClient(");
  });

  it("replaces broad legacy admin profile reads with the governed review center", () => {
    expect(admin).toContain("Verification Review Center");
    expect(admin).toContain("/api/admin/verification");
    expect(admin).not.toContain('.from("profiles").select("*")');
  });

  it("activates approved role dashboards only through their existing relationship/scope contracts", () => {
    for (const [path, expected] of activationRoutes) {
      const source = readFileSync(path, "utf8");
      expect(source).toContain("VerifiedRoleActivationBridge");
      expect(source).toContain(expected);
    }
    expect(familyGate).toContain('role === "family" && relationships.includes("parent_guardian")');
  });
});
