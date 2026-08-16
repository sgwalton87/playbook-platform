import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/202608160017_support_invitation_rls_hardening.sql"),
  "utf8"
);
const preflight = fs.readFileSync(
  path.join(process.cwd(), "supabase/tests/support_invitation_authority_preflight.sql"),
  "utf8"
);

describe("support invitation RLS hardening", () => {
  it("constrains invitation creation to canonical relationships, permissions, and destinations", () => {
    expect(migration).toContain('create policy "Scholar Record owners can create governed support invitations"');
    expect(migration).toContain("and status = 'pending'");
    expect(migration).toContain("when 'parent_guardian' then '[\"view_progress\",\"view_deadlines\",\"support_tasks\"]'::jsonb");
    expect(migration).toContain("when 'mentor' then '[\"view_progress\",\"recommend_actions\",\"support_tasks\"]'::jsonb");
    expect(migration).toContain("when 'college_recruiter' then '/recruiting-os'");
    expect(migration).toContain("when 'college_admissions' then '/admissions-os'");
  });

  it("removes direct invitation updates from authenticated clients", () => {
    expect(migration).toContain('drop policy if exists "Invitees can update their invitation status"');
    expect(migration).toContain("revoke update on public.support_invitations from authenticated");
    expect(preflight).toContain("direct UPDATE/DELETE access to support_invitations");
  });

  it("moves the privileged claim implementation out of public", () => {
    expect(migration).toContain("alter function public.claim_support_invitation(text, text) security definer");
    expect(migration).toContain("alter function public.claim_support_invitation(text, text) set schema private");
    expect(migration).toContain("create or replace function public.claim_support_invitation");
    expect(migration).toContain("security invoker");
    expect(preflight).toContain("Public claim wrapper must not be SECURITY DEFINER");
    expect(preflight).toContain("Private claim implementation must be SECURITY DEFINER");
  });

  it("keeps the invitation preflight non-persistent", () => {
    expect(preflight.trimEnd().endsWith("rollback;")).toBe(true);
  });
});
