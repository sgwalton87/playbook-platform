import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PLAYBOOK_OPERATING_SYSTEMS } from "@/lib/role-os/canonicalOperatingSystems";

/**
 * Source-level completeness gate, not browser or production certification.
 * The extended acceptance contract must map all 15 self-registering OS routes
 * exactly once, without treating Founder/Platform Admin provisioned identities
 * as disposable signup fixtures.
 */
const contract = fs.readFileSync(
  path.join(process.cwd(), "docs/acceptance/15-ROLE-EXTENDED-FUNCTIONAL-CERTIFICATION-2026-11-20.md"),
  "utf8",
);
const rows = contract.split("\n").filter(line => /^\| (?!Role \|)[^|]+\| \/[^|]+\|/.test(line));
const documentedRoutes = rows.map(row => row.split("|")[2].trim());
const publicSystems = PLAYBOOK_OPERATING_SYSTEMS.filter(
  (system): system is typeof system & { publicRole: string } => "publicRole" in system,
);
describe("extended 15-role acceptance coverage contract", () => {
  it("contains exactly the 15 public self-registration destinations, no duplicate route", () => {
    expect(publicSystems).toHaveLength(15);
    expect(rows).toHaveLength(15);
    expect(new Set(documentedRoutes).size).toBe(15);
    expect(documentedRoutes.slice().sort()).toEqual(publicSystems.map(system => system.route).sort());
    expect(documentedRoutes).not.toContain("/founder");
    expect(documentedRoutes).not.toContain("/admin");
  });
  it("requires meaningful role actions, negative authority and evidence rather than route-only pass", () => {
    for (const row of rows) {
      const [, role, route, positive, negative] = row.split("|").map(value => value.trim());
      expect(role).toBeTruthy();
      expect(route).toMatch(/^\//);
      expect(positive.length).toBeGreaterThan(20);
      expect(negative.length).toBeGreaterThan(20);
    }
    expect(contract).toContain("BLOCKED, not PASS");
    expect(contract).toContain("Never provision synthetic identities in production");
    expect(contract).toContain("Founder/human release authorization");
  });
});
