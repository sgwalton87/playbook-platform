import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ExecutionAdmissionEvidence } from "../admission";
import type { TaskAssignment } from "./types";

export interface ExecutionAssignmentArtifact {
  readonly owner: "execution-assignment";
  readonly assignment: TaskAssignment;
  readonly admission: ExecutionAdmissionEvidence;
  readonly digest: string;
}

function objectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAssignmentArtifact(
  value: unknown
): value is ExecutionAssignmentArtifact {
  return Boolean(
    objectRecord(value) &&
    "owner" in value &&
    value.owner === "execution-assignment" &&
    "assignment" in value &&
    value.assignment &&
    typeof value.assignment === "object" &&
    "admission" in value &&
    value.admission &&
    typeof value.admission === "object" &&
    "digest" in value &&
    typeof value.digest === "string"
  );
}

export function loadExecutionAssignment(
  rootDir = process.cwd()
): ExecutionAssignmentArtifact | null {
  const artifactPath = path.join(rootDir, Artifacts.executionAssignment);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (!isAssignmentArtifact(value)) {
    throw new Error("Execution assignment artifact is invalid.");
  }
  const body = {
    owner: value.owner,
    assignment: value.assignment,
    admission: value.admission,
  };
  if (value.digest !== artifactDigest(body)) {
    throw new Error("Execution assignment artifact digest is invalid.");
  }
  return value;
}

export function persistExecutionAssignment(
  rootDir: string,
  assignment: TaskAssignment,
  admission: ExecutionAdmissionEvidence
): ExecutionAssignmentArtifact {
  if (
    !assignment.assigned ||
    !admission.decision.admitted ||
    admission.assignment_digest !== assignment.digest
  ) {
    throw new Error("Execution assignment persistence rejected.");
  }
  const body = {
    owner: "execution-assignment" as const,
    assignment,
    admission,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.executionAssignment),
    artifact,
    "execution-assignment"
  );
  return artifact;
}
