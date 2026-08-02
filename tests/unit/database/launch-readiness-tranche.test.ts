import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration = readFileSync("supabase/migrations/202608010003_launch_readiness_tranche.sql", "utf8");
describe("launch readiness migration", () => {
  it.each(["institutional_relationships", "role_action_handoffs", "content_safety_reports", "admin_audit_log"])("governs %s with RLS", (table) => expect(migration).toContain(`alter table public.${table} enable row level security`));
  it.each(["create_support_message", "create_role_action_handoff", "update_role_action_handoff", "respond_institutional_relationship", "moderate_safety_report", "change_profile_role"])("exposes the governed %s boundary", (fn) => {
    expect(migration).toContain(`function public.${fn}`);
    expect(migration).toContain(`grant execute on function public.${fn}`);
  });
  it("keeps administrative decisions immutable and reasoned", () => {
    expect(migration).toContain("reason text not null");
    expect(migration).not.toContain('policy "Admins update immutable audit"');
  });
});
