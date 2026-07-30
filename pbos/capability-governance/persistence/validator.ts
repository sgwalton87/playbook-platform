import {
  requireChronology,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import { artifactDigest } from "../../kernel/identity";
import { CAPABILITY_CLASSIFICATIONS } from "../types";
import {
  activationDecisionRecordDigest,
  capabilityIssuerDigest,
  capabilityRegistryRecordDigest,
  capabilityRevocationDigest,
  controlPlaneEventDigest,
  controlPlaneStateDigest,
  governanceEvidenceDigest,
  lifecycleTransitionDigest,
  persistentEntitlementDigest,
} from "./identity";
import {
  PERSISTENT_ENTITLEMENT_SOURCES,
  type CapabilityActivationDecisionRecord,
  type CapabilityControlPlaneEvent,
  type CapabilityControlPlaneState,
  type CapabilityGovernanceEvidenceRecord,
  type CapabilityIssuerRecord,
  type CapabilityLifecycleTransitionRecord,
  type CapabilityRegistryRecord,
  type CapabilityRevocationRecord,
  type PersistentCapabilityLifecycleState,
  type PersistentEntitlementRecord,
} from "./types";

const CAPABILITY_STATES: readonly PersistentCapabilityLifecycleState[] = [
  "PROPOSED",
  "DESIGNED",
  "APPROVED",
  "AVAILABLE",
  "ACTIVATED",
  "SUSPENDED",
  "DEPRECATED",
  "RETIRED",
];

const TRANSITIONS: Readonly<
  Record<
    PersistentCapabilityLifecycleState,
    readonly PersistentCapabilityLifecycleState[]
  >
> = {
  PROPOSED: ["DESIGNED"],
  DESIGNED: ["APPROVED"],
  APPROVED: ["AVAILABLE"],
  AVAILABLE: ["ACTIVATED", "SUSPENDED", "DEPRECATED"],
  ACTIVATED: ["SUSPENDED", "DEPRECATED"],
  SUSPENDED: ["AVAILABLE", "DEPRECATED", "RETIRED"],
  DEPRECATED: ["RETIRED"],
  RETIRED: [],
};

function requirePositiveRevision(
  errors: string[],
  field: string,
  value: number
): void {
  if (!Number.isInteger(value) || value < 1) {
    errors.push(`${field} must be a positive integer.`);
  }
}

function requireNonEmpty(
  errors: string[],
  field: string,
  values: readonly string[]
): void {
  requireIdentifiers(errors, field, values);
  if (values.length === 0) errors.push(`${field} is required.`);
}

export function validateCapabilityRegistryRecord(
  record: CapabilityRegistryRecord
): readonly string[] {
  const errors: string[] = [];
  requirePositiveRevision(
    errors,
    "capability.record_revision",
    record.record_revision
  );
  requireIdentifier(errors, "capability.capability_id", record.capability_id);
  requireIdentifier(errors, "capability.name", record.name);
  requireIdentifier(errors, "capability.description", record.description);
  requireIdentifier(errors, "capability.owning_engine", record.owning_engine);
  requireIdentifier(errors, "capability.owner_identity", record.owner_identity);
  requireIdentifier(errors, "capability.version", record.version);
  requireIdentifier(
    errors,
    "capability.approval_authority",
    record.approval_authority
  );
  requireTimestamp(errors, "capability.created_at", record.created_at);
  requireTimestamp(errors, "capability.updated_at", record.updated_at);
  requireDigest(errors, "capability.content_digest", record.content_digest);
  requireIdentifiers(errors, "capability.dependencies", record.dependencies);
  requireNonEmpty(
    errors,
    "capability.security_requirements",
    record.security_requirements
  );
  requireNonEmpty(
    errors,
    "capability.evidence_requirements",
    record.evidence_requirements
  );
  if (!CAPABILITY_CLASSIFICATIONS.includes(record.classification)) {
    errors.push("capability classification is not governed.");
  }
  if (!CAPABILITY_STATES.includes(record.lifecycle_state)) {
    errors.push("capability lifecycle state is not governed.");
  }
  if (
    record.approval_authority === record.capability_id ||
    record.approval_authority === record.owning_engine
  ) {
    errors.push("capability cannot approve itself.");
  }
  if (record.dependencies.includes(record.capability_id)) {
    errors.push("capability cannot depend on itself.");
  }
  const { content_digest: _contentDigest, ...content } = record;
  void _contentDigest;
  if (record.content_digest !== capabilityRegistryRecordDigest(content)) {
    errors.push("capability record digest does not match content.");
  }
  return errors;
}

export function validateCapabilityLifecycleTransitionRecord(
  transition: CapabilityLifecycleTransitionRecord
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "transition.transition_id", transition.transition_id);
  requireIdentifier(errors, "transition.capability_id", transition.capability_id);
  requireIdentifier(
    errors,
    "transition.authorized_actor",
    transition.authorized_actor
  );
  requireIdentifier(errors, "transition.reason", transition.reason);
  requireNonEmpty(errors, "transition.evidence_ids", transition.evidence_ids);
  requireNonEmpty(
    errors,
    "transition.validation_ids",
    transition.validation_ids
  );
  requireTimestamp(errors, "transition.timestamp", transition.timestamp);
  requireDigest(errors, "transition.digest", transition.digest);
  if (transition.authorized_actor === transition.capability_id) {
    errors.push("capability cannot authorize its own transition.");
  }
  if (!TRANSITIONS[transition.previous_state].includes(transition.new_state)) {
    errors.push(
      `capability transition ${transition.previous_state} -> ${transition.new_state} is prohibited.`
    );
  }
  const { digest: _digest, ...content } = transition;
  void _digest;
  if (transition.digest !== lifecycleTransitionDigest(content)) {
    errors.push("capability transition digest does not match content.");
  }
  return errors;
}

