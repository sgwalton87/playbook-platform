import {
  validateAuthorityEnvelope,
  validateIdentityEnvelope,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../kernel/contracts";
import { artifactDigest } from "../kernel/identity";
import type {
  CapabilityActivationDecision,
  CapabilityActivationOutcome,
  CapabilityActivationRequest,
  CapabilityDefinition,
  CapabilityPolicy,
  EntitlementRecord,
} from "./types";
import {
  CapabilityPolicyRegistry,
  CapabilityRegistry,
  EntitlementRegistry,
} from "./registry";
import {
  validateCapabilityDefinition,
  validateCapabilityPolicy,
  validateEntitlementRecord,
} from "./validator";

interface Evaluation {
  readonly outcome: CapabilityActivationOutcome;
  readonly findings: readonly string[];
  readonly entitlement: EntitlementRecord | null;
  readonly policy: CapabilityPolicy | null;
  readonly evidenceIds: readonly string[];
}

function isExpired(expiresAt: string | null, evaluatedAt: number): boolean {
  return expiresAt !== null && Date.parse(expiresAt) <= evaluatedAt;
}

function validateEngineAdmission(
  request: CapabilityActivationRequest,
  definition: CapabilityDefinition
): string[] {
  const errors: string[] = [];
  requireDigest(
    errors,
    "engine_admission.manifest_digest",
    request.engine_admission.manifest_digest
  );
  requireDigest(
    errors,
    "engine_admission.decision_digest",
    request.engine_admission.decision_digest
  );
  const body = {
    request_id: request.engine_admission.request_id,
    engine_id: request.engine_admission.engine_id,
    manifest_digest: request.engine_admission.manifest_digest,
    status: request.engine_admission.status,
    findings: request.engine_admission.findings,
  };
  if (request.engine_admission.decision_digest !== artifactDigest(body)) {
    errors.push("engine admission decision digest does not match content.");
  }
  if (
    request.engine_admission.status !== "ADMITTED" ||
    request.engine_admission.engine_id !== definition.owning_engine_id ||
    request.engine_admission.findings.length > 0
  ) {
    errors.push("owning engine is not admitted.");
  }
  return errors;
}

function evaluateEntitlement(
  records: readonly EntitlementRecord[],
  requestedAt: number
): {
  outcome: CapabilityActivationOutcome | null;
  findings: string[];
  entitlement: EntitlementRecord | null;
} {
  if (records.length === 0) {
    return {
      outcome: "DENY",
      findings: ["capability entitlement is unavailable."],
      entitlement: null,
    };
  }
  const active = records.filter(
    (record) =>
      record.status === "ACTIVE" &&
      Date.parse(record.effective_at) <= requestedAt &&
      !isExpired(record.expires_at, requestedAt)
  );
  if (active.length > 1) {
    return {
      outcome: "REQUIRES_REVIEW",
      findings: ["multiple active entitlements require review."],
      entitlement: null,
    };
  }
  if (active.length === 1) {
    return { outcome: null, findings: [], entitlement: active[0] };
  }
  if (records.some(({ status }) => status === "SUSPENDED")) {
    return {
      outcome: "SUSPEND",
      findings: ["capability entitlement is suspended."],
      entitlement: null,
    };
  }
  if (
    records.some(
      (record) =>
        record.status === "EXPIRED" ||
        isExpired(record.expires_at, requestedAt)
    )
  ) {
    return {
      outcome: "EXPIRED",
      findings: ["capability entitlement is expired."],
      entitlement: null,
    };
  }
  return {
    outcome: "DENY",
    findings: ["capability entitlement is not active."],
    entitlement: null,
  };
}

function evaluatePolicy(args: {
  policy: CapabilityPolicy;
  definition: CapabilityDefinition;
  entitlement: EntitlementRecord;
  request: CapabilityActivationRequest;
  requestedAt: number;
}): string[] {
  const { policy, definition, entitlement, request, requestedAt } = args;
  const findings = [...validateCapabilityPolicy(policy).errors];
  if (
    policy.capability_id !== definition.capability_id ||
    policy.capability_definition_digest !== definition.definition_digest
  ) {
    findings.push("capability policy identity does not match definition.");
  }
  if (
    !policy.allowed_beneficiary_types.includes(entitlement.beneficiary_type) ||
    !policy.allowed_sources.includes(entitlement.source)
  ) {
    findings.push("entitlement is not permitted by capability policy.");
  }
  if (
    policy.status !== "ACTIVE" ||
    Date.parse(policy.effective_at) > requestedAt ||
    isExpired(policy.expires_at, requestedAt)
  ) {
    findings.push("capability policy is not active.");
  }
  const permissions = new Set(request.authority.permissionIds);
  for (const id of policy.required_permission_ids) {
    if (!permissions.has(id)) {
      findings.push(`capability permission unavailable: ${id}.`);
    }
  }
  return findings;
}

export class EntitlementEngine {
  constructor(
    private readonly capabilities: CapabilityRegistry,
    private readonly entitlements: EntitlementRegistry,
    private readonly policies: CapabilityPolicyRegistry
  ) {}

  evaluate(request: CapabilityActivationRequest): CapabilityActivationDecision {
    const baseFindings: string[] = [];
    requireIdentifier(baseFindings, "request.request_id", request.request_id);
    requireIdentifier(baseFindings, "request.subject_id", request.subject_id);
    requireIdentifier(
      baseFindings,
      "request.capability_id",
      request.capability_id
    );
    requireTimestamp(baseFindings, "request.requested_at", request.requested_at);
    requireIdentifiers(
      baseFindings,
      "request.available_evidence_ids",
      request.available_evidence_ids
    );
    requireIdentifiers(
      baseFindings,
      "request.available_security_requirement_ids",
      request.available_security_requirement_ids
    );
    baseFindings.push(...validateIdentityEnvelope(request.identity).errors);
    baseFindings.push(...validateAuthorityEnvelope(request.authority).errors);

    const definition = this.capabilities.get(request.capability_id);
    const evaluation =
      baseFindings.length > 0
        ? {
            outcome: "DENY" as const,
            findings: baseFindings,
            entitlement: null,
            policy: null,
            evidenceIds: [],
          }
        : definition
      ? this.evaluateKnownCapability(request, definition, baseFindings)
      : {
          outcome: "DENY" as const,
          findings: [...baseFindings, "capability is not registered."],
          entitlement: null,
          policy: null,
          evidenceIds: [],
        };
    return this.decision(request, definition, evaluation);
  }

  private evaluateKnownCapability(
    request: CapabilityActivationRequest,
    definition: CapabilityDefinition,
    initialFindings: readonly string[]
  ): Evaluation {
    const findings = [
      ...initialFindings,
      ...validateCapabilityDefinition(definition).errors,
    ];
    const requestedAt = Date.parse(request.requested_at);
    if (
      definition.lifecycle_state !== "AVAILABLE" &&
      definition.lifecycle_state !== "ACTIVATED"
    ) {
      return {
        outcome:
          definition.lifecycle_state === "SUSPENDED" ? "SUSPEND" : "DENY",
        findings: [...findings, "capability is not available."],
        entitlement: null,
        policy: null,
        evidenceIds: [],
      };
    }
    const scoped = this.entitlements.find(
      definition.capability_id,
      request.subject_id
    );
    const entitlementEvaluation = evaluateEntitlement(scoped, requestedAt);
    if (!entitlementEvaluation.entitlement) {
      return {
        outcome: entitlementEvaluation.outcome ?? "DENY",
        findings: [...findings, ...entitlementEvaluation.findings],
        entitlement: null,
        policy: null,
        evidenceIds: [],
      };
    }
    const entitlement = entitlementEvaluation.entitlement;
    findings.push(...validateEntitlementRecord(entitlement).errors);
    if (
      entitlement.capability_definition_digest !== definition.definition_digest
    ) {
      findings.push("entitlement capability identity does not match definition.");
    }
    const organizationId = request.identity.organization?.id ?? null;
    const tenantId = request.identity.tenant?.id ?? null;
    if (
      entitlement.organization_id !== organizationId ||
      entitlement.tenant_id !== tenantId
    ) {
      findings.push("entitlement organization or tenant scope does not match.");
    }
    if (
      request.identity.actor.id !== request.subject_id ||
      request.authority.actorId !== request.identity.actor.id ||
      request.authority.subjectId !== definition.capability_id ||
      request.authority.ownerId !== definition.owner ||
      request.authority.scope.organizationId !== organizationId ||
      request.authority.scope.tenantId !== tenantId
    ) {
      findings.push("capability identity or authority binding does not match.");
    }
    if (
      Date.parse(request.authority.issuedAt) > requestedAt ||
      isExpired(request.authority.expiresAt, requestedAt) ||
      Date.parse(request.identity.actor.issuedAt) > requestedAt ||
      isExpired(request.identity.actor.expiresAt, requestedAt)
    ) {
      findings.push("capability identity or authority is not current.");
    }
    if (
      !request.authority.scope.resourceIds.includes(definition.capability_id) ||
      !request.authority.scope.operations.includes("capability.activate")
    ) {
      findings.push("capability activation authority scope is unavailable.");
    }
    findings.push(...validateEngineAdmission(request, definition));
    for (const dependencyId of definition.dependencies) {
      const dependency = this.capabilities.get(dependencyId);
      if (
        !dependency ||
        (dependency.lifecycle_state !== "AVAILABLE" &&
          dependency.lifecycle_state !== "ACTIVATED")
      ) {
        findings.push(`capability dependency unavailable: ${dependencyId}.`);
      }
    }
    if (entitlement.policy_ids.length !== 1) {
      return {
        outcome: findings.length === 0 ? "REQUIRES_REVIEW" : "DENY",
        findings: [...findings, "entitlement policy identity is ambiguous."],
        entitlement,
        policy: null,
        evidenceIds: [...entitlement.evidence_ids],
      };
    }
    const policy = this.policies.get(entitlement.policy_ids[0]);
    if (!policy) {
      findings.push("capability policy is unavailable.");
    } else {
      findings.push(
        ...evaluatePolicy({
          policy,
          definition,
          entitlement,
          request,
          requestedAt,
        })
      );
    }
    const evidence = new Set(request.available_evidence_ids);
    const security = new Set(request.available_security_requirement_ids);
    for (const id of definition.security_requirements) {
      if (!security.has(id)) {
        findings.push(`capability security requirement unavailable: ${id}.`);
      }
    }
    const requiredEvidence = [
      ...definition.evidence_requirements,
      ...entitlement.evidence_ids,
      ...(policy?.required_evidence_ids ?? []),
    ];
    const missingEvidence = requiredEvidence.filter((id) => !evidence.has(id));
    if (missingEvidence.length > 0) {
      return {
        outcome: findings.length === 0 ? "REQUIRES_REVIEW" : "DENY",
        findings: [
          ...findings,
          ...missingEvidence.map(
            (id) => `capability evidence unavailable: ${id}.`
          ),
        ],
        entitlement,
        policy,
        evidenceIds: requiredEvidence,
      };
    }
    return {
      outcome: findings.length === 0 ? "ALLOW" : "DENY",
      findings,
      entitlement,
      policy,
      evidenceIds: requiredEvidence,
    };
  }

  private decision(
    request: CapabilityActivationRequest,
    definition: CapabilityDefinition | null,
    evaluation: Evaluation
  ): CapabilityActivationDecision {
    const body = {
      request_id: request.request_id,
      capability_id: request.capability_id,
      subject_id: request.subject_id,
      capability_definition_digest: definition?.definition_digest ?? null,
      entitlement_id: evaluation.entitlement?.entitlement_id ?? null,
      entitlement_digest: evaluation.entitlement?.record_digest ?? null,
      policy_id: evaluation.policy?.policy_id ?? null,
      engine_admission_digest: request.engine_admission.decision_digest,
      outcome: evaluation.outcome,
      findings: evaluation.findings,
      evidence_ids: evaluation.evidenceIds,
      evaluated_at: request.requested_at,
    };
    return { ...body, decision_digest: artifactDigest(body) };
  }
}
