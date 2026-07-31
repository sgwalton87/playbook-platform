import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { artifactDigest } from "../../kernel";
import { loadMasterBuildManifest } from "../../manifests";
import { validateScholarExperiencePackageSet } from "../../product-factory";
import type { CodexExecutionPackage } from "../../orchestration";
import type { AgentExecutionArtifact } from "../adapters";
import type { ExecutionAuthorization, ExecutionAuthorityRecord } from "../authority";
import type { ExecutionTask } from "../tasks";

export interface ExecutionValidationEvidence {
  readonly validation_id: string;
  readonly status: "PASS" | "FAIL";
  readonly validator: string;
  readonly findings: readonly string[];
  readonly evidence_digest: string;
  readonly digest: string;
}

function inScope(file: string, scopes: readonly string[]): boolean {
  return scopes.some((scope) => file === scope || file.startsWith(`${scope}/`));
}

function result(
  validationId: string,
  findings: readonly string[],
  evidence: unknown
): ExecutionValidationEvidence {
  const body = {
    validation_id: validationId,
    status: findings.length === 0 ? "PASS" as const : "FAIL" as const,
    validator: `pbos.execution.${validationId}.v1`,
    findings: [...findings],
    evidence_digest: artifactDigest(evidence),
  };
  return { ...body, digest: artifactDigest(body) };
}

export function evaluateExecutionValidations(input: {
  readonly rootDir: string;
  readonly task: ExecutionTask;
  readonly package: CodexExecutionPackage;
  readonly authority: ExecutionAuthorityRecord;
  readonly authorization: ExecutionAuthorization;
  readonly artifacts: readonly AgentExecutionArtifact[];
  readonly provider_validation_results: readonly string[];
}): readonly ExecutionValidationEvidence[] {
  const manifest = loadMasterBuildManifest(input.rootDir).manifest;
  const milestone = manifest.milestones.find(({ id }) => id === input.task.milestone_id);
  return input.task.validation_requirements.map((requirement) => {
    if (input.provider_validation_results.includes(requirement)) {
      return result(requirement, [], {
        source: "provider-command",
        requirement,
      });
    }
    if (requirement === "dependency-validation") {
      const dependencies = milestone
        ? [...milestone.dependencies, ...milestone.blocking_dependencies]
        : [];
      const findings = [
        ...(!milestone ? ["Manifest milestone is missing."] : []),
        ...(milestone && !milestone.validation_requirements.includes(requirement)
          ? ["Manifest does not require dependency validation."]
          : []),
        ...dependencies.flatMap((dependency) => {
          const item = manifest.milestones.find(({ id }) => id === dependency);
          return !item || item.status !== "COMPLETE"
            ? [`Dependency is not complete: ${dependency}.`]
            : [];
        }),
        ...(milestone?.required_artifacts ?? []).flatMap((artifact) =>
          existsSync(path.join(input.rootDir, artifact))
            ? []
            : [`Required artifact is missing: ${artifact}.`]
        ),
      ];
      return result(requirement, findings, {
        milestone: milestone?.id ?? null,
        dependencies,
        required_artifacts: milestone?.required_artifacts ?? [],
      });
    }
    if (requirement === "package-identity") {
      const artifactFindings = input.artifacts.flatMap((artifact) => {
        const absolute = path.join(input.rootDir, artifact.path);
        if (!existsSync(absolute)) return [`Execution artifact is missing: ${artifact.path}.`];
        return artifact.digest === artifactDigest(readFileSync(absolute))
          ? []
          : [`Execution artifact digest does not match: ${artifact.path}.`];
      });
      const findings = [
        ...(input.task.package_id !== input.package.package_id ||
        input.task.milestone_id !== input.package.milestone_id
          ? ["Task package identity does not match."]
          : []),
        ...(input.authority.package_digest !== input.package.digest ||
        input.authorization.package_digest !== input.package.digest
          ? ["Authorized package digest does not match."]
          : []),
        ...(input.artifacts.length === 0 ? ["Execution artifact inventory is empty."] : []),
        ...(milestone?.id === "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001"
          ? validateScholarExperiencePackageSet(milestone, input.rootDir).findings
          : []),
        ...artifactFindings,
      ];
      return result(requirement, findings, {
        package_id: input.package.package_id,
        package_digest: input.package.digest,
        milestone_id: input.package.milestone_id,
        artifacts: input.artifacts,
      });
    }
    if (
      requirement === "product-strategy-integrity" ||
      requirement === "experience-architecture-integrity" ||
      requirement === "technical-architecture-integrity"
    ) {
      const label = requirement === "product-strategy-integrity"
        ? "Product Strategy Evidence"
        : requirement === "experience-architecture-integrity"
          ? "UX Architecture Evidence"
          : "Technical Architecture Evidence";
      const evidence = milestone?.mission_control?.completed.find(
        (entry) => entry.label === label
      )?.evidence ?? [];
      const findings = [
        ...(!milestone ? ["Manifest milestone is missing."] : []),
        ...(evidence.length === 0 ? [`${label} is not declared by the milestone.`] : []),
        ...evidence.flatMap((artifact) => {
          const absolute = path.join(input.rootDir, artifact);
          if (!existsSync(absolute)) return [`Architecture evidence is missing: ${artifact}.`];
          return readFileSync(absolute, "utf8").trim()
            ? []
            : [`Architecture evidence is empty: ${artifact}.`];
        }),
        ...(milestone?.id === "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001"
          ? validateScholarExperiencePackageSet(milestone, input.rootDir).findings
          : []),
      ];
      return result(requirement, findings, {
        milestone: milestone?.id ?? null,
        label,
        evidence: evidence.map((artifact) => ({
          artifact,
          digest: existsSync(path.join(input.rootDir, artifact))
            ? artifactDigest(readFileSync(path.join(input.rootDir, artifact)))
            : null,
        })),
      });
    }
    if (requirement === "permission-boundary") {
      const findings = [
        ...(input.task.execution_authorization_id !== input.authorization.authorization_id
          ? ["Task authorization identity does not match."]
          : []),
        ...(input.task.provider_id !== input.authorization.provider_id ||
        input.task.provider_contract_id !== input.authorization.provider_contract_id ||
        input.task.assigned_agent !== input.authorization.agent_id
          ? ["Task provider authority does not match."]
          : []),
        ...input.artifacts.flatMap(({ path: artifact }) => [
          ...(!inScope(artifact, input.task.allowed_scope) ||
          !inScope(artifact, input.authorization.allowed_actions) ||
          !inScope(artifact, input.authority.scope)
            ? [`Execution artifact is outside authorized scope: ${artifact}.`]
            : []),
          ...(inScope(artifact, input.task.prohibited_scope) ||
          inScope(artifact, input.authorization.prohibited_actions) ||
          inScope(artifact, input.authority.blocked_operations)
            ? [`Execution artifact intersects prohibited scope: ${artifact}.`]
            : []),
        ]),
      ];
      return result(requirement, findings, {
        authorization_id: input.authorization.authorization_id,
        authority_digest: input.authority.digest,
        allowed_scope: input.task.allowed_scope,
        prohibited_scope: input.task.prohibited_scope,
        artifacts: input.artifacts,
      });
    }
    return result(
      requirement,
      [`No canonical execution validator is registered for ${requirement}.`],
      { requirement }
    );
  });
}
