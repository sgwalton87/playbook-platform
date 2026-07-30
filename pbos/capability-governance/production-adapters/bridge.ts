import {
  productionBridgeDecisionDigest,
  productionBridgeEvidenceDigest,
} from "./identity";
import type {
  CapabilityProductionBridgeDecision,
  CapabilityProductionBridgeEvidence,
  ProductionEvidenceAdapter,
  ProductionIdentityAdapter,
  ProductionObservabilityAdapter,
  ProductionRecoveryAdapter,
  ProductionStorageAdapter,
} from "./types";
import {
  validateProductionBridgeEvidence,
  validateProductionStorageAdapter,
} from "./validator";

export class CapabilityProductionBridgeAuthority {
  assess(args: {
    readonly bridge_id: string;
    readonly environment: string;
    readonly identity_id: string;
    readonly credential_reference: string;
    readonly issuer_id: string;
    readonly resource_id: string;
    readonly operation: string;
    readonly state_digest: string;
    readonly identity: ProductionIdentityAdapter;
    readonly storage: ProductionStorageAdapter;
    readonly evidence: ProductionEvidenceAdapter;
    readonly observability: ProductionObservabilityAdapter;
    readonly recovery: ProductionRecoveryAdapter;
    readonly observed_at: string;
  }): {
    readonly evidence: CapabilityProductionBridgeEvidence;
    readonly decision: CapabilityProductionBridgeDecision;
  } {
    const identityProofs = [
      args.identity.lookupIdentity(args.identity_id, args.observed_at),
      args.identity.verifyCredential(
        args.identity_id,
        args.credential_reference,
        args.observed_at
      ),
      args.identity.verifyIssuer(args.issuer_id, args.observed_at),
      args.identity.resolveAuthority(
        args.identity_id,
        args.resource_id,
        args.operation,
        args.observed_at
      ),
    ];
    const evidenceBody: CapabilityProductionBridgeEvidence = {
      bridge_id: args.bridge_id,
      environment: args.environment,
      identity: identityProofs,
      storage: args.storage.health(args.observed_at),
      evidence: args.evidence.verifyChain(args.resource_id, args.observed_at),
      observability: args.observability.health(args.observed_at),
      recovery: args.recovery.verifyState(
        args.state_digest,
        args.observed_at
      ),
      observed_at: args.observed_at,
      digest: "",
    };
    const evidence = {
      ...evidenceBody,
      digest: productionBridgeEvidenceDigest(evidenceBody),
    };
    const findings = [
      ...validateProductionStorageAdapter(args.storage),
      ...validateProductionBridgeEvidence(evidence),
    ];
    const decisionBody: CapabilityProductionBridgeDecision = {
      decision_id: `PRODUCTION-BRIDGE-${args.bridge_id}`,
      bridge_id: args.bridge_id,
      status: findings.length === 0 ? "READY" : "BLOCKED",
      findings,
      evidence_digest: evidence.digest,
      authority: "PBOS-CAPABILITY-PRODUCTION-BRIDGE",
      timestamp: args.observed_at,
      digest: "",
    };
    return {
      evidence,
      decision: {
        ...decisionBody,
        digest: productionBridgeDecisionDigest(decisionBody),
      },
    };
  }
}
