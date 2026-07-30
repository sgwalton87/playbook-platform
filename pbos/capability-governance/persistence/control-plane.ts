import { artifactDigest } from "../../kernel/identity";
import type { IssuerTrustDecision } from "../issuer-trust";
import { validateIssuerTrustDecision } from "../issuer-trust";
import {
  controlPlaneEventDigest,
  controlPlaneStateDigest,
} from "./identity";
import {
  createCapabilityIssuerRecord,
  createCapabilityLifecycleTransitionRecord,
  createCapabilityRegistryRecord,
  createPersistentEntitlementRecord,
} from "./records";
import { CapabilityControlPlaneStore } from "./store";
import type {
  CapabilityActivationDecisionRecord,
  CapabilityControlPlaneEvent,
  CapabilityControlPlaneEventType,
  CapabilityControlPlaneHealth,
  CapabilityControlPlaneState,
  CapabilityGovernanceEvidenceRecord,
  CapabilityIssuerRecord,
  CapabilityLifecycleTransitionRecord,
  CapabilityRegistryRecord,
  CapabilityRevocationRecord,
  PersistentEntitlementRecord,
} from "./types";
import {
  validateActivationDecisionRecord,
  validateCapabilityIssuerRecord,
  validateCapabilityLifecycleTransitionRecord,
  validateCapabilityRegistryRecord,
  validateCapabilityRevocationRecord,
  validateGovernanceEvidenceRecord,
  validatePersistentEntitlementRecord,
} from "./validator";

function reviseCapability(
  current: CapabilityRegistryRecord,
  lifecycleState: CapabilityRegistryRecord["lifecycle_state"],
  updatedAt: string
): CapabilityRegistryRecord {
  return createCapabilityRegistryRecord({
    record_revision: current.record_revision + 1,
    capability_id: current.capability_id,
    name: current.name,
    description: current.description,
    owning_engine: current.owning_engine,
    owner_identity: current.owner_identity,
    classification: current.classification,
    version: current.version,
    dependencies: current.dependencies,
    security_requirements: current.security_requirements,
    evidence_requirements: current.evidence_requirements,
    lifecycle_state: lifecycleState,
    approval_authority: current.approval_authority,
    created_at: current.created_at,
    updated_at: updatedAt,
  });
}

export interface CapabilityControlPlaneAuthorities {
  readonly capability_registration: readonly string[];
  readonly issuer_registration: readonly string[];
  readonly revocation: readonly string[];
  readonly activation_decision: readonly string[];
  readonly evidence: readonly string[];
}

function latestById<T>(
  records: readonly T[],
  id: (record: T) => string,
  revision: (record: T) => number
): Map<string, T> {
  const latest = new Map<string, T>();
  for (const record of records) {
    const key = id(record);
    const current = latest.get(key);
    if (!current || revision(record) > revision(current)) {
      latest.set(key, record);
    }
  }
  return latest;
}

function withEvent(args: {
  state: CapabilityControlPlaneState;
  event_id: string;
  event_type: CapabilityControlPlaneEventType;
  subject_id: string;
  authority_id: string;
  evidence_ids: readonly string[];
  timestamp: string;
  payload: unknown;
  changes: Partial<
    Pick<
      CapabilityControlPlaneState,
      | "capabilities"
      | "capability_transitions"
      | "entitlements"
      | "issuers"
      | "revocations"
      | "activation_decisions"
      | "evidence"
    >
  >;
}): CapabilityControlPlaneState {
  const previous =
    args.state.events.length === 0
      ? null
      : args.state.events[args.state.events.length - 1].event_digest;
  const eventContent: Omit<CapabilityControlPlaneEvent, "event_digest"> = {
    sequence: args.state.revision + 1,
    event_id: args.event_id,
    event_type: args.event_type,
    subject_id: args.subject_id,
    authority_id: args.authority_id,
    evidence_ids: [...args.evidence_ids],
    timestamp: args.timestamp,
    payload_digest: artifactDigest(args.payload),
    previous_event_digest: previous,
  };
  const event: CapabilityControlPlaneEvent = {
    ...eventContent,
    event_digest: controlPlaneEventDigest(eventContent),
  };
  const content: Omit<CapabilityControlPlaneState, "state_digest"> = {
    schema_version: args.state.schema_version,
    authority: args.state.authority,
    revision: args.state.revision + 1,
    updated_at: args.timestamp,
    capabilities:
      args.changes.capabilities ?? args.state.capabilities,
    capability_transitions:
      args.changes.capability_transitions ??
      args.state.capability_transitions,
    entitlements: args.changes.entitlements ?? args.state.entitlements,
    issuers: args.changes.issuers ?? args.state.issuers,
    revocations: args.changes.revocations ?? args.state.revocations,
    activation_decisions:
      args.changes.activation_decisions ??
      args.state.activation_decisions,
    evidence: args.changes.evidence ?? args.state.evidence,
    events: [...args.state.events, event],
  };
  return { ...content, state_digest: controlPlaneStateDigest(content) };
}

