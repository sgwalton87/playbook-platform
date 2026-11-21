import { describe, expect, it } from "vitest";
import {
 buildCapabilityAuditLedger, capabilityId, summarizeCapabilityAudit,
} from "@/lib/platform/capabilityCertification";

describe("Constitutional capability certification ledger", () => {
 it("maintains 107 canonical non-Founder entries without claiming any untested workflow passes", () => {
  const entries = buildCapabilityAuditLedger();
  const counts = summarizeCapabilityAudit(entries);
  expect(counts.total).toBe(107);
  expect(counts.routeAvailable).toBe(68);
  expect(counts.builtIn).toBe(13);
  expect(counts.inAudit).toBe(8);
  expect(counts.planned).toBe(18);
  expect(counts.passed).toBe(0);
  expect(counts.notTested).toBe(107);
 });
 it("assigns stable unique identifiers and a separate Founder inventory", () => {
  const entries = buildCapabilityAuditLedger();
  expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
  expect(capabilityId("account","Sign in & account access")).toBe("account:sign-in-account-access");
  const founder = buildCapabilityAuditLedger([], { includeFounder: true });
  expect(founder.length).toBeGreaterThan(entries.length);
  expect(founder.filter((entry) => entry.groupId === "founder-operations").length).toBeGreaterThan(0);
 });
 it("fails closed on incomplete green reports and retains a real failed test status", () => {
  const id = capabilityId("account", "Sign in & account access");
  const proof = {
   capabilityId:id,status:"passed" as const,
   verifiedAt:"2026-11-18T00:00:00Z",commitSha:"incomplete",
   environment:"staging" as const,evidenceUrl:"",authorizedJourney:"route exists",
   deniedJourney:"",persistenceProof:"",reviewer:"",
  };
  expect(buildCapabilityAuditLedger([proof]).find((entry) => entry.id === id)?.certificationStatus).toBe("blocked");
  const broken = buildCapabilityAuditLedger([{...proof,status:"failed" as const}]);
  expect(broken.find((entry)=>entry.id===id)?.certificationStatus).toBe("failed");
 });
 it("rejects duplicate evidence instead of silently promoting the last status", () => {
  const id = capabilityId("account", "Onboarding");
  const proof = {
   capabilityId:id,status:"failed" as const,verifiedAt:"2026-11-20T12:00:00Z",
   commitSha:"a".repeat(40),environment:"staging" as const,
   evidenceUrl:"https://github.com/example/a/actions/runs/123",
   authorizedJourney:"role onboarding",deniedJourney:"foreign role denied",
   persistenceProof:"saved record read back",reviewer:"reviewer",
  };
  expect(() => buildCapabilityAuditLedger([
    proof, { ...proof, status:"passed" as const },
  ])).toThrow(/Duplicate certification evidence/);
 });
 it("requires approved evidence for actual passed certification", () => {
  const id = capabilityId("account","Onboarding");
  const entry = buildCapabilityAuditLedger([{
   capabilityId:id,status:"passed",verifiedAt:"2026-11-18T21:00:00Z",
   commitSha:"a".repeat(40),environment:"staging",
   evidenceUrl:"https://github.com/example/a/actions/runs/123",
   authorizedJourney:"approved scholar onboarding persisted and redirected",
   deniedJourney:"other account cannot read profile",
   persistenceProof:"saved and reloaded database row",
   reviewer:"authorized reviewer",
  }]).find((item)=>item.id===id);
  expect(entry?.certificationStatus).toBe("passed");
 });
});
