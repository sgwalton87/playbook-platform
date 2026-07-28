import { readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { artifactDigest } from "../kernel";
import type {
  ArtifactValidation,
  GateDefinition,
} from "./types";

const MAX_RUNTIME_ARTIFACT_AGE_MS = 24 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function gateIdentity(value: Record<string, unknown>): string | null {
  const direct = value.gateId ?? value.gate;
  if (typeof direct === "string") return direct;

  const selected = value.selectedGate;
  if (typeof selected === "string") return selected;
  if (isRecord(selected) && typeof selected.id === "string") {
    return selected.id;
  }
  return null;
}

function timestamp(value: Record<string, unknown>): string | null {
  for (const key of [
    "generatedAt",
    "capturedAt",
    "timestamp",
    "createdAt",
    "updatedAt",
  ]) {
    if (typeof value[key] === "string") return value[key];
  }
  return null;
}

function validateKnownSchema(
  relativePath: string,
  value: Record<string, unknown>
): string[] {
  const errors: string[] = [];
  const require = (condition: boolean, message: string): void => {
    if (!condition) errors.push(message);
  };

  if (relativePath.endsWith("/repository.json")) {
    require(typeof value.generatedAt === "string", "Repository artifact has no generatedAt.");
    require(typeof value.currentBranch === "string", "Repository artifact has no currentBranch.");
    require(Array.isArray(value.branches), "Repository artifact has no branch registry.");
  } else if (relativePath.endsWith("/validation.json")) {
    require(value.status === "PASS", "Validation artifact status is not PASS.");
    require(typeof value.selectedGate === "string", "Validation artifact has no gate identity.");
    require(Array.isArray(value.checks), "Validation artifact has no checks.");
  } else if (relativePath.endsWith("/promotion.json")) {
    require(typeof value.gateId === "string", "Promotion artifact has no gate identity.");
    require(value.promoted === true, "Promotion artifact is not promoted.");
    require(typeof value.timestamp === "string", "Promotion artifact has no timestamp.");
  } else if (relativePath.endsWith("/next-gate.json")) {
    require("selectedGate" in value, "Planning artifact has no selectedGate.");
    require(Array.isArray(value.eligible), "Planning artifact has no eligible list.");
    require(Array.isArray(value.blocked), "Planning artifact has no blocked list.");
  }

  return errors;
}

export function validateRequiredArtifact(options: {
  rootDir: string;
  relativePath: string;
  gate: GateDefinition;
  completedGateIds: Set<string>;
  now?: Date;
}): ArtifactValidation {
  const {
    rootDir,
    relativePath,
    gate,
    completedGateIds,
  } = options;
  const errors: string[] = [];
  const absolutePath = join(rootDir, relativePath);
  let content: string;

  try {
    const stats = statSync(absolutePath);
    if (!stats.isFile()) {
      errors.push("Artifact is not a regular file.");
    }
    content = readFileSync(absolutePath, "utf8");
  } catch {
    return {
      path: relativePath,
      valid: false,
      digest: null,
      gateId: null,
      errors: ["Artifact does not exist."],
    };
  }

  if (content.length === 0) {
    errors.push("Artifact content is empty.");
  }

  const digest = artifactDigest(content);
  if (extname(relativePath).toLowerCase() !== ".json") {
    return {
      path: relativePath,
      valid: errors.length === 0,
      digest,
      gateId: null,
      errors,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    errors.push("Artifact JSON schema is invalid.");
  }

  if (!isRecord(parsed)) {
    if (!errors.includes("Artifact JSON schema is invalid.")) {
      errors.push("Artifact JSON root must be an object.");
    }
    return {
      path: relativePath,
      valid: false,
      digest,
      gateId: null,
      errors,
    };
  }

  errors.push(...validateKnownSchema(relativePath, parsed));
  const artifactGateId = gateIdentity(parsed);
  const permittedGateIds = new Set([
    gate.id,
    ...gate.dependencies,
    ...completedGateIds,
  ]);
  if (artifactGateId && !permittedGateIds.has(artifactGateId)) {
    errors.push(
      `Artifact gate identity ${artifactGateId} is not valid for ${gate.id}.`
    );
  }
  if (
    relativePath.endsWith("/validation.json") &&
    artifactGateId !== gate.id
  ) {
    errors.push(
      `Validation artifact belongs to ${artifactGateId ?? "no gate"}, not ${gate.id}.`
    );
  }

  const generatedAt = timestamp(parsed);
  if (generatedAt) {
    const time = Date.parse(generatedAt);
    const now = (options.now ?? new Date()).getTime();
    if (
      !Number.isFinite(time) ||
      time > now ||
      now - time > MAX_RUNTIME_ARTIFACT_AGE_MS
    ) {
      errors.push("Artifact freshness validation failed.");
    }
  }

  if (typeof parsed.digest === "string") {
    const { digest: declaredDigest, ...payload } = parsed;
    if (declaredDigest !== artifactDigest(payload)) {
      errors.push("Artifact declared digest does not match its content.");
    }
  }
  if (
    typeof parsed.identity === "string" &&
    "snapshot" in parsed &&
    parsed.identity !== artifactDigest(parsed.snapshot)
  ) {
    errors.push("Artifact identity does not match its snapshot.");
  }

  return {
    path: relativePath,
    valid: errors.length === 0,
    digest,
    gateId: artifactGateId,
    errors,
  };
}
