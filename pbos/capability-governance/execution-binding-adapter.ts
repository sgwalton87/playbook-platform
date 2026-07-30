import type {
  CapabilityExecutionBindingEvidence,
  CapabilityExecutionEvidenceSink,
} from "../kernel/capability-execution-binding";
import { artifactDigest, canonicalJson } from "../kernel/identity";
import {
  createCapabilityGovernanceEvidenceRecord,
  type DurableCapabilityControlPlane,
} from "./persistence";

export class DurableCapabilityExecutionEvidenceSink
  implements CapabilityExecutionEvidenceSink
{
  constructor(private readonly controlPlane: DurableCapabilityControlPlane) {}

  record(
    evidence: CapabilityExecutionBindingEvidence,
    expectedControlPlaneRevision: number
  ): { readonly evidence_id: string; readonly persisted_revision: number } {
    const payload = canonicalJson(evidence);
    const state = this.controlPlane.recordEvidence({
      record: createCapabilityGovernanceEvidenceRecord({
        evidence_id: evidence.evidence_id,
        subject_id: evidence.decision.decision_id,
        event_id: evidence.decision.decision_id,
        authority_id: evidence.decision.kernel_authority,
        source_evidence_ids: [
          evidence.digest,
          evidence.decision.digest,
          ...evidence.source_evidence_references,
        ],
        payload,
        payload_digest: artifactDigest(payload),
        recorded_at: evidence.decision.timestamp,
      }),
      expected_revision: expectedControlPlaneRevision,
    });
    return {
      evidence_id: evidence.evidence_id,
      persisted_revision: state.revision,
    };
  }
}
