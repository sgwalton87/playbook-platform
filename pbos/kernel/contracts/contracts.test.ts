import { describe, expect, it } from "vitest";
import { artifactDigest } from "../identity";
import {
  validateGovernedActionEnvelope,
  type GovernedActionEnvelope,
} from "./action";

const timestamp = "2026-07-29T12:00:00.000Z";
const expiresAt = "2026-07-30T12:00:00.000Z";
const digest = artifactDigest({ subject: "SUBJECT-1" });

function governedAction(): GovernedActionEnvelope {
  return {
    version: "1.0.0",
    id: "ACTION-1",
    operation: "domain.evaluate",
    purpose: "Evaluate a governed domain action.",
    requestedAt: timestamp,
    correlationId: "CORRELATION-1",
    idempotencyKey: "IDEMPOTENCY-1",
    identity: {
      version: "1.0.0",
      actor: {
        id: "ACTOR-1",
        kind: "HUMAN",
        issuer: "IDENTITY-AUTHORITY-1",
        verificationStatus: "VERIFIED",
        ownerId: "ACTOR-1",
        organizationId: "ORGANIZATION-1",
        tenantId: "TENANT-1",
        lifecycleState: "ACTIVE",
        issuedAt: timestamp,
        verifiedAt: timestamp,
        expiresAt,
      },
      organization: {
        id: "ORGANIZATION-1",
        kind: "ORGANIZATION",
        issuer: "ORGANIZATION-AUTHORITY-1",
        verificationStatus: "VERIFIED",
        ownerId: "ORGANIZATION-1",
        organizationId: null,
        tenantId: null,
        lifecycleState: "ACTIVE",
        issuedAt: timestamp,
        verifiedAt: timestamp,
        expiresAt,
      },
      tenant: {
        id: "TENANT-1",
        kind: "TENANT",
        issuer: "ORGANIZATION-AUTHORITY-1",
        verificationStatus: "VERIFIED",
        ownerId: "ORGANIZATION-1",
        organizationId: "ORGANIZATION-1",
        tenantId: "TENANT-1",
        lifecycleState: "ACTIVE",
        issuedAt: timestamp,
        verifiedAt: timestamp,
        expiresAt,
      },
      service: null,
      partner: null,
    },
    subject: {
      id: "SUBJECT-1",
      engineId: "PBOS-ENGINE-009",
      domain: "organization-governance",
      type: "organization-policy",
      version: "1.0.0",
      digest,
      ownerId: "OWNER-1",
    },
    authority: {
      version: "1.0.0",
      id: "AUTHORITY-1",
      actorId: "ACTOR-1",
      subjectId: "SUBJECT-1",
      ownerId: "OWNER-1",
      delegationIds: ["DELEGATION-1"],
      permissionIds: ["PERMISSION-1"],
      approvalIds: ["APPROVAL-1"],
      policyDecisionIds: ["POLICY-1"],
      administrativeAuthorityId: null,
      scope: {
        organizationId: "ORGANIZATION-1",
        tenantId: "TENANT-1",
        environmentId: "ENVIRONMENT-1",
        region: "us-west",
        resourceIds: ["SUBJECT-1"],
        operations: ["domain.evaluate"],
      },
      status: "AUTHORIZED",
      issuedAt: timestamp,
      expiresAt,
    },
    policy: {
      version: "1.0.0",
      id: "POLICY-1",
      actionId: "ACTION-1",
      subjectId: "SUBJECT-1",
      policySourceIds: ["POLICY-SOURCE-1"],
      evaluatorId: "GOVERNANCE-ENFORCEMENT-1",
      evidenceIds: ["EVIDENCE-1"],
      requiredApprovalIds: ["APPROVAL-1"],
      restrictionIds: [],
      exceptionIds: [],
      escalationId: null,
      outcome: "ALLOW",
      evaluatedAt: timestamp,
      rationale: ["The exact action is permitted by current policy."],
    },
    lifecycle: {
      version: "1.0.0",
      id: "TRANSITION-1",
      subjectId: "SUBJECT-1",
      lifecycleDefinitionId: "LIFECYCLE-1",
      from: "REVIEWED",
      to: "APPROVED",
      authorityId: "AUTHORITY-1",
      evidenceIds: ["EVIDENCE-1"],
      validationIds: ["VALIDATION-1"],
      requestedAt: timestamp,
      expectedRevision: 1,
    },
    evidence: [
      {
        version: "1.0.0",
        id: "EVIDENCE-1",
        type: "governance-decision",
        issuerId: "GOVERNANCE-ENFORCEMENT-1",
        actorId: "ACTOR-1",
        actionId: "ACTION-1",
        subjectId: "SUBJECT-1",
        authorityId: "AUTHORITY-1",
        decisionIds: ["POLICY-1"],
        validationIds: ["VALIDATION-1"],
        certificationIds: ["CERTIFICATION-1"],
        historicalReferenceIds: [],
        organizationId: "ORGANIZATION-1",
        tenantId: "TENANT-1",
        uri: "pbos://evidence/EVIDENCE-1",
        digest: artifactDigest({ evidence: "EVIDENCE-1" }),
        occurredAt: timestamp,
        capturedAt: timestamp,
        classification: "CONFIDENTIAL",
      },
    ],
    certification: [
      {
        version: "1.0.0",
        id: "CERTIFICATION-1",
        issuerId: "CERTIFICATION-AUTHORITY-1",
        subjectId: "SUBJECT-1",
        subjectDigest: digest,
        evidenceIds: ["EVIDENCE-1"],
        validationIds: ["VALIDATION-1"],
        organizationId: "ORGANIZATION-1",
        tenantId: "TENANT-1",
        conditions: [],
        status: "CERTIFIED",
        issuedAt: timestamp,
        expiresAt,
        revocationId: null,
        supersedesId: null,
      },
    ],
    recovery: {
      version: "1.0.0",
      id: "RECOVERY-1",
      actionId: "ACTION-1",
      incidentId: "INCIDENT-1",
      affectedSubjectIds: ["SUBJECT-1"],
      recoveryPlanId: "RECOVERY-PLAN-1",
      authorityId: "AUTHORITY-1",
      checkpointIds: ["CHECKPOINT-1"],
      evidenceIds: ["EVIDENCE-1"],
      validationIds: ["VALIDATION-1"],
      certificationIds: ["CERTIFICATION-1"],
      rollbackAllowed: true,
      compensationRequired: false,
      requestedAt: timestamp,
      status: "CERTIFIED",
    },
    validationRequirementIds: ["VALIDATION-RULE-1"],
  };
}

