import { artifactDigest } from "../../kernel/identity";
import type {
  CapabilityActivationDecisionRecord,
  CapabilityControlPlaneEvent,
  CapabilityControlPlaneState,
  CapabilityGovernanceEvidenceRecord,
  CapabilityIssuerRecord,
  CapabilityLifecycleTransitionRecord,
  CapabilityRegistryRecord,
  CapabilityRevocationRecord,
  PersistentEntitlementRecord,
} from "./types";

type WithoutDigest<T, K extends keyof T> = Omit<T, K>;

export function capabilityRegistryRecordDigest(
  value: WithoutDigest<CapabilityRegistryRecord, "content_digest">
): string {
  return artifactDigest(value);
}

export function lifecycleTransitionDigest(
  value: WithoutDigest<CapabilityLifecycleTransitionRecord, "digest">
): string {
  return artifactDigest(value);
}

export function persistentEntitlementDigest(
  value: WithoutDigest<PersistentEntitlementRecord, "content_digest">
): string {
  return artifactDigest(value);
}

export function capabilityIssuerDigest(
  value: WithoutDigest<CapabilityIssuerRecord, "content_digest">
): string {
  return artifactDigest(value);
}

export function capabilityRevocationDigest(
  value: WithoutDigest<CapabilityRevocationRecord, "digest">
): string {
  return artifactDigest(value);
}

export function activationDecisionRecordDigest(
  value: WithoutDigest<CapabilityActivationDecisionRecord, "content_digest">
): string {
  return artifactDigest(value);
}

export function governanceEvidenceDigest(
  value: WithoutDigest<CapabilityGovernanceEvidenceRecord, "content_digest">
): string {
  return artifactDigest(value);
}

export function controlPlaneEventDigest(
  value: WithoutDigest<CapabilityControlPlaneEvent, "event_digest">
): string {
  return artifactDigest(value);
}

export function controlPlaneStateDigest(
  value: WithoutDigest<CapabilityControlPlaneState, "state_digest">
): string {
  return artifactDigest(value);
}
