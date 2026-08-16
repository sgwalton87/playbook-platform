import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

const mapping = read("lib/onboarding/supabaseMapping.ts");
const roleSelect = read("components/role-os/RoleSelect.tsx");
const callback = read("app/auth/callback/page.tsx");
const roleRoute = read("app/api/pbos/onboarding/[role]/route.ts");
const scholarRoute = read("app/api/pbos/scholar/onboarding/route.ts");
const migration = read("supabase/migrations/202608160018_profile_authority_hardening.sql");

describe("profile authority hardening", () => {
  it("keeps authority-bearing fields out of client onboarding autosave", () => {
    expect(mapping).not.toContain("role: input.role");
    expect(mapping).not.toContain("profile_mode: input.role");
    expect(mapping).not.toContain("requested_role: input.role");
    expect(mapping).not.toContain("onboarding_completed:");
    expect(mapping).not.toContain("onboarding_completed_at:");
  });

  it("routes durable role creation and role selection through governed RPCs", () => {
    expect(callback).toContain('rpc(\n        "initialize_playbook_profile"');
    expect(callback).not.toContain('.from("profiles").upsert(');
    expect(roleSelect).toContain('rpc("select_playbook_role"');
    expect(roleSelect).not.toContain('.from("profiles").upsert(');
  });

  it("routes every onboarding-completion mutation through the governed RPC", () => {
    expect(roleRoute).toContain('rpc("complete_playbook_onboarding"');
    expect(scholarRoute).toContain('rpc("complete_playbook_onboarding"');
    expect(roleRoute).not.toContain('.update({ verification_status: "pending" })');
    expect(roleRoute).not.toContain('.update({ onboarding_completed: true');
    expect(scholarRoute).not.toContain('.update({ onboarding_completed: true');
  });

  it("revokes broad profile authority and protects reward/admin columns", () => {
    expect(migration).toContain("revoke insert, update, delete on public.profiles from authenticated");
    for (const field of [
      "role",
      "profile_mode",
      "requested_role",
      "verification_status",
      "onboarding_completed",
      "is_admin",
      "coin_balance",
      "xp",
      "level",
      "streak",
      "badges",
    ]) {
      const safeGrantSection = migration.split("grant update (")[1]?.split(") on public.profiles")[0] || "";
      expect(safeGrantSection).not.toMatch(new RegExp(`(^|\\W)${field}(\\W|$)`));
    }
  });
});
