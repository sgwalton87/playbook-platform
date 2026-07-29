import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { digestContent } from "./metadata";
import type { ConstitutionalVolume } from "./types";

export const implementationValidationDomains = [
  "Design System Adoption",
  "Component Architecture Compliance",
  "Design Token Compliance",
  "Accessibility Compliance",
  "Responsive Behavior",
  "Interaction Pattern Compliance",
  "UI State Coverage",
  "Performance and Observability",
] as const;

export type ImplementationValidationDomain =
  (typeof implementationValidationDomains)[number];

export type ImplementationValidationStatus =
  | "PASS"
  | "FAIL"
  | "INCOMPLETE";

export interface ImplementationValidationEvidenceReference {
  path: string;
  digest: string;
}

export interface ImplementationValidationResult {
  domain: ImplementationValidationDomain;
  status: ImplementationValidationStatus;
  evidence: ImplementationValidationEvidenceReference[];
  findings: string[];
}

export interface VolumeImplementationValidationArtifact {
  schemaVersion: 1;
  volume: string;
  lifecycle: "implementation_ready";
  contentDigest: string;
  validationTimestamp: string;
  validator: {
    id: string;
    version: string;
  };
  validationComplete: boolean;
  results: ImplementationValidationResult[];
  blockingConditions: string[];
}

export interface ImplementationValidationEvaluation {
  path: string;
  artifact: VolumeImplementationValidationArtifact | null;
  passed: boolean;
  blockingConditions: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function evaluateImplementationValidation(
  rootDir: string,
  volume: ConstitutionalVolume
): ImplementationValidationEvaluation {
  const relativePath = `docs/release-evidence/volume-${volume.number}-implementation-validation.json`;
  const artifactPath = path.join(rootDir, relativePath);
  const blockers: string[] = [];
  if (!existsSync(artifactPath)) {
    return {
      path: relativePath,
      artifact: null,
      passed: false,
      blockingConditions: [
        `Implementation validation artifact is missing: ${relativePath}.`,
      ],
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(artifactPath, "utf8"));
  } catch {
    return {
      path: relativePath,
      artifact: null,
      passed: false,
      blockingConditions: [
        `Implementation validation artifact is not valid JSON: ${relativePath}.`,
      ],
    };
  }
  if (!isRecord(raw)) {
    return {
      path: relativePath,
      artifact: null,
      passed: false,
      blockingConditions: [
        "Implementation validation artifact must be a JSON object.",
      ],
    };
  }
  const artifact = raw as unknown as VolumeImplementationValidationArtifact;

  if (artifact.schemaVersion !== 1) {
    blockers.push("Implementation validation schemaVersion must be 1.");
  }
  if (artifact.volume !== volume.id) {
    blockers.push(
      `Implementation validation volume must be ${volume.id}.`
    );
  }
  if (artifact.lifecycle !== "implementation_ready") {
    blockers.push(
      "Implementation validation lifecycle must be implementation_ready."
    );
  }
  if (artifact.contentDigest !== volume.contentDigest) {
    blockers.push("Implementation validation content digest does not match.");
  }
  if (
    !artifact.validationTimestamp ||
    Number.isNaN(Date.parse(artifact.validationTimestamp))
  ) {
    blockers.push("Implementation validation timestamp is invalid.");
  }
  if (
    !artifact.validator?.id?.trim() ||
    !artifact.validator?.version?.trim()
  ) {
    blockers.push(
      "Implementation validation validator identity is incomplete."
    );
  }
  if (!Array.isArray(artifact.results)) {
    blockers.push("Implementation validation results are missing.");
  } else {
    const seen = new Set<string>();
    for (const domain of implementationValidationDomains) {
      const matches = artifact.results.filter(
        (result) => result.domain === domain
      );
      if (matches.length !== 1) {
        blockers.push(
          `Implementation validation requires exactly one result for ${domain}.`
        );
        continue;
      }
      const result = matches[0];
      seen.add(result.domain);
      if (!["PASS", "FAIL", "INCOMPLETE"].includes(result.status)) {
        blockers.push(
          `${domain} has an undocumented validation status.`
        );
        continue;
      }
      if (!Array.isArray(result.findings)) {
        blockers.push(`${domain} findings are missing.`);
      }
      if (!Array.isArray(result.evidence)) {
        blockers.push(`${domain} evidence results are missing.`);
        continue;
      }
      if (result.status === "PASS" && result.evidence.length === 0) {
        blockers.push(`${domain} claims PASS without evidence.`);
      }
      for (const reference of result.evidence) {
        if (
          !isRecord(reference) ||
          typeof reference.path !== "string" ||
          typeof reference.digest !== "string"
        ) {
          blockers.push(`${domain} contains malformed evidence.`);
          continue;
        }
        const evidencePath = path.resolve(rootDir, reference.path);
        const relative = path.relative(rootDir, evidencePath);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
          blockers.push(`${domain} evidence escapes the repository.`);
          continue;
        }
        if (!existsSync(evidencePath)) {
          blockers.push(
            `${domain} evidence does not exist: ${reference.path}.`
          );
          continue;
        }
        const actualDigest = digestContent(
          readFileSync(evidencePath, "utf8")
        );
        if (actualDigest !== reference.digest) {
          blockers.push(
            `${domain} evidence digest does not match: ${reference.path}.`
          );
        }
      }
      if (result.status !== "PASS") {
        blockers.push(
          `${domain} implementation validation is ${result.status}.`
        );
      }
    }
    for (const result of artifact.results) {
      if (
        !implementationValidationDomains.includes(
          result.domain as ImplementationValidationDomain
        ) ||
        seen.has(result.domain)
      ) {
        if (
          !implementationValidationDomains.includes(
            result.domain as ImplementationValidationDomain
          )
        ) {
          blockers.push(
            `Unexpected implementation validation domain: ${result.domain}.`
          );
        }
      }
    }
  }
  if (!Array.isArray(artifact.blockingConditions)) {
    blockers.push(
      "Implementation validation blockingConditions are missing."
    );
  } else {
    blockers.push(...artifact.blockingConditions);
  }

