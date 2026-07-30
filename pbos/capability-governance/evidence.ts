import { artifactDigest } from "../kernel/identity";
import type {
  CapabilityActivationDecision,
  CapabilityDecisionEvidence,
} from "./types";

function cloneEvidence(
  evidence: CapabilityDecisionEvidence
): CapabilityDecisionEvidence {
  return {
    ...evidence,
    source_evidence_ids: [...evidence.source_evidence_ids],
  };
}

export class CapabilityDecisionEvidenceRecorder {
  readonly #history: CapabilityDecisionEvidence[] = [];

  record(args: {
    readonly evidence_id: string;
    readonly decision: CapabilityActivationDecision;
    readonly organization_id: string | null;
    readonly tenant_id: string | null;
  }): CapabilityDecisionEvidence {
    if (
      this.#history.some(
        ({ evidence_id: evidenceId }) => evidenceId === args.evidence_id
      )
    ) {
      throw new Error("Capability decision evidence identity already exists.");
    }
    const body = {
      evidence_id: args.evidence_id,
      request_id: args.decision.request_id,
      decision_digest: args.decision.decision_digest,
      capability_id: args.decision.capability_id,
      subject_id: args.decision.subject_id,
      organization_id: args.organization_id,
      tenant_id: args.tenant_id,
      outcome: args.decision.outcome,
      source_evidence_ids: [...args.decision.evidence_ids],
      recorded_at: args.decision.evaluated_at,
    };
    const evidence = {
      ...body,
      evidence_digest: artifactDigest(body),
    };
    this.#history.push(evidence);
    return cloneEvidence(evidence);
  }

  history(): readonly CapabilityDecisionEvidence[] {
    return this.#history.map(cloneEvidence);
  }
}