export function validatePersistentEntitlementRecord(
  record: PersistentEntitlementRecord
): readonly string[] {
  const errors: string[] = [];
  requirePositiveRevision(
    errors,
    "entitlement.record_revision",
    record.record_revision
  );
  requireIdentifier(errors, "entitlement.entitlement_id", record.entitlement_id);
  requireIdentifier(errors, "entitlement.subject_id", record.subject_id);
  requireIdentifier(errors, "entitlement.capability_id", record.capability_id);
  requireIdentifier(errors, "entitlement.issuer_id", record.issuer_id);
  requireIdentifier(
    errors,
    "entitlement.policy_reference",
    record.policy_reference
  );
  requireIdentifier(
    errors,
    "entitlement.evidence_reference",
    record.evidence_reference
  );
  requireTimestamp(errors, "entitlement.issued_at", record.issued_at);
  if (record.expires_at !== null) {
    requireTimestamp(errors, "entitlement.expires_at", record.expires_at);
  }
  if (record.revoked_at !== null) {
    requireTimestamp(errors, "entitlement.revoked_at", record.revoked_at);
  }
  requireChronology(
    errors,
    "entitlement.issued_at",
    record.issued_at,
    "entitlement.expires_at",
    record.expires_at
  );
  requireDigest(errors, "entitlement.content_digest", record.content_digest);
  if (!PERSISTENT_ENTITLEMENT_SOURCES.includes(record.source_type)) {
    errors.push("entitlement source type is not governed.");
  }
  if (record.tenant_id !== null && record.organization_id === null) {
    errors.push("tenant-scoped entitlement requires organization scope.");
  }
  if (record.status === "REVOKED" && record.revoked_at === null) {
    errors.push("revoked entitlement requires revoked_at.");
  }
  if (record.status !== "REVOKED" && record.revoked_at !== null) {
    errors.push("non-revoked entitlement cannot have revoked_at.");
  }
  const { content_digest: _contentDigest, ...content } = record;
  void _contentDigest;
  if (record.content_digest !== persistentEntitlementDigest(content)) {
    errors.push("entitlement record digest does not match content.");
  }
  return errors;
}

