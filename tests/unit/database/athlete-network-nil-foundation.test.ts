import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608010009_athlete_network_nil_foundation.sql",
  "utf8",
);

describe("Athlete Network and NIL database foundation", () => {
  it("persists athlete identity, recruiting activity, NIL identity, deliverables, and audit state", () => {
    for (const contract of [
      "athlete_nil_profiles",
      "athlete_recruiting_activities",
      "nil_deal_deliverables",
      "nil_compliance_audit",
      "athlete_command_receipts",
    ]) expect(migration).toContain(contract);
  });

  it("enforces athlete role, ownership, marketplace consent, and minor safeguarding", () => {
    expect(migration).toContain("public.is_scholar_athlete()");
    expect(migration).toContain("marketplace_consent_at is not null");
    expect(migration).toContain("guardian_consent_at is not null");
    expect(migration).toContain("registered_brand_partner_required");
  });

  it("requires governed, idempotent NIL transitions and human compliance review", () => {
    expect(migration).toContain("governed_nil_command_required");
    expect(migration).toContain("nil_compliance_approval_required");
    expect(migration).toContain("invalid_idempotency_key");
    expect(migration).toContain("review_nil_compliance");
    expect(migration).toContain("admin_audit_log");
  });
});
