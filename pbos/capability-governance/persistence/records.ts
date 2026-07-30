import {
  activationDecisionRecordDigest,
  capabilityIssuerDigest,
  capabilityRegistryRecordDigest,
  capabilityRevocationDigest,
  governanceEvidenceDigest,
  lifecycleTransitionDigest,
  persistentEntitlementDigest,
} from "./identity";
import type {
  CapabilityActivationDecisionRecord,
  CapabilityGovernanceEvidenceRecord,
  CapabilityIssuerRecord,
  CapabilityLifecycleTransitionRecord,
  CapabilityRegistryRecord,
  CapabilityRevocationRecord,
  PersistentEntitlementRecord,
} from "./types";

export function createCapabilityRegistryRecord(
  content: Omit<CapabilityRegistryRecord, "content_digest">
): CapabilityRegistryRecord {
  return {
    ...content,
    content_digest: capabilityRegistryRecordDigest(content),
  };
}

export function createCapabilityLifecycleTransitionRecord(
  content: Omit<CapabilityLifecycleTransitionRecord, "digest">
): CapabilityLifecycleTransitionRecord {
  return { ...content, digest: lifecycleTransitionDigest(content) };
}

export function createPersistentEntitlementRecord(
  content: Omit<PersistentEntitlementRecord, "content_digest">
): PersistentEntitlementRecord {
  return {
    ...content,
    content_digest: persistentEntitlementDigest(content),
  };
}

export function createCapabilityIssuerRecord(
  content: Omit<CapabilityIssuerRecord, "content_digest">
): CapabilityIssuerRecord {
  return { ...content, content_digest: capabilityIssuerDigest(content) };
}

export function createCapabilityRevocationRecord(
  content: Omit<CapabilityRevocationRecord, "digest">
): CapabilityRevocationRecord {
  return { ...content, digest: capabilityRevocationDigest(content) };
}

export function createCapabilityActivationDecisionRecord(
  content: Omit<CapabilityActivationDecisionRecord, "content_digest">
): CapabilityActivationDecisionRecord {
  return {
    ...content,
    content_digest: activationDecisionRecordDigest(content),
  };
}

export function createCapabilityGovernanceEvidenceRecord(
  content: Omit<CapabilityGovernanceEvidenceRecord, "content_digest">
): CapabilityGovernanceEvidenceRecord {
  return {
    ...content,
    content_digest: governanceEvidenceDigest(content),
  };
}
