import { getCapabilityCatalog } from "@/lib/platform/capabilityCatalog";
import type { CapabilityStatus } from "@/lib/platform/capabilityMap";

/**
 * Certification is intentionally separate from Explore's navigation states.
 * "available" describes a reachable product route, not a passing user journey.
 * Only a reviewed evidence record can establish end-to-end certification.
 */
export type CapabilityCertificationStatus = "not-tested" | "in-progress" | "passed" | "failed" | "blocked";

export type CapabilityProof = {
  capabilityId: string;
  status: Exclude<CapabilityCertificationStatus, "not-tested">;
  verifiedAt: string;
  commitSha: string;
  environment: "staging" | "production";
  evidenceUrl: string;
  authorizedJourney: string;
  deniedJourney: string;
  persistenceProof: string;
  reviewer: string;
};

export type CapabilityAuditEntry = {
  id: string;
  groupId: string;
  groupLabel: string;
  label: string;
  description: string;
  route: string | null;
  catalogStatus: CapabilityStatus;
  certificationStatus: CapabilityCertificationStatus;
  evidence: CapabilityProof | null;
};

export function capabilityId(groupId: string, label: string): string {
  const slug = label.toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${groupId}:${slug}`;
}

function isCompleteProof(proof: CapabilityProof): boolean {
  return proof.status === "passed" &&
    /^\d{4}-\d{2}-\d{2}T/.test(proof.verifiedAt) &&
    /^[0-9a-f]{40}$/i.test(proof.commitSha) &&
    /^https:\/\//.test(proof.evidenceUrl) &&
    [proof.authorizedJourney, proof.deniedJourney, proof.persistenceProof, proof.reviewer]
      .every((value) => value.trim().length > 0);
}

/**
 * Never promote an unverified catalog item to "passed" on the strength of a URL,
 * code presence, route-only unit test, or self-reported test completion.
 * Founder inventory is counted separately and only visible to operators.
 */
export function buildCapabilityAuditLedger(
  proofs: CapabilityProof[] = [],
  options: { includeFounder?: boolean } = {},
): CapabilityAuditEntry[] {
  const byId = new Map(proofs.map((proof) => [proof.capabilityId, proof]));
  const entries = getCapabilityCatalog({ includeFounder: Boolean(options.includeFounder) })
    .flatMap((group) => group.items.map((item) => {
      const id = capabilityId(group.id, item.label);
      const submitted = byId.get(id) ?? null;
      const status: CapabilityCertificationStatus = submitted?.status === "passed" && !isCompleteProof(submitted)
        ? "blocked"
        : submitted?.status ?? "not-tested";
      return {
        id, groupId: group.id, groupLabel: group.label,
        label: item.label, description: item.description,
        route: item.href ?? null, catalogStatus: item.status,
        certificationStatus: status, evidence: submitted,
      };
    }));
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
    throw new Error("Duplicated capability IDs in Canon catalog. Reconcile before certification.");
  }
  return entries;
}

export function summarizeCapabilityAudit(entries: CapabilityAuditEntry[]) {
  return {
    total: entries.length,
    routeAvailable: entries.filter((x) => x.catalogStatus === "available").length,
    builtIn: entries.filter((x) => x.catalogStatus === "built-in").length,
    inAudit: entries.filter((x) => x.catalogStatus === "in-audit").length,
    planned: entries.filter((x) => x.catalogStatus === "planned").length,
    passed: entries.filter((x) => x.certificationStatus === "passed").length,
    failed: entries.filter((x) => x.certificationStatus === "failed").length,
    blocked: entries.filter((x) => x.certificationStatus === "blocked").length,
    notTested: entries.filter((x) => x.certificationStatus === "not-tested").length,
    inProgress: entries.filter((x) => x.certificationStatus === "in-progress").length,
  };
}
