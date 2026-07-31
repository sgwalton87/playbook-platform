import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { CodexExecutionPackage } from "../../orchestration";
import type { MilestoneAdvancementAssessment } from "./advancement";

export interface MilestoneAdvancementRecord {
  readonly transition_id: string;
  readonly milestone_id: string;
  readonly from: "READY" | "IN_PROGRESS" | "VALIDATING";
  readonly to: "COMPLETE";
  readonly package_digest: string;
  readonly evidence_digest: string;
  readonly assessment_digest: string;
  readonly authorized_by: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface MilestoneAdvancementHistory {
  readonly owner: "milestone-lifecycle-governance";
  readonly latest: MilestoneAdvancementRecord;
  readonly history: readonly MilestoneAdvancementRecord[];
  readonly digest: string;
}

function objectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRecord(value: unknown): value is MilestoneAdvancementRecord {
  return Boolean(
    objectRecord(value) &&
    typeof value.transition_id === "string" &&
    typeof value.milestone_id === "string" &&
    value.to === "COMPLETE" &&
    typeof value.package_digest === "string" &&
    typeof value.evidence_digest === "string" &&
    typeof value.assessment_digest === "string" &&
    typeof value.authorized_by === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.digest === "string"
  );
}

export function loadMilestoneAdvancementHistory(
  rootDir = process.cwd()
): MilestoneAdvancementHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.milestoneAdvancement);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (
    !objectRecord(value) ||
    value.owner !== "milestone-lifecycle-governance" ||
    !isRecord(value.latest) ||
    !Array.isArray(value.history) ||
    !value.history.every(isRecord) ||
    typeof value.digest !== "string"
  ) {
    throw new Error("Milestone advancement history is invalid.");
  }
  const body = {
    owner: value.owner,
    latest: value.latest,
    history: value.history,
  };
  if (value.digest !== artifactDigest(body)) {
    throw new Error("Milestone advancement history digest is invalid.");
  }
  return {
    owner: "milestone-lifecycle-governance",
    latest: value.latest,
    history: value.history,
    digest: value.digest,
  };
}

export function persistMilestoneAdvancement(input: {
  readonly rootDir: string;
  readonly package: CodexExecutionPackage;
  readonly assessment: MilestoneAdvancementAssessment;
  readonly authorized_by: string;
  readonly timestamp: string;
}): MilestoneAdvancementHistory {
  if (
    !input.assessment.eligible ||
    input.assessment.milestone_id !== input.package.milestone_id ||
    !input.authorized_by
  ) {
    throw new Error("Milestone advancement rejected.");
  }
  const body = {
    transition_id: `MILESTONE-TRANSITION-${artifactDigest({
      package: input.package.digest,
      evidence: input.assessment.evidence_digest,
    }).slice(0, 16)}`,
    milestone_id: input.package.milestone_id,
    from: "VALIDATING" as const,
    to: "COMPLETE" as const,
    package_digest: input.package.digest,
    evidence_digest: input.assessment.evidence_digest,
    assessment_digest: input.assessment.digest,
    authorized_by: input.authorized_by,
    timestamp: input.timestamp,
  };
  const record = { ...body, digest: artifactDigest(body) };
  const existing = loadMilestoneAdvancementHistory(input.rootDir);
  const history = existing
    ? [...existing.history, existing.latest].filter(
        (item, index, items) =>
          items.findIndex(({ digest }) => digest === item.digest) === index
      )
    : [];
  const artifactBody = {
    owner: "milestone-lifecycle-governance" as const,
    latest: record,
    history,
  };
  const artifact = {
    ...artifactBody,
    digest: artifactDigest(artifactBody),
  };
  Runtime.save(
    path.join(input.rootDir, Artifacts.milestoneAdvancement),
    artifact,
    "milestone-lifecycle-governance"
  );
  return artifact;
}

export function completedMilestoneIds(
  rootDir = process.cwd()
): ReadonlySet<string> {
  const value = loadMilestoneAdvancementHistory(rootDir);
  return new Set(
    value ? [...value.history, value.latest].map(({ milestone_id }) => milestone_id) : []
  );
}
