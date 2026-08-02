import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../kernel";
import { TRANSITION_STATES, type TransitionLifecycleHistory, type TransitionProposal } from "./types";

function isProposal(value: unknown): value is TransitionProposal {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record.proposal_id === "string" &&
    typeof record.proposal_scope_identity === "string" &&
    typeof record.repository_identity === "string" &&
    typeof record.branch_identity === "string" &&
    typeof record.commit_identity === "string" &&
    typeof record.inventory_identity === "string" &&
    typeof record.state === "string" &&
    TRANSITION_STATES.includes(record.state as typeof TRANSITION_STATES[number]) &&
    Array.isArray(record.state_history) &&
    typeof record.digest === "string" &&
    record.digest === artifactDigest({ ...record, digest: undefined });
}

export function loadTransitionLifecycle(rootDir = process.cwd()): TransitionLifecycleHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.transitionLifecycle);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const artifact = value as Record<string, unknown>;
  if (artifact.owner !== "transition-orchestrator" || !isProposal(artifact.latest) ||
      !Array.isArray(artifact.history) || !artifact.history.every(isProposal)) return null;
  const body = {
    owner: "transition-orchestrator" as const,
    latest: artifact.latest,
    history: artifact.history as readonly TransitionProposal[],
  };
  if (artifact.digest !== artifactDigest(body)) return null;
  return { ...body, digest: artifact.digest as string };
}

export function persistTransitionLifecycle(
  rootDir: string,
  proposal: TransitionProposal
): TransitionLifecycleHistory {
  const existing = loadTransitionLifecycle(rootDir);
  const history = [
    ...(existing?.history ?? []),
    ...(existing?.latest ? [existing.latest] : []),
  ].filter((value, index, values) =>
    values.findIndex(({ digest }) => digest === value.digest) === index
  );
  const body = { owner: "transition-orchestrator" as const, latest: proposal, history };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(path.join(rootDir, Artifacts.transitionLifecycle), artifact, "transition-orchestrator");
  return artifact;
}