function requireAuthority(
  recognized: ReadonlySet<string>,
  authorityId: string,
  operation: string
): void {
  if (!recognized.has(authorityId)) {
    throw new Error(`${operation} authority is not recognized.`);
  }
}

function requireNoErrors(errors: readonly string[], subject: string): void {
  if (errors.length > 0) {
    throw new Error(`${subject} validation failed: ${errors.join(" ")}`);
  }
}

export class DurableCapabilityControlPlane {
  readonly #capabilityAuthorities: ReadonlySet<string>;
  readonly #issuerAuthorities: ReadonlySet<string>;
  readonly #revocationAuthorities: ReadonlySet<string>;
  readonly #decisionAuthorities: ReadonlySet<string>;
  readonly #evidenceAuthorities: ReadonlySet<string>;

  constructor(
    private readonly store: CapabilityControlPlaneStore,
    authorities: CapabilityControlPlaneAuthorities
  ) {
    this.#capabilityAuthorities = new Set(
      authorities.capability_registration
    );
    this.#issuerAuthorities = new Set(authorities.issuer_registration);
    this.#revocationAuthorities = new Set(authorities.revocation);
    this.#decisionAuthorities = new Set(authorities.activation_decision);
    this.#evidenceAuthorities = new Set(authorities.evidence);
  }

  initialize(timestamp: string): CapabilityControlPlaneState {
    return this.store.initialize(timestamp);
  }

  state(): CapabilityControlPlaneState {
    return this.store.load();
  }

  registerCapability(args: {
    readonly record: CapabilityRegistryRecord;
    readonly authority_id: string;
    readonly event_id: string;
    readonly expected_revision: number;
  }): CapabilityControlPlaneState {
    requireAuthority(
      this.#capabilityAuthorities,
      args.authority_id,
      "capability registration"
    );
    requireNoErrors(
      validateCapabilityRegistryRecord(args.record),
      "capability record"
    );
    if (
      args.record.approval_authority !== args.authority_id ||
      args.record.record_revision !== 1 ||
      args.record.lifecycle_state !== "PROPOSED"
    ) {
      throw new Error(
        "Initial capability registration requires matching approval authority, revision 1, and PROPOSED state."
      );
    }
    return this.store.commit(args.expected_revision, (state) => {
      if (
        state.capabilities.some(
          ({ capability_id: id }) => id === args.record.capability_id
        )
      ) {
        throw new Error("Capability identity is already registered.");
      }
      const available = new Set(
        state.capabilities.map(({ capability_id: id }) => id)
      );
      for (const dependency of args.record.dependencies) {
        if (!available.has(dependency)) {
          throw new Error(`Capability dependency is unavailable: ${dependency}.`);
        }
      }
      return withEvent({
        state,
        event_id: args.event_id,
        event_type: "CAPABILITY_REGISTERED",
        subject_id: args.record.capability_id,
        authority_id: args.authority_id,
        evidence_ids: args.record.evidence_requirements,
        timestamp: args.record.created_at,
        payload: args.record,
        changes: {
          capabilities: [...state.capabilities, args.record],
        },
      });
    });
  }

  transitionCapability(args: {
    readonly transition: CapabilityLifecycleTransitionRecord;
    readonly expected_revision: number;
  }): CapabilityControlPlaneState {
    requireAuthority(
      this.#capabilityAuthorities,
      args.transition.authorized_actor,
      "capability transition"
    );
    requireNoErrors(
      validateCapabilityLifecycleTransitionRecord(args.transition),
      "capability transition"
    );
    return this.store.commit(args.expected_revision, (state) => {
      const current = latestById(
        state.capabilities,
        ({ capability_id: id }) => id,
        ({ record_revision: revision }) => revision
      ).get(args.transition.capability_id);
      if (!current) throw new Error("Capability is not registered.");
      if (
        current.lifecycle_state !== args.transition.previous_state ||
        current.approval_authority !== args.transition.authorized_actor
      ) {
        throw new Error(
          "Capability transition state or authority does not match current truth."
        );
      }
      const next = reviseCapability(
        current,
        args.transition.new_state,
        args.transition.timestamp
      );
      return withEvent({
        state,
        event_id: args.transition.transition_id,
        event_type: "CAPABILITY_TRANSITIONED",
        subject_id: args.transition.capability_id,
        authority_id: args.transition.authorized_actor,
        evidence_ids: args.transition.evidence_ids,
        timestamp: args.transition.timestamp,
        payload: { transition: args.transition, projection: next },
        changes: {
          capabilities: [...state.capabilities, next],
          capability_transitions: [
            ...state.capability_transitions,
            args.transition,
          ],
        },
      });
    });
  }

  registerIssuer(args: {
    readonly record: CapabilityIssuerRecord;
    readonly registration_authority_id: string;
    readonly event_id: string;
    readonly evidence_ids: readonly string[];
    readonly expected_revision: number;
  }): CapabilityControlPlaneState {
    requireAuthority(
      this.#issuerAuthorities,
      args.registration_authority_id,
      "issuer registration"
    );
    requireNoErrors(validateCapabilityIssuerRecord(args.record), "issuer record");
    if (
      args.record.record_revision !== 1 ||
      args.record.verification_status !== "VERIFIED" ||
      args.record.lifecycle_state !== "ACTIVE"
    ) {
      throw new Error(
        "Initial issuer must be revision 1, VERIFIED, and ACTIVE."
      );
    }
    return this.store.commit(args.expected_revision, (state) => {
      if (
        state.issuers.some(({ issuer_id: id }) => id === args.record.issuer_id)
      ) {
        throw new Error("Issuer identity is already registered.");
      }
      return withEvent({
        state,
        event_id: args.event_id,
        event_type: "ISSUER_REGISTERED",
        subject_id: args.record.issuer_id,
        authority_id: args.registration_authority_id,
        evidence_ids: args.evidence_ids,
        timestamp: args.record.created_at,
        payload: args.record,
        changes: { issuers: [...state.issuers, args.record] },
      });
    });
  }

  issueEntitlement(args: {
    readonly record: PersistentEntitlementRecord;
    readonly issuer_trust: IssuerTrustDecision;
    readonly issuer_evidence: CapabilityGovernanceEvidenceRecord;
    readonly event_id: string;
    readonly expected_revision: number;
  }): CapabilityControlPlaneState {
    requireNoErrors(
      validatePersistentEntitlementRecord(args.record),
      "entitlement record"
    );
    if (args.record.record_revision !== 1 || args.record.status !== "ACTIVE") {
      throw new Error("Initial entitlement must be revision 1 and ACTIVE.");
    }
    requireNoErrors(
      validateIssuerTrustDecision(args.issuer_trust),
      "issuer trust decision"
    );
    requireNoErrors(
      validateGovernanceEvidenceRecord(args.issuer_evidence),
      "issuer trust evidence"
    );
    if (
      args.issuer_trust.outcome !== "TRUSTED" ||
      args.issuer_trust.issuer_id !== args.record.issuer_id ||
      args.issuer_trust.capability_id !== args.record.capability_id ||
      args.issuer_trust.organization_id !== args.record.organization_id ||
      args.issuer_trust.tenant_id !== args.record.tenant_id ||
      args.issuer_trust.operation !== "entitlement.issue" ||
      args.issuer_trust.timestamp !== args.record.issued_at ||
      args.issuer_evidence.subject_id !== args.issuer_trust.decision_id ||
      args.issuer_evidence.event_id !== args.issuer_trust.decision_id ||
      args.issuer_evidence.authority_id !==
        args.issuer_trust.authority_identity ||
      !args.issuer_evidence.source_evidence_ids.includes(
        args.issuer_trust.digest
      )
    ) {
      throw new Error("Entitlement issuer trust binding is invalid.");
    }
    return this.store.commit(args.expected_revision, (state) => {
      if (
        state.entitlements.some(
          ({ entitlement_id: id }) => id === args.record.entitlement_id
        )
      ) {
        throw new Error("Entitlement identity is already registered.");
      }
      const capabilities = latestById(
        state.capabilities,
        ({ capability_id: id }) => id,
        ({ record_revision: revision }) => revision
      );
      const capability = capabilities.get(args.record.capability_id);
      if (
        !capability ||
        (capability.lifecycle_state !== "AVAILABLE" &&
          capability.lifecycle_state !== "ACTIVATED")
      ) {
        throw new Error("Entitlement capability is not available.");
      }
      for (const dependencyId of capability.dependencies) {
        const dependency = capabilities.get(dependencyId);
        if (
          !dependency ||
          (dependency.lifecycle_state !== "AVAILABLE" &&
            dependency.lifecycle_state !== "ACTIVATED")
        ) {
          throw new Error(
            `Entitlement capability dependency is unavailable: ${dependencyId}.`
          );
        }
      }
      const currentEntitlements = latestById(
        state.entitlements,
        ({ entitlement_id: id }) => id,
        ({ record_revision: revision }) => revision
      );
      const duplicateGrant = [...currentEntitlements.values()].some(
        (record) =>
          record.status === "ACTIVE" &&
          record.subject_id === args.record.subject_id &&
          record.capability_id === args.record.capability_id &&
          record.organization_id === args.record.organization_id &&
          record.tenant_id === args.record.tenant_id &&
          (record.expires_at === null ||
            Date.parse(record.expires_at) > Date.parse(args.record.issued_at))
      );
      if (duplicateGrant) {
        throw new Error("Duplicate active entitlement grant is prohibited.");
      }
      if (
        state.evidence.some(
          ({ evidence_id: id }) => id === args.issuer_evidence.evidence_id
        )
      ) {
        throw new Error("Issuer trust evidence identity already exists.");
      }
      const issuer = latestById(
        state.issuers,
        ({ issuer_id: id }) => id,
        ({ record_revision: revision }) => revision
      ).get(args.record.issuer_id);
      this.requireTrustedIssuer(issuer, args.record);
      return withEvent({
        state,
        event_id: args.event_id,
        event_type: "ENTITLEMENT_ISSUED",
        subject_id: args.record.entitlement_id,
        authority_id: args.record.issuer_id,
        evidence_ids: [
          args.record.evidence_reference,
          args.issuer_evidence.evidence_id,
        ],
        timestamp: args.record.issued_at,
        payload: {
          entitlement: args.record,
          issuer_trust: args.issuer_trust,
          issuer_evidence: args.issuer_evidence,
        },
        changes: {
          entitlements: [...state.entitlements, args.record],
          evidence: [...state.evidence, args.issuer_evidence],
        },
      });
    });
  }

  revoke(args: {
    readonly record: CapabilityRevocationRecord;
    readonly validation_ids: readonly string[];
    readonly expected_revision: number;
  }): CapabilityControlPlaneState {
    requireAuthority(
      this.#revocationAuthorities,
      args.record.authority_id,
      "revocation"
    );
    requireNoErrors(
      validateCapabilityRevocationRecord(args.record),
      "revocation record"
    );
    if (args.validation_ids.length === 0) {
      throw new Error("Revocation requires validation.");
    }
    return this.store.commit(args.expected_revision, (state) => {
      if (
        state.revocations.some(
          ({ revocation_id: id }) => id === args.record.revocation_id
        )
      ) {
        throw new Error("Revocation identity already exists.");
      }
      const changes = this.revocationProjection(state, args.record, args.validation_ids);
      return withEvent({
        state,
        event_id: args.record.revocation_id,
        event_type: "REVOCATION_RECORDED",
        subject_id: args.record.target_id,
        authority_id: args.record.authority_id,
        evidence_ids: args.record.evidence_ids,
        timestamp: args.record.revoked_at,
        payload: args.record,
        changes: {
          ...changes,
          revocations: [...state.revocations, args.record],
        },
      });
    });
  }

  recordActivationDecision(args: {
    readonly record: CapabilityActivationDecisionRecord;
    readonly evidence: CapabilityGovernanceEvidenceRecord;
    readonly authority_id: string;
    readonly expected_revision: number;
  }): CapabilityControlPlaneState {
    requireAuthority(
      this.#decisionAuthorities,
      args.authority_id,
      "activation decision"
    );
    requireNoErrors(
      validateActivationDecisionRecord(args.record),
      "activation decision"
    );
    requireNoErrors(
      validateGovernanceEvidenceRecord(args.evidence),
      "activation evidence"
    );
    if (
      args.evidence.subject_id !== args.record.decision_id ||
      args.evidence.event_id !== args.record.decision_id ||
      args.evidence.authority_id !== args.authority_id ||
      args.record.evidence_digest !== args.evidence.content_digest
    ) {
      throw new Error("Activation decision evidence binding is invalid.");
    }
    return this.store.commit(args.expected_revision, (state) => {
      if (
        state.activation_decisions.some(
          ({ decision_id: id }) => id === args.record.decision_id
        ) ||
        state.evidence.some(
          ({ evidence_id: id }) => id === args.evidence.evidence_id
        )
      ) {
        throw new Error("Activation decision or evidence identity already exists.");
      }
      return withEvent({
        state,
        event_id: args.record.decision_id,
        event_type: "ACTIVATION_DECISION_RECORDED",
        subject_id: args.record.decision_id,
        authority_id: args.authority_id,
        evidence_ids: [args.evidence.evidence_id],
        timestamp: args.record.timestamp,
        payload: { decision: args.record, evidence: args.evidence },
        changes: {
          activation_decisions: [
            ...state.activation_decisions,
            args.record,
          ],
          evidence: [...state.evidence, args.evidence],
        },
      });
    });
  }

  recordEvidence(args: {
    readonly record: CapabilityGovernanceEvidenceRecord;
    readonly expected_revision: number;
  }): CapabilityControlPlaneState {
    requireAuthority(
      this.#evidenceAuthorities,
      args.record.authority_id,
      "evidence recording"
    );
    requireNoErrors(
      validateGovernanceEvidenceRecord(args.record),
      "governance evidence"
    );
    return this.store.commit(args.expected_revision, (state) => {
      if (
        state.evidence.some(
          ({ evidence_id: id }) => id === args.record.evidence_id
        )
      ) {
        throw new Error("Governance evidence identity already exists.");
      }
      return withEvent({
        state,
        event_id: args.record.event_id,
        event_type: "EVIDENCE_RECORDED",
        subject_id: args.record.subject_id,
        authority_id: args.record.authority_id,
        evidence_ids: args.record.source_evidence_ids,
        timestamp: args.record.recorded_at,
        payload: args.record,
        changes: { evidence: [...state.evidence, args.record] },
      });
    });
  }

  eligibleEntitlement(args: {
    readonly entitlement_id: string;
    readonly subject_id: string;
    readonly capability_id: string;
    readonly organization_id: string | null;
    readonly tenant_id: string | null;
    readonly evaluated_at: string;
  }): PersistentEntitlementRecord {
    const state = this.store.load();
    const record = latestById(
      state.entitlements,
      ({ entitlement_id: id }) => id,
      ({ record_revision: revision }) => revision
    ).get(args.entitlement_id);
    if (!record) throw new Error("Entitlement is unavailable.");
    if (
      record.subject_id !== args.subject_id ||
      record.capability_id !== args.capability_id ||
      record.organization_id !== args.organization_id ||
      record.tenant_id !== args.tenant_id
    ) {
      throw new Error("Entitlement identity or tenant scope does not match.");
    }
    const evaluatedAt = Date.parse(args.evaluated_at);
    if (
      record.status !== "ACTIVE" ||
      (record.expires_at !== null &&
        Date.parse(record.expires_at) <= evaluatedAt)
    ) {
      throw new Error("Entitlement is expired, suspended, or revoked.");
    }
    const blocked = state.revocations.some(
      (revocation) =>
        Date.parse(revocation.revoked_at) <= evaluatedAt &&
        ((revocation.target_type === "ENTITLEMENT" &&
          revocation.target_id === record.entitlement_id) ||
          (revocation.target_type === "ISSUER" &&
            revocation.target_id === record.issuer_id) ||
          (revocation.target_type === "CAPABILITY" &&
            revocation.target_id === record.capability_id) ||
          (revocation.target_type === "ORGANIZATION" &&
            revocation.target_id === record.organization_id))
    );
    if (blocked) throw new Error("Entitlement is blocked by revocation.");
    const capabilities = latestById(
      state.capabilities,
      ({ capability_id: id }) => id,
      ({ record_revision: revision }) => revision
    );
    const capability = capabilities.get(record.capability_id);
    if (
      !capability ||
      (capability.lifecycle_state !== "AVAILABLE" &&
        capability.lifecycle_state !== "ACTIVATED")
    ) {
      throw new Error("Entitlement capability is not currently available.");
    }
    for (const dependencyId of capability.dependencies) {
      const dependency = capabilities.get(dependencyId);
      if (
        !dependency ||
        (dependency.lifecycle_state !== "AVAILABLE" &&
          dependency.lifecycle_state !== "ACTIVATED")
      ) {
        throw new Error("Entitlement capability dependency is unavailable.");
      }
    }
    const issuer = latestById(
      state.issuers,
      ({ issuer_id: id }) => id,
      ({ record_revision: revision }) => revision
    ).get(record.issuer_id);
    if (
      !issuer ||
      issuer.verification_status !== "VERIFIED" ||
      issuer.lifecycle_state !== "ACTIVE" ||
      Date.parse(issuer.valid_from) > evaluatedAt ||
      (issuer.expires_at !== null &&
        Date.parse(issuer.expires_at) <= evaluatedAt)
    ) {
      throw new Error("Entitlement issuer is not currently trusted.");
    }
    return record;
  }

  health(): CapabilityControlPlaneHealth {
    const state = this.store.load();
    const capabilities = latestById(
      state.capabilities,
      ({ capability_id: id }) => id,
      ({ record_revision: revision }) => revision
    );
    const entitlements = latestById(
      state.entitlements,
      ({ entitlement_id: id }) => id,
      ({ record_revision: revision }) => revision
    );
    const issuers = latestById(
      state.issuers,
      ({ issuer_id: id }) => id,
      ({ record_revision: revision }) => revision
    );
    return {
      revision: state.revision,
      capability_count: capabilities.size,
      available_capability_count: [...capabilities.values()].filter(
        ({ lifecycle_state: status }) =>
          status === "AVAILABLE" || status === "ACTIVATED"
      ).length,
      active_entitlement_count: [...entitlements.values()].filter(
        ({ status }) => status === "ACTIVE"
      ).length,
      revoked_entitlement_count: [...entitlements.values()].filter(
        ({ status }) => status === "REVOKED"
      ).length,
      trusted_issuer_count: [...issuers.values()].filter(
        ({ verification_status: verification, lifecycle_state: lifecycle }) =>
          verification === "VERIFIED" && lifecycle === "ACTIVE"
      ).length,
      activation_decision_count: state.activation_decisions.length,
      security_event_count: state.revocations.length,
      latest_event_digest:
        state.events.length === 0
          ? null
          : state.events[state.events.length - 1].event_digest,
      state_digest: state.state_digest,
    };
  }

  private requireTrustedIssuer(
    issuer: CapabilityIssuerRecord | undefined,
    entitlement: PersistentEntitlementRecord
  ): void {
    if (!issuer) throw new Error("Entitlement issuer is unknown.");
    if (
      issuer.verification_status !== "VERIFIED" ||
      issuer.lifecycle_state !== "ACTIVE" ||
      Date.parse(issuer.valid_from) > Date.parse(entitlement.issued_at) ||
      (issuer.expires_at !== null &&
        Date.parse(issuer.expires_at) <= Date.parse(entitlement.issued_at))
    ) {
      throw new Error("Entitlement issuer is not trusted or current.");
    }
    if (
      !issuer.authority_scope.includes("entitlement.issue") ||
      !issuer.allowed_capabilities.includes(entitlement.capability_id)
    ) {
      throw new Error("Entitlement issuer scope does not permit capability.");
    }
    if (
      issuer.organization !== entitlement.organization_id ||
      issuer.tenant_id !== entitlement.tenant_id
    ) {
      throw new Error("Entitlement issuer organization or tenant scope differs.");
    }
  }

  private revocationProjection(
    state: CapabilityControlPlaneState,
    revocation: CapabilityRevocationRecord,
    validationIds: readonly string[]
  ): Partial<
    Pick<
      CapabilityControlPlaneState,
      "capabilities" | "capability_transitions" | "entitlements" | "issuers"
    >
  > {
    if (revocation.target_type === "ENTITLEMENT") {
      const current = latestById(
        state.entitlements,
        ({ entitlement_id: id }) => id,
        ({ record_revision: revision }) => revision
      ).get(revocation.target_id);
      if (!current) throw new Error("Revocation entitlement target is unknown.");
      const next = createPersistentEntitlementRecord({
        record_revision: current.record_revision + 1,
        entitlement_id: current.entitlement_id,
        subject_id: current.subject_id,
        organization_id: current.organization_id,
        tenant_id: current.tenant_id,
        capability_id: current.capability_id,
        issuer_id: current.issuer_id,
        source_type: current.source_type,
        status: "REVOKED",
        issued_at: current.issued_at,
        expires_at: current.expires_at,
        revoked_at: revocation.revoked_at,
        policy_reference: current.policy_reference,
        evidence_reference: current.evidence_reference,
      });
      return { entitlements: [...state.entitlements, next] };
    }
    if (revocation.target_type === "ISSUER") {
      const current = latestById(
        state.issuers,
        ({ issuer_id: id }) => id,
        ({ record_revision: revision }) => revision
      ).get(revocation.target_id);
      if (!current) throw new Error("Revocation issuer target is unknown.");
      const next = createCapabilityIssuerRecord({
        record_revision: current.record_revision + 1,
        issuer_id: current.issuer_id,
        identity: current.identity,
        organization: current.organization,
        tenant_id: current.tenant_id,
        authority_scope: current.authority_scope,
        allowed_capabilities: current.allowed_capabilities,
        verification_status: "REVOKED",
        lifecycle_state: "SUSPENDED",
        issued_credentials: current.issued_credentials,
        valid_from: current.valid_from,
        expires_at: current.expires_at,
        created_at: current.created_at,
        updated_at: revocation.revoked_at,
      });
      return { issuers: [...state.issuers, next] };
    }
    if (revocation.target_type === "CAPABILITY") {
      const current = latestById(
        state.capabilities,
        ({ capability_id: id }) => id,
        ({ record_revision: revision }) => revision
      ).get(revocation.target_id);
      if (!current) throw new Error("Revocation capability target is unknown.");
      if (
        current.lifecycle_state !== "AVAILABLE" &&
        current.lifecycle_state !== "ACTIVATED"
      ) {
        throw new Error("Capability cannot be suspended from current state.");
      }
      const transition = createCapabilityLifecycleTransitionRecord({
        transition_id: `${revocation.revocation_id}.TRANSITION`,
        capability_id: current.capability_id,
        previous_state: current.lifecycle_state,
        new_state: "SUSPENDED",
        authorized_actor: revocation.authority_id,
        reason: revocation.reason,
        evidence_ids: revocation.evidence_ids,
        validation_ids: validationIds,
        timestamp: revocation.revoked_at,
      });
      const next = reviseCapability(
        current,
        "SUSPENDED",
        revocation.revoked_at
      );
      return {
        capabilities: [...state.capabilities, next],
        capability_transitions: [
          ...state.capability_transitions,
          transition,
        ],
      };
    }
    const organizationExists =
      state.issuers.some(
        ({ organization }) => organization === revocation.target_id
      ) ||
      state.entitlements.some(
        ({ organization_id: id }) => id === revocation.target_id
      );
    if (!organizationExists) {
      throw new Error("Revocation organization target is unknown.");
    }
    return {};
  }
}

export function createDurableCapabilityControlPlane(
  path: string,
  authorities: CapabilityControlPlaneAuthorities
): DurableCapabilityControlPlane {
  return new DurableCapabilityControlPlane(
    new CapabilityControlPlaneStore(path),
    authorities
  );
}