  const allResultsPass =
    Array.isArray(artifact.results) &&
    implementationValidationDomains.every(
      (domain) =>
        artifact.results.filter(
          (result) =>
            result.domain === domain && result.status === "PASS"
        ).length === 1
    );
  if (artifact.validationComplete === true && !allResultsPass) {
    blockers.push(
      "False completion claim: validationComplete is true while required results are not PASS."
    );
  }
  if (artifact.validationComplete !== true) {
    blockers.push("Implementation validation is not complete.");
  }

  return {
    path: relativePath,
    artifact,
    passed: blockers.length === 0,
    blockingConditions: [...new Set(blockers)],
  };
}

export function renderImplementationValidationReport(
  evaluation: ImplementationValidationEvaluation
): string {
  const artifact = evaluation.artifact;
  const rows = implementationValidationDomains
    .map((domain) => {
      const result = artifact?.results?.find(
        (candidate) => candidate.domain === domain
      );
      return `| ${domain} | ${result?.status ?? "MISSING"} | ${
        result?.evidence?.length ?? 0
      } | ${result?.findings?.join("; ") || "None"} |`;
    })
    .join("\n");
  const blockers = evaluation.blockingConditions.length
    ? evaluation.blockingConditions
        .map((blocker) => `- ${blocker}`)
        .join("\n")
    : "- None";
  return `# Volume 34 Implementation Validation Report

## Result

${evaluation.passed ? "PASS" : "FAIL"}

## Identity

- Volume: ${artifact?.volume ?? "Unknown"}
- Lifecycle: ${artifact?.lifecycle ?? "Unknown"}
- Content digest: \`${artifact?.contentDigest ?? "Unknown"}\`
- Validator: ${artifact?.validator?.id ?? "Unknown"} ${
    artifact?.validator?.version ?? ""
  }
- Validation timestamp: ${artifact?.validationTimestamp ?? "Unknown"}
- Validation complete: ${artifact?.validationComplete === true ? "YES" : "NO"}

## Domain Results

| Domain | Status | Evidence Count | Findings |
| --- | --- | --- | --- |
${rows}

## Blocking Conditions

${blockers}
`;
}
