import {
  certificationQueueViewDigest,
  evidenceStatusViewDigest,
  providerOperationsSnapshotDigest,
  providerStatusViewDigest,
  reviewerAssignmentViewDigest,
  riskFindingViewDigest,
} from "./identity";
import type { ProviderOperationsSnapshot } from "./types";

export class ProviderOperationsControlCenter {
  constructor(
    private readonly administratorAuthorities: ReadonlySet<string>,
    private readonly reviewerAuthorities: ReadonlySet<string>
  ) {}

  createSnapshot(value: ProviderOperationsSnapshot): ProviderOperationsSnapshot {
    const errors: string[] = [];
    if (!this.administratorAuthorities.has(value.generated_by)) {
      errors.push("provider operations administrator is unauthorized.");
    }
    if (value.digest !== providerOperationsSnapshotDigest(value)) {
      errors.push("provider operations snapshot digest is invalid.");
    }
    for (const item of value.providers) {
      if (
        !item.identity ||
        !item.provider_identity ||
        !item.status ||
        !this.administratorAuthorities.has(item.authority) ||
        item.digest !== providerStatusViewDigest(item)
      ) {
        errors.push(`provider status view is invalid: ${item.identity}.`);
      }
    }
    for (const item of value.evidence) {
      if (
        !item.evidence_reference ||
        item.digest !== evidenceStatusViewDigest(item)
      ) {
        errors.push(`evidence status view is invalid: ${item.identity}.`);
      }
    }
    for (const item of value.certification_queue) {
      if (
        !item.certification_reference ||
        !this.administratorAuthorities.has(item.authority) ||
        item.digest !== certificationQueueViewDigest(item)
      ) {
        errors.push(`certification queue view is invalid: ${item.identity}.`);
      }
    }
    for (const item of value.risks) {
      if (item.digest !== riskFindingViewDigest(item)) {
        errors.push(`risk finding view is invalid: ${item.identity}.`);
      }
    }
    for (const item of value.reviewer_assignments) {
      if (
        !this.reviewerAuthorities.has(item.authority) ||
        item.digest !== reviewerAssignmentViewDigest(item)
      ) {
        errors.push(`reviewer assignment view is invalid: ${item.identity}.`);
      }
    }
    if (value.audit_history.length === 0) {
      errors.push("provider operations audit history is missing.");
    }
    if (errors.length > 0) {
      throw new Error(`Provider operations snapshot rejected: ${errors.join(" ")}`);
    }
    return structuredClone(value);
  }
}
