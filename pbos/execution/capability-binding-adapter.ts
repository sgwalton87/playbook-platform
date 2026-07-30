import type { ExecutionAuthorizationProof } from "../kernel/capability-execution-binding";
import { artifactDigest } from "../kernel/identity";
import type { ExecutionAuthorizationRecord } from "./authorization";
import { validateExecutionAuthorization } from "./authorization";
import type { ExecutionContract } from "./contracts";
import type { CodexWorkPackage } from "./work-package";

export function createExecutionAuthorizationProof(
  authorization: ExecutionAuthorizationRecord | undefined,
  contract: ExecutionContract,
  workPackage: CodexWorkPackage
): ExecutionAuthorizationProof {
  const validation = validateExecutionAuthorization(
    authorization,
    contract,
    workPackage
  );
  return {
    authorization_reference: authorization?.id ?? "MISSING",
    authorization_digest: artifactDigest(authorization ?? { missing: true }),
    status: authorization?.status ?? "INVALID",
    valid: validation.valid,
    findings: validation.errors,
    evidence_references: authorization?.evidenceReviewed ?? [],
  };
}
