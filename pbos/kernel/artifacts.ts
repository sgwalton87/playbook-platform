/**
 * Canonical runtime artifact locations.
 *
 * Every PBOS engine should reference these constants instead of
 * hardcoding runtime file paths.
 */
export const Artifacts = {
  repository: "pbos/runtime/repository.json",
  planning: "pbos/runtime/next-gate.json",
  constitutionalPlanning: "pbos/runtime/constitutional-planning.json",
  validation: "pbos/runtime/validation.json",
  execution: "pbos/runtime/execution.json",
  executionContract: "pbos/runtime/execution-contract.json",
  workPackage: "pbos/runtime/work-package.json",
  executionAuthorization: "pbos/runtime/execution-authorization.json",
  executionAuthority: "pbos/runtime/execution-authority.json",
  executionAuthorityLedger: "pbos/runtime/execution-authority-ledger.json",
  executionApproval: "pbos/runtime/execution-approval.json",
  executionFabricAuthorization: "pbos/runtime/execution-fabric-authorization.json",
  executionAssignment: "pbos/runtime/execution-assignment.json",
  executionEvidence: "pbos/runtime/execution-evidence.json",
  executionTelemetry: "pbos/runtime/execution-telemetry.json",
  milestoneAdvancement: "pbos/runtime/milestone-advancement.json",
  repositoryContext: "pbos/runtime/repository-context.json",
  contextRefresh: "pbos/runtime/context-refresh.json",
  contextRefreshApproval: "pbos/runtime/context-refresh-approval.json",
  trustedBuildContext: "pbos/runtime/trusted-build-context.json",
  changeBoundary: "pbos/runtime/change-boundary.json",
  launchApproval: "pbos/runtime/launch-approval.json",
  transitionLifecycle: "pbos/runtime/transition-lifecycle.json",
  approvalPackage: "pbos/runtime/approval-package.json",
  artifactReconciliation: "pbos/runtime/artifact-reconciliation.json",
  lifecycleGovernance: "pbos/runtime/lifecycle-governance.json",
  planningHandoff: "pbos/runtime/planning-handoff.json",
  workflow: "pbos/runtime/workflow.json",
  doctor: "pbos/runtime/doctor.json",
  manifest: "pbos/runtime/manifest.json",
  promotion: "pbos/runtime/promotion.json",
  activation: "pbos/runtime/activation.json",
  completion: "pbos/runtime/completion.json",
  runtimeState: "pbos/runtime/runtime-state.json",
  repositoryAnalysis: "pbos/runtime/repository-analysis.json",
  executionHistory: "pbos/runtime/execution-history.json",
  kernelExecutionHistory: "pbos/runtime/kernel-execution-history.json",
  volumeCertification: "pbos/runtime/volume-certification.json",
  volumePromotion: "pbos/runtime/volume-promotion.json",
  interfaceCertification: "pbos/runtime/interface-certification.json",
  interfaceMeasurement: "pbos/runtime/interface-measurement.json",
} as const;

export type ArtifactName = keyof typeof Artifacts;
