import { artifactDigest } from "../kernel/identity";
import { validateTemporalIdentity } from "../temporal";
import type { EvidenceRecord, TruthLineage } from "./types";

export function createEvidenceRecord(
  input: Omit<EvidenceRecord, "digest">
): EvidenceRecord {
  const findings = [
    ...(!input.identity.id ? ["Evidence identity is missing."] : []),
    ...(!input.identity.authority ? ["Evidence authority is missing."] : []),
    ...(!input.created_by ? ["Evidence creator is missing."] : []),
    ...(!input.source.owner || !input.source.authority
      ? ["Evidence source authority is missing."]
      : []),
    ...(!input.content_digest || !input.source.source_digest
      ? ["Evidence digest is missing."]
      : []),
    ...validateTemporalIdentity(input.temporal),
    ...(input.validation.status === "PASS" &&
    (!input.validation.validator || !input.validation.validated_at)
      ? ["Passing evidence lacks validator identity or timestamp."]
      : []),
  ];
  if (findings.length > 0) {
    throw new Error(`Evidence rejected: ${findings.join(" ")}`);
  }
  const body = {
    ...input,
    lineage: [...input.lineage].sort((a, b) =>
      `${a.object_id}:${a.version}`.localeCompare(`${b.object_id}:${b.version}`)
    ),
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

export function buildTruthLineage(
  input: Omit<TruthLineage, "digest">
): TruthLineage {
  if (
    !input.decision.evidence_ids.includes(input.claim.id) ||
    input.action.decision_id !== input.decision.id ||
    input.outcome.action_id !== input.action.id ||
    input.claim.evidence_ids.length === 0 ||
    input.action.evidence_ids.length === 0 ||
    input.outcome.evidence_ids.length === 0
  ) {
    throw new Error("Truth lineage is incomplete or inconsistent.");
  }
  return { ...input, digest: artifactDigest(input) };
}
