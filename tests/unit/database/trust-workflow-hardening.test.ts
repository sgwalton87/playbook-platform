import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608010002_trust_workflow_hardening.sql", "utf8");

describe("trust workflow hardening migration", () => {
  it("resolves invitation and relationship state in one locked function", () => {
    const body = migration.slice(migration.indexOf("function public.accept_support_invitation"), migration.indexOf("create table if not exists public.active_scholar_contexts"));
    expect(body).toContain("for update");
    expect(body).toContain("insert into public.support_relationships");
    expect(body).toContain("update public.support_invitations");
    expect(body.indexOf("insert into public.support_relationships")).toBeLessThan(body.indexOf("update public.support_invitations"));
  });
  it("requires explicit active Scholar context backed by an active relationship", () => {
    expect(migration).toContain("create table if not exists public.active_scholar_contexts");
    expect(migration).toContain("sr.status='active'");
  });
  it("creates a pending queue and requires a reason for atomic review", () => {
    expect(migration).toContain("create table if not exists public.evidence_verification_requests");
    expect(migration).toContain("decision_reason_required");
    expect(migration).toContain("function public.review_verification_request");
  });
  it("turns the four governed event families into deduplicated notifications", () => {
    for (const category of ["verification", "intervention", "opportunity", "milestone"]) expect(migration).toContain(`'${category}'`);
    expect(migration).toContain("trg_playbook_events_create_notifications");
    expect(migration).toContain("notifications_source_recipient_uidx");
  });
});
