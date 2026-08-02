import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608010010_api_abuse_and_delivery_controls.sql",
  "utf8",
);

describe("API abuse and delivery controls", () => {
  it("persists serialized per-actor quotas behind deny-direct RLS", () => {
    expect(migration).toContain("api_quota_windows");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("API quota windows deny direct access");
    expect(migration).toContain("consume_api_quota");
  });

  it("makes communication delivery idempotent and auditable", () => {
    expect(migration).toContain("communication_delivery_attempts");
    expect(migration).toContain("unique(actor_id, purpose, command_key)");
    expect(migration).toContain("begin_communication_delivery");
    expect(migration).toContain("finish_communication_delivery");
    expect(migration).toContain("active_guardian_relationship_required");
  });

  it("requires explicit user-owned AI processing consent", () => {
    expect(migration).toContain("ai_processing_consents");
    expect(migration).toContain("Users read own AI processing consent");
    expect(migration).toContain("status <> 'granted' or granted_at is not null");
    expect(migration).toContain("ai_guidance_runs");
    expect(migration).toContain("begin_ai_guidance_run");
    expect(migration).toContain("finish_ai_guidance_run");
    expect(migration).toContain("prompt_hash");
  });
});
