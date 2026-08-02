import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
const migration=readFileSync("supabase/migrations/202608010005_consequence_api_hardening.sql","utf8");
describe("consequence API hardening migration",()=>{
  it("makes reward emission administrator-only and atomic",()=>{expect(migration).toContain("if not public.is_platform_admin(v_actor)");expect(migration).toContain("function public.emit_reward_event");});
  it("serializes redemption balance changes",()=>{expect(migration).toContain("pg_advisory_xact_lock");expect(migration).toContain("insufficient_balance");});
  it("aligns supporter reads with persisted grants",()=>{expect(migration).toContain("sr.permissions ? 'view_progress'");});
});
