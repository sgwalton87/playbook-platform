import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { artifactDigest } from "../../kernel/identity";
import { loadMasterBuildManifest } from "../../manifests";
import type { RepositoryContextSnapshot } from "../schema";
import type { RepositoryRealityAssessment } from "./types";

function digestFiles(rootDir: string, files: readonly string[]): string {
  return artifactDigest(
    [...files].sort().map((file) => ({
      path: file,
      content: readFileSync(path.join(rootDir, file), "utf8"),
    }))
  );
}

export function assessRepositoryReality(input: {
  readonly rootDir: string;
  readonly snapshot: RepositoryContextSnapshot;
  readonly architectureFiles: readonly string[];
  readonly governanceFiles: readonly string[];
  readonly timestamp: string;
}): RepositoryRealityAssessment {
  const artifactState: "VALID" | "INVALID" =
    input.snapshot.artifacts.length > 0 &&
    input.snapshot.artifacts.every(({ exists, digest }) => exists && Boolean(digest))
      ? "VALID"
      : "INVALID";
  const missingArchitecture = input.architectureFiles.filter(
    (file) => !existsSync(path.join(input.rootDir, file))
  );
  const missingGovernance = input.governanceFiles.filter(
    (file) => !existsSync(path.join(input.rootDir, file))
  );
  let manifestDigest: string | null = null;
  let manifestState: "VALID" | "INVALID" = "INVALID";
  try {
    manifestDigest = loadMasterBuildManifest(input.rootDir).digest;
    manifestState = "VALID";
  } catch {
    // The finding below is the governed failure signal.
  }
  const findings = [
    ...(!input.snapshot.git.workingTreeClean ? ["Working tree contains development changes."] : []),
    ...(artifactState === "INVALID" ? ["Required runtime artifact inventory is invalid."] : []),
    ...(manifestState === "INVALID" ? ["Master build manifest is invalid."] : []),
    ...missingArchitecture.map((file) => `Architecture source is missing: ${file}.`),
    ...missingGovernance.map((file) => `Governance source is missing: ${file}.`),
  ];
  const governanceState: "VALID" | "INVALID" =
    missingGovernance.length === 0 ? "VALID" : "INVALID";
  const reject =
    artifactState === "INVALID" ||
    manifestState === "INVALID" ||
    missingArchitecture.length > 0 ||
    governanceState === "INVALID";
  const recommendation: RepositoryRealityAssessment["recommendation"] = reject
    ? "REJECT"
    : input.snapshot.git.workingTreeClean
      ? "ACTIVATION_ELIGIBLE"
      : "HUMAN_REVIEW_REQUIRED";
  const body = {
    assessment_id: `REPOSITORY-REALITY-${artifactDigest(input.snapshot).slice(0, 16)}`,
    repository_identity: input.snapshot.repositoryIdentity,
    current_commit: input.snapshot.git.commitSha,
    current_branch: input.snapshot.git.branch,
    working_tree_state: input.snapshot.git.workingTreeClean ? "CLEAN" as const : "DIRTY" as const,
    artifact_state: artifactState,
    manifest_state: manifestState,
    governance_state: governanceState,
    architecture_digest:
      missingArchitecture.length === 0
        ? digestFiles(input.rootDir, input.architectureFiles)
        : "",
    artifact_digest: artifactDigest(input.snapshot.artifacts),
    manifest_digest: manifestDigest,
    risk_level: reject ? "CRITICAL" as const : findings.length > 0 ? "HIGH" as const : "LOW" as const,
    recommendation,
    findings,
    timestamp: input.timestamp,
  };
  return { ...body, digest: artifactDigest(body) };
}
