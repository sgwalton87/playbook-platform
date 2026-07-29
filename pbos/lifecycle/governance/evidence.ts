import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { artifactDigest } from "../../kernel";
import type { GateDefinition } from "../../planner";
import type {
  CompletionEvidenceEvaluation,
  GateCompletionEvidenceManifest,
} from "./types";

const MAX_EVIDENCE_AGE_MS = 30 * 86_400_000;

export function completionEvidenceManifestPath(
  gateId: string
): string {
  return `docs/release-evidence/${gateId.toLowerCase()}-completion-evidence.json`;
}

export function evaluateGateCompletionEvidence(options: {
  gate: GateDefinition;
  rootDir?: string;
  evaluatedAt?: string;
}): CompletionEvidenceEvaluation {
  const rootDir = options.rootDir ?? process.cwd();
  const evaluatedAt = options.evaluatedAt ?? new Date().toISOString();
  const manifestPath = completionEvidenceManifestPath(options.gate.id);
  const absoluteManifest = path.join(rootDir, manifestPath);
  const gateDigest = artifactDigest(options.gate);
  const blockers: string[] = [];
  if (!existsSync(absoluteManifest)) {
    return {
      passed: false,
      gateId: options.gate.id,
      gateDigest,
      manifestPath,
      evidence: [],
      blockers: [`Completion evidence manifest is missing: ${manifestPath}.`],
    };
  }
  let manifest: GateCompletionEvidenceManifest;
  try {
    manifest = JSON.parse(
      readFileSync(absoluteManifest, "utf8")
    ) as GateCompletionEvidenceManifest;
  } catch {
    return {
      passed: false,
      gateId: options.gate.id,
      gateDigest,
      manifestPath,
      evidence: [],
      blockers: [`Completion evidence manifest is invalid JSON: ${manifestPath}.`],
    };
  }
  if (manifest.schemaVersion !== 1) {
    blockers.push("Completion evidence schemaVersion must be 1.");
  }
  if (manifest.gateId !== options.gate.id) {
    blockers.push("Completion evidence gate identity does not match.");
  }
  if (manifest.gateDigest !== gateDigest) {
    blockers.push("Completion evidence gate digest does not match.");
  }
  if (!manifest.validator?.id?.trim() || !manifest.validator.version?.trim()) {
    blockers.push("Completion evidence validator identity is missing.");
  }
  const capturedAt = Date.parse(manifest.capturedAt);
  const evaluated = Date.parse(evaluatedAt);
  if (
    Number.isNaN(capturedAt) ||
    capturedAt > evaluated ||
    evaluated - capturedAt > MAX_EVIDENCE_AGE_MS
  ) {
    blockers.push("Completion evidence manifest is stale or invalid.");
  }
  const references = Array.isArray(manifest.evidence)
    ? manifest.evidence
    : [];
  if (references.length === 0) {
    blockers.push("Completion evidence references are missing.");
  }
  const evidencePaths = new Set<string>();
  for (const reference of references) {
    const absolute = path.resolve(rootDir, reference.path);
    const relative = path.relative(rootDir, absolute);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      blockers.push(`Completion evidence escapes the repository: ${reference.path}.`);
      continue;
    }
    if (!existsSync(absolute) || statSync(absolute).size === 0) {
      blockers.push(`Completion evidence is missing or empty: ${reference.path}.`);
      continue;
    }
    const digest = createHash("sha256")
      .update(readFileSync(absolute))
      .digest("hex");
    if (digest !== reference.digest) {
      blockers.push(`Completion evidence digest does not match: ${reference.path}.`);
    }
    const referenceTime = Date.parse(reference.capturedAt);
    if (
      Number.isNaN(referenceTime) ||
      referenceTime > evaluated ||
      evaluated - referenceTime > MAX_EVIDENCE_AGE_MS
    ) {
      blockers.push(`Completion evidence is stale: ${reference.path}.`);
    }
    evidencePaths.add(reference.path);
  }
  const claims = Array.isArray(manifest.claims) ? manifest.claims : [];
  for (const requirement of options.gate.definition_of_done) {
    const claim = claims.find((item) => item.requirement === requirement);
    if (!claim || claim.evidence.length === 0) {
      blockers.push(`Definition of done is not evidenced: ${requirement}`);
      continue;
    }
    for (const evidencePath of claim.evidence) {
      if (!evidencePaths.has(evidencePath)) {
        blockers.push(
          `Completion claim references undeclared evidence: ${evidencePath}.`
        );
      }
    }
  }
  for (const claim of claims) {
    if (!options.gate.definition_of_done.includes(claim.requirement)) {
      blockers.push(
        `Completion claim does not match a gate requirement: ${claim.requirement}`
      );
    }
  }
  return {
    passed: blockers.length === 0,
    gateId: options.gate.id,
    gateDigest,
    manifestPath,
    evidence: references,
    blockers: [...new Set(blockers)],
  };
}
