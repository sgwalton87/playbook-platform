import { artifactDigest } from "../../kernel/identity";
import type { KernelInput, KernelResult } from "../../kernel/execution";
import type {
  ArchitectureStateSnapshot,
  CapabilityStateSnapshot,
  EngineStateSnapshot,
  GovernanceStateSnapshot,
  LifecycleStateSnapshot,
  DocumentationStateSnapshot,
  ValidationStateSnapshot,
  PBOSSystemAssessment,
  PBOSSystemIntelligence,
  RepositoryStateSnapshot,
} from "./types";

function confidence(valid: boolean): number {
  return valid ? 100 : 0;
}

export function analyzePBOSSystemState(
  input: KernelInput,
  result: KernelResult
): PBOSSystemIntelligence {
  const sources = [
    input.constitution.uri,
    input.registry.id,
    input.repository.contentDigest,
  ].sort();
  const repositoryBody: RepositoryStateSnapshot = {
    identity: `REPOSITORY-${input.repository.contentDigest.slice(0, 16)}`,
    timestamp: input.observedAt,
    source_references: sources,
    digest: "",
    confidence: confidence(input.repository.valid),
    validation_status: input.repository.valid ? "VALID" : "INVALID",
    findings: [...input.repository.errors],
    repository_root: input.repository.root,
    branch: input.repository.branch,
    commit: input.repository.head,
    content_digest: input.repository.contentDigest,
  };
  const architectureGaps = result.certification.findings.filter((finding) =>
    finding.toLowerCase().includes("constitution")
  );
  const architectureBody: ArchitectureStateSnapshot = {
    identity: `ARCHITECTURE-${input.constitution.digest.slice(0, 16)}`,
    timestamp: input.observedAt,
    source_references: sources,
    digest: "",
    confidence: confidence(Boolean(input.constitution.digest)),
    validation_status: input.constitution.digest ? "VALID" : "INVALID",
    findings: architectureGaps,
    constitution_reference: input.constitution.uri,
    objective_count: input.registry.objectives.length,
    architecture_gaps: architectureGaps,
    documentation_maturity: input.constitution.digest
      ? "VALIDATED"
      : "UNKNOWN",
  };
  const completed = input.registry.objectives
    .filter(({ state }) => state === "COMPLETED")
    .map(({ id }) => id)
    .sort();
  const incomplete = input.registry.objectives
    .filter(({ state }) => state !== "COMPLETED")
    .map(({ id }) => id)
    .sort();
  const blocked = input.registry.objectives
    .flatMap(({ blockers }) => blockers)
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort();
  const capabilityBody: CapabilityStateSnapshot = {
    identity: `CAPABILITY-${input.registry.digest.slice(0, 16)}`,
    timestamp: input.observedAt,
    source_references: sources,
    digest: "",
    confidence: confidence(Boolean(input.registry.digest)),
    validation_status: input.registry.digest ? "VALID" : "INVALID",
    findings: blocked,
    completed_capabilities: completed,
    incomplete_capabilities: incomplete,
    blocked_dependencies: blocked,
  };
  const engineBody: EngineStateSnapshot = {
    identity: `ENGINE-${input.runtime.engineVersion}`,
    timestamp: input.observedAt,
    source_references: sources,
    digest: "",
    confidence: confidence(input.runtime.valid),
    validation_status: input.runtime.valid ? "VALID" : "INVALID",
    findings: [...input.runtime.errors],
    engine_version: input.runtime.engineVersion,
    execution_mode: input.runtime.mode,
    active_gate: input.runtime.activeGate,
    test_health: result.certification.status === "CERTIFIED" ? "PASS" : "UNKNOWN",
  };
  const governanceBody: GovernanceStateSnapshot = {
    identity: `GOVERNANCE-${result.certification.digest.slice(0, 16)}`,
    timestamp: input.observedAt,
    source_references: sources,
    digest: "",
    confidence: confidence(result.certification.status === "CERTIFIED"),
    validation_status:
      result.certification.status === "CERTIFIED" ? "VALID" : "INVALID",
    findings: [...result.certification.findings],
    lifecycle_status: input.runtime.releaseState,
    certification_status: result.certification.status,
    validation_status_summary: input.runtime.valid ? "PASS" : "FAIL",
    governance_conflicts: [...result.certification.findings],
  };
  const withDigest = <T extends { readonly digest: string }>(value: T): T => ({
    ...value,
    digest: artifactDigest({ ...value, digest: undefined }),
  });
  const lifecycleBody: LifecycleStateSnapshot = {
    identity: `LIFECYCLE-${input.runtime.releaseState}`,
    timestamp: input.observedAt,
    source_references: sources,
    digest: "",
    confidence: confidence(input.runtime.valid),
    validation_status: input.runtime.valid ? "VALID" : "INVALID",
    findings: [...input.runtime.errors],
    release_state: input.runtime.releaseState,
    active_gate: input.runtime.activeGate,
    completed_milestones: [...completed],
  };
  const documentationBody: DocumentationStateSnapshot = {
    identity: `DOCUMENTATION-${input.constitution.digest.slice(0, 16)}`,
    timestamp: input.observedAt,
    source_references: [input.constitution.uri],
    digest: "",
    confidence: confidence(Boolean(input.constitution.digest)),
    validation_status: input.constitution.digest ? "VALID" : "INVALID",
    findings: architectureGaps,
    constitutional_source: input.constitution.uri,
    maturity: input.constitution.digest ? "VALIDATED" : "UNKNOWN",
  };
  const validationBody: ValidationStateSnapshot = {
    identity: `VALIDATION-${result.certification.digest.slice(0, 16)}`,
    timestamp: input.observedAt,
    source_references: sources,
    digest: "",
    confidence: confidence(result.certification.status === "CERTIFIED"),
    validation_status:
      result.certification.status === "CERTIFIED" ? "VALID" : "INVALID",
    findings: [...result.certification.findings],
    kernel_certification: result.certification.status,
    repository_context: input.repository.valid ? "VALID" : "INVALID",
    runtime_context: input.runtime.valid ? "VALID" : "INVALID",
  };
  const domainStates = [
    ["repository", input.repository.valid],
    ["architecture", Boolean(input.constitution.digest)],
    ["capabilities", blocked.length === 0],
    ["engine", input.runtime.valid],
    ["governance", result.certification.status === "CERTIFIED"],
    ["lifecycle", input.runtime.valid],
    ["documentation", Boolean(input.constitution.digest)],
    ["validation", result.certification.status === "CERTIFIED"],
  ] as const;
  const assessmentBody: PBOSSystemAssessment = {
    assessment_id: `SYSTEM-ASSESSMENT-${result.certification.digest.slice(0, 16)}`,
    current_maturity:
      result.certification.status === "CERTIFIED"
        ? "OPERATIONAL"
        : input.repository.valid && input.runtime.valid
          ? "STRUCTURAL"
          : "BLOCKED",
    completed_domains: domainStates
      .filter(([, valid]) => valid)
      .map(([name]) => name),
    incomplete_domains: domainStates
      .filter(([, valid]) => !valid)
      .map(([name]) => name),
    blocked_dependencies: [...blocked],
    risks: [...new Set(result.certification.findings)].sort(),
    recommended_focus:
      result.certification.status === "CERTIFIED"
        ? "Advance only the canonical constitutional milestone."
        : "Resolve repository, runtime, and governance validation findings.",
    confidence: confidence(result.certification.status === "CERTIFIED"),
    evidence: [
      input.constitution.digest,
      input.registry.digest,
      result.certification.digest,
    ].sort(),
    timestamp: input.observedAt,
    digest: "",
  };
  const body = {
    repository: withDigest(repositoryBody),
    architecture: withDigest(architectureBody),
    capabilities: withDigest(capabilityBody),
    engine: withDigest(engineBody),
    governance: withDigest(governanceBody),
    lifecycle: withDigest(lifecycleBody),
    documentation: withDigest(documentationBody),
    validation: withDigest(validationBody),
    assessment: withDigest(assessmentBody),
  };
  return { ...body, digest: artifactDigest(body) };
}
