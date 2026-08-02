import { describe, expect, it } from "vitest";
import { normalizePacketSections } from "@/lib/portfolio/packetContract";
import { readFileSync } from "node:fs";

describe("server portfolio packet allowlist", () => {
  it("drops unknown and duplicate client sections", () => {
    expect(normalizePacketSections(["identity", "private_messages", "identity", "verified_evidence"])).toEqual(["identity", "verified_evidence"]);
  });
  it("uses only canonical sections by default", () => {
    expect(normalizePacketSections(undefined)).toEqual(["identity", "readiness", "verified_evidence"]);
  });
  it("does not accept client packet contents or direct authenticated share writes", () => {
    const route = readFileSync("app/api/portfolio/shares/route.ts", "utf8");
    const migration = readFileSync("supabase/migrations/202608010002_trust_workflow_hardening.sql", "utf8");
    expect(route).not.toContain("body.packet");
    expect(route).toContain("buildServerPortfolioPacket");
    expect(migration).toContain('drop policy if exists "Scholars can manage own portfolio shares"');
    expect(migration).toContain('create policy "Scholars read own portfolio shares"');
  });
});
