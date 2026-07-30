import { artifactDigest } from "../../kernel/identity";
import type { ArchitectureDecisionRecord } from "./types";

export function recordArchitectureDecision(
  input: Omit<ArchitectureDecisionRecord, "digest">
): ArchitectureDecisionRecord {
  if (
    !input.owner ||
    !input.authority ||
    input.rationale.evidence.length === 0 ||
    input.rationale.summary.length === 0
  ) {
    throw new Error("Architecture decision authority or evidence is missing.");
  }
  const body = {
    ...input,
    alternatives: [...input.alternatives].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