export function validateCapabilityIssuerRecord(
  record: CapabilityIssuerRecord
): readonly string[] {
  const errors: string[] = [];
  requirePositiveRevision(errors, "issuer.record_revision", record.record_revision);
  requireIdentifier(errors, "issuer.issuer_id", record.issuer_id);
  requireIdentifier(errors, "issuer.identity", record.identity);
  requireIdentifier(errors, "issuer.organization", record.organization);
  requireNonEmpty(errors, "issuer.authority_scope", record.authority_scope);
  requireNonEmpty(
    errors,
    "issuer.allowed_capabilities",
    record.allowed_capabilities
  );
  requireNonEmpty(
    errors,
    "issuer.issued_credentials",
    record.issued_credentials
  );
  requireTimestamp(errors, "issuer.valid_from", record.valid_from);
  requireTimestamp(errors, "issuer.created_at", record.created_at);
  requireTimestamp(errors, "issuer.updated_at", record.updated_at);
  if (record.expires_at !== null) {
    requireTimestamp(errors, "issuer.expires_at", record.expires_at);
  }
  requireChronology(
    errors,
    "issuer.valid_from",
    record.valid_from,
    "issuer.expires_at",
    record.expires_at
  );
  requireDigest(errors, "issuer.content_digest", record.content_digest);
  const { content_digest: _contentDigest, ...content } = record;
  void _contentDigest;
  if (record.content_digest !== capabilityIssuerDigest(content)) {
    errors.push("issuer record digest does not match content.");
  }
  return errors;
}

export function validateCapabilityRevocationRecord(
  record: CapabilityRevocationRecord
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "revocation.revocation_id", record.revocation_id);
  requireIdentifier(errors, "revocation.target_id", record.target_id);
  requireIdentifier(errors, "revocation.authority_id", record.authority_id);
  requireIdentifier(errors, "revocation.reason", record.reason);
  requireNonEmpty(errors, "revocation.evidence_ids", record.evidence_ids);
  requireTimestamp(errors, "revocation.revoked_at", record.revoked_at);
  requireDigest(errors, "revocation.digest", record.digest);
  if (record.authority_id === record.target_id) {
    errors.push("revocation target cannot revoke itself.");
  }
  const { digest: _digest, ...content } = record;
  void _digest;
  if (record.digest !== capabilityRevocationDigest(content)) {
    errors.push("revocation digest does not match content.");
  }
  return errors;
}

export function validateActivationDecisionRecord(
  record: CapabilityActivationDecisionRecord
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "decision.decision_id", record.decision_id);
  requireIdentifier(errors, "decision.subject", record.subject);
  requireIdentifier(errors, "decision.capability", record.capability);
  requireDigest(errors, "decision.capability_digest", record.capability_digest);
  requireIdentifier(errors, "decision.policy_result", record.policy_result);
  requireIdentifier(errors, "decision.authority_result", record.authority_result);
  requireIdentifier(errors, "decision.kernel_reference", record.kernel_reference);
  requireTimestamp(errors, "decision.timestamp", record.timestamp);
  requireDigest(errors, "decision.evidence_digest", record.evidence_digest);
  requireDigest(errors, "decision.content_digest", record.content_digest);
  const { content_digest: _contentDigest, ...content } = record;
  void _contentDigest;
  if (record.content_digest !== activationDecisionRecordDigest(content)) {
    errors.push("activation decision digest does not match content.");
  }
  return errors;
}

export function validateGovernanceEvidenceRecord(
  record: CapabilityGovernanceEvidenceRecord
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "evidence.evidence_id", record.evidence_id);
  requireIdentifier(errors, "evidence.subject_id", record.subject_id);
  requireIdentifier(errors, "evidence.event_id", record.event_id);
  requireIdentifier(errors, "evidence.authority_id", record.authority_id);
  requireNonEmpty(
    errors,
    "evidence.source_evidence_ids",
    record.source_evidence_ids
  );
  if (record.payload.trim().length === 0) {
    errors.push("evidence.payload is required.");
  }
  requireDigest(errors, "evidence.payload_digest", record.payload_digest);
  if (
    record.payload.trim().length > 0 &&
    record.payload_digest !== artifactDigest(record.payload)
  ) {
    errors.push("governance evidence payload digest does not match payload.");
  }
  requireTimestamp(errors, "evidence.recorded_at", record.recorded_at);
  requireDigest(errors, "evidence.content_digest", record.content_digest);
  const { content_digest: _contentDigest, ...content } = record;
  void _contentDigest;
  if (record.content_digest !== governanceEvidenceDigest(content)) {
    errors.push("governance evidence digest does not match content.");
  }
  return errors;
}

