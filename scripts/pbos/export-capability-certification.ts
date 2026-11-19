import { mkdirSync, writeFileSync } from "node:fs";
import { buildCapabilityAuditLedger, summarizeCapabilityAudit } from "../../lib/platform/capabilityCertification";

const entries = buildCapabilityAuditLedger();
const counts = summarizeCapabilityAudit(entries);
if (counts.total !== 107) {
  throw new Error(`Capability census drift: expected 107, found ${counts.total}. Reconcile Canon before certifying.`);
}
const output = {
  schema: "pbos.capabilities.certification.v1",
  generatedAt: new Date().toISOString(),
  gitCommit: process.env.GITHUB_SHA ?? "not supplied",
  environment: "repository-audit-only",
  warning: "Navigation inventory is NOT end-to-end certification. No runtime proof has been attached.",
  counts,
  entries,
};
mkdirSync("artifacts/pbos-capability-audit", { recursive: true });
writeFileSync("artifacts/pbos-capability-audit/capabilities.json", JSON.stringify(output,null,2)+"\n");
process.stdout.write(`PBOS capability census ${counts.total}; verified ${counts.passed}; not tested ${counts.notTested}\n`);
