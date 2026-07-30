import { artifactDigest } from "../../kernel/identity";
import type { PBOSSystemIntelligence } from "../../orchestration/intelligence";
import type { MissionAlignmentCheck } from "./types";

export function checkMissionAlignment(
  intelligence: PBOSSystemIntelligence
): MissionAlignmentCheck {
  const governanceConflicts = intelligence.governance.governance_conflicts.filter(
    (finding) =>
      /constitution|mission conflict|security violation|authority conflict|architecture conflict/i.test(
        finding
      )
  );
  const findings = [
    ...(intelligence.architecture.validation_status === "INVALID"
      ? ["Constitutional architecture validation is invalid."]
      : []),
    ...governanceConflicts,
  ];
  const body = {
    aligned: findings.length === 0,
    mission: "Advance the Playbook Platform through governed development" as const,
    findings,
    evidence: [
      intelligence.architecture.digest,
      intelligence.governance.digest,
      intelligence.validation.digest,
    ],
  };
  return { ...body, digest: artifactDigest(body) };
}