function validateEvent(
  event: CapabilityControlPlaneEvent,
  index: number,
  previousDigest: string | null
): readonly string[] {
  const errors: string[] = [];
  if (event.sequence !== index + 1) {
    errors.push("control-plane event sequence is invalid.");
  }
  requireIdentifier(errors, "event.event_id", event.event_id);
  requireIdentifier(errors, "event.subject_id", event.subject_id);
  requireIdentifier(errors, "event.authority_id", event.authority_id);
  requireIdentifiers(errors, "event.evidence_ids", event.evidence_ids);
  requireTimestamp(errors, "event.timestamp", event.timestamp);
  requireDigest(errors, "event.payload_digest", event.payload_digest);
  requireDigest(errors, "event.event_digest", event.event_digest);
  if (event.previous_event_digest !== previousDigest) {
    errors.push("control-plane event hash chain is invalid.");
  }
  const { event_digest: _eventDigest, ...content } = event;
  void _eventDigest;
  if (event.event_digest !== controlPlaneEventDigest(content)) {
    errors.push("control-plane event digest does not match content.");
  }
  return errors;
}

function duplicateIds(
  values: readonly string[],
  label: string
): readonly string[] {
  return new Set(values).size === values.length
    ? []
    : [`${label} contains duplicate immutable identities.`];
}

export function validateCapabilityControlPlaneState(
  state: CapabilityControlPlaneState
): readonly string[] {
  const errors: string[] = [];
  if (
    state.schema_version !== "1.0.0" ||
    state.authority !== "PBOS_CAPABILITY_CONTROL_PLANE"
  ) {
    errors.push("capability control-plane metadata is invalid.");
  }
  if (!Number.isInteger(state.revision) || state.revision < 0) {
    errors.push("capability control-plane revision is invalid.");
  }
  requireTimestamp(errors, "control_plane.updated_at", state.updated_at);
  requireDigest(errors, "control_plane.state_digest", state.state_digest);
  errors.push(
    ...state.capabilities.flatMap(validateCapabilityRegistryRecord),
    ...state.capability_transitions.flatMap(
      validateCapabilityLifecycleTransitionRecord
    ),
    ...state.entitlements.flatMap(validatePersistentEntitlementRecord),
    ...state.issuers.flatMap(validateCapabilityIssuerRecord),
    ...state.revocations.flatMap(validateCapabilityRevocationRecord),
    ...state.activation_decisions.flatMap(validateActivationDecisionRecord),
    ...state.evidence.flatMap(validateGovernanceEvidenceRecord)
  );
  let previous: string | null = null;
  state.events.forEach((event, index) => {
    errors.push(...validateEvent(event, index, previous));
    previous = event.event_digest;
  });
  errors.push(
    ...duplicateIds(
      state.capability_transitions.map(({ transition_id: id }) => id),
      "capability transitions"
    ),
    ...duplicateIds(
      state.revocations.map(({ revocation_id: id }) => id),
      "revocations"
    ),
    ...duplicateIds(
      state.activation_decisions.map(({ decision_id: id }) => id),
      "activation decisions"
    ),
    ...duplicateIds(
      state.evidence.map(({ evidence_id: id }) => id),
      "governance evidence"
    ),
    ...duplicateIds(
      state.events.map(({ event_id: id }) => id),
      "control-plane events"
    )
  );
  if (state.revision !== state.events.length) {
    errors.push("control-plane revision does not match event history.");
  }
  const { state_digest: _stateDigest, ...content } = state;
  void _stateDigest;
  if (state.state_digest !== controlPlaneStateDigest(content)) {
    errors.push("control-plane state digest does not match content.");
  }
  return errors;
}