describe("PBOS enterprise Kernel contracts", () => {
  it("accepts a complete domain-neutral governed action", () => {
    expect(validateGovernedActionEnvelope(governedAction())).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("is deterministic and does not mutate the action", () => {
    const action = governedAction();
    const before = JSON.stringify(action);
    expect(validateGovernedActionEnvelope(action)).toEqual(
      validateGovernedActionEnvelope(action)
    );
    expect(JSON.stringify(action)).toBe(before);
  });

  it("fails closed for unverified actor identity", () => {
    const original = governedAction();
    const action: GovernedActionEnvelope = {
      ...original,
      identity: {
        ...original.identity,
        actor: {
          ...original.identity.actor,
          verificationStatus: "UNVERIFIED",
        },
      },
    };
    const result = validateGovernedActionEnvelope(action);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("identity must be VERIFIED and ACTIVE.");
  });

  it("fails closed for authority, policy, or certification denial", () => {
    const original = governedAction();
    const certification = original.certification[0];
    const action: GovernedActionEnvelope = {
      ...original,
      authority: { ...original.authority, status: "DENIED" },
      policy: { ...original.policy, outcome: "BLOCK" },
      certification: [
        {
          ...certification,
          status: "REVOKED",
          revocationId: "REVOCATION-1",
        },
      ],
    };
    const result = validateGovernedActionEnvelope(action);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "authority status must be AUTHORIZED.",
        "policy outcome must be ALLOW.",
        "certification status must be CERTIFIED.",
        "certification cannot have a revocation reference.",
      ])
    );
  });

  it("fails closed when identity, tenant, subject, or action references conflict", () => {
    const original = governedAction();
    const evidence = original.evidence[0];
    const action: GovernedActionEnvelope = {
      ...original,
      identity: {
        ...original.identity,
        actor: { ...original.identity.actor, tenantId: "TENANT-OTHER" },
      },
      authority: { ...original.authority, subjectId: "SUBJECT-OTHER" },
      policy: { ...original.policy, actionId: "ACTION-OTHER" },
      evidence: [
        { ...evidence, organizationId: "ORGANIZATION-OTHER" },
      ],
    };
    const result = validateGovernedActionEnvelope(action);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "actor tenant identity does not match envelope.",
        "action subject identity does not match nested contracts.",
        "nested action identity does not match action.",
        "evidence identity or scope does not match action.",
      ])
    );
  });

  it("requires lifecycle, evidence, validation, certification, and recovery proof", () => {
    const original = governedAction();
    if (!original.lifecycle) {
      throw new Error("Expected lifecycle contract.");
    }
    const action: GovernedActionEnvelope = {
      ...original,
      lifecycle: {
        ...original.lifecycle,
        evidenceIds: [],
        validationIds: [],
      },
      evidence: [],
      certification: [],
      recovery: { ...original.recovery, evidenceIds: [] },
      validationRequirementIds: [],
    };
    const result = validateGovernedActionEnvelope(action);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "action requires at least one validation requirement.",
        "action requires evidence.",
        "action requires certification.",
        "lifecycle transition requires evidence.",
        "lifecycle transition requires validation.",
        "recovery requires evidence.",
      ])
    );
  });
});
