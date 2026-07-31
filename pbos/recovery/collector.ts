import {
  assessAutonomousReadiness,
  discoverTrustedContext,
  loadTrustedBuildContext,
} from "../context/activation";
import { loadChangeBoundary } from "../context/change-boundary";
import { loadRepositoryContextArtifact } from "../context/loader";
import {
  loadContextRefreshApproval,
  validateAppliedContextRefreshApproval,
  validateContextRefreshApproval,
} from "../context/refresh";
import { loadLaunchApproval } from "../authority/launch";
import type { PBOSRecoveryEvidence } from "./types";

export function collectPBOSRecoveryEvidence(
  rootDir = process.cwd(),
  timestamp = new Date().toISOString()
): PBOSRecoveryEvidence {
  const discovery = discoverTrustedContext(rootDir, timestamp);
  const boundary = loadChangeBoundary(rootDir)?.latest ?? null;
  const launchApproval = loadLaunchApproval(rootDir)?.latest ?? null;
  const refreshApproval = loadContextRefreshApproval(rootDir)?.latest ?? null;
  const storedContext = loadRepositoryContextArtifact(rootDir);
  const trustedContext = loadTrustedBuildContext(rootDir)?.latest ?? null;
  const readiness = assessAutonomousReadiness({
    context: trustedContext,
    repository: discovery.assessment,
    timestamp,
  });
  const refreshValidation = refreshApproval
    ? refreshApproval.state === "APPLIED"
      ? validateAppliedContextRefreshApproval(
          refreshApproval,
          storedContext?.identity ?? null
        )
      : validateContextRefreshApproval({
          approval: refreshApproval,
          reconciliation: discovery.reconciliation,
          timestamp,
        })
    : null;
  const boundaryStatus = boundary
    ? discovery.activation_snapshot.change_boundary_valid
      ? "VALID" as const
      : "INVALID" as const
    : "MISSING" as const;
  const launchStatus = launchApproval
    ? discovery.activation_snapshot.launch_approval_valid
      ? "VALID" as const
      : "INVALID" as const
    : "MISSING" as const;
  const refreshStatus = refreshApproval
    ? refreshValidation?.valid
      ? "VALID" as const
      : "INVALID" as const
    : "MISSING" as const;
  const findings = [
    ...discovery.assessment.findings,
    ...discovery.reconciliation.differences.map(
      ({ code, resolution }) => `${code}: ${resolution}`
    ),
    ...(boundaryStatus === "INVALID"
      ? ["Current change boundary does not match repository reality."]
      : boundaryStatus === "MISSING"
        ? ["Current change boundary is missing."]
        : []),
    ...(launchStatus === "INVALID"
      ? ["Current launch approval does not match the active boundary."]
      : launchStatus === "MISSING"
        ? ["Current launch approval is missing."]
        : []),
    ...(refreshValidation?.findings ?? []),
  ];
  return {
    repository: {
      identity: discovery.assessment.repository_identity,
      branch: discovery.assessment.current_branch,
      commit: discovery.assessment.current_commit,
      working_tree: discovery.assessment.working_tree_state,
      artifact_state: discovery.assessment.artifact_state,
    },
    reconciliation: {
      reconciliation_state: discovery.reconciliation.state === "DETECTED" ||
        discovery.reconciliation.state === "ANALYZING" ||
        discovery.reconciliation.state === "RECONCILING"
        ? "REVIEW_REQUIRED"
        : discovery.reconciliation.state,
      previous_identity: discovery.reconciliation.previous_identity,
      proposed_identity: discovery.reconciliation.current_identity,
      stored_identity: storedContext?.identity ?? null,
      validation:
        discovery.reconciliation.state === "VERIFIED" ? "PASS" : "FAIL",
    },
    trusted:
      readiness.current_capability_level === "GOVERNED_PLANNING",
    trustedContextIdentity: trustedContext?.context_id ?? null,
    boundary: boundaryStatus,
    launchApproval: launchStatus,
    refreshApproval: refreshStatus,
    refreshApprovalState: refreshApproval?.state ?? null,
    findings: [...new Set(findings)],
  };
}
