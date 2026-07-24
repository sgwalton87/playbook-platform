import { spawnSync } from "node:child_process";

export type ReleaseState =
  | "DRAFT"
  | "ENGINEERING_REVIEW"
  | "ENGINEERING_APPROVED"
  | "PROMOTION_PENDING"
  | "PROMOTION_COMPLETE"
  | "AUDIT_COMPLETE"
  | "ARCHIVED";

export interface ReleaseEnvironment {
  name: "local" | "codex" | "ci" | "sandbox" | "unknown";
  gitRemoteAvailable: boolean;
  gitCredentialsAvailable: boolean;
  repositoryWritable: boolean;
  pullRequestPossible: boolean;
  tagCreationPossible: boolean;
}

export interface ReleaseTransition {
  currentState: ReleaseState;
  previousState: ReleaseState | null;
  transitionTimestamp: string;
  transitionReason: string;
  environment: ReleaseEnvironment;
  blockingConditions: string[];
}

const transitions: Record<ReleaseState, ReleaseState[]> = {
  DRAFT: ["ENGINEERING_REVIEW"],
  ENGINEERING_REVIEW: ["ENGINEERING_APPROVED"],
  ENGINEERING_APPROVED: ["PROMOTION_PENDING"],
  PROMOTION_PENDING: ["PROMOTION_COMPLETE"],
  PROMOTION_COMPLETE: ["AUDIT_COMPLETE"],
  AUDIT_COMPLETE: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransition(from: ReleaseState, to: ReleaseState): boolean {
  return transitions[from].includes(to);
}

export function validateTransition(from: ReleaseState, to: ReleaseState): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid PBOS release transition: ${from} -> ${to}`);
  }
}

export function detectReleaseEnvironment(rootDir = process.cwd()): ReleaseEnvironment {
  const remote = spawnSync("git", ["remote", "-v"], { cwd: rootDir, encoding: "utf8" });
  const status = spawnSync("git", ["status", "--short"], { cwd: rootDir, encoding: "utf8" });
  const hasRemote = remote.status === 0 && remote.stdout.trim().length > 0;
  const repositoryWritable = status.status === 0;
  const isCodex = Boolean(process.env.CODEX_HOME || process.env.CODEX_SANDBOX || process.env.CI === "codex");
  const name = process.env.CI ? "ci" : isCodex ? "codex" : hasRemote ? "local" : "sandbox";

  return {
    name,
    gitRemoteAvailable: hasRemote,
    gitCredentialsAvailable: hasRemote,
    repositoryWritable,
    pullRequestPossible: hasRemote,
    tagCreationPossible: hasRemote && repositoryWritable,
  };
}

export function blockingConditionsForPromotion(environment: ReleaseEnvironment): string[] {
  const blockers: string[] = [];
  if (!environment.gitRemoteAvailable) blockers.push("Git remote unavailable");
  if (!environment.gitCredentialsAvailable) blockers.push("Git credentials unavailable");
  if (!environment.repositoryWritable) blockers.push("Repository is not writable");
  if (!environment.pullRequestPossible) blockers.push("Pull Request creation unavailable");
  if (!environment.tagCreationPossible) blockers.push("Release tag creation unavailable");
  return blockers;
}

export function createTransition(args: {
  previousState: ReleaseState | null;
  currentState: ReleaseState;
  transitionReason: string;
  environment: ReleaseEnvironment;
  blockingConditions?: string[];
}): ReleaseTransition {
  if (args.previousState) {
    validateTransition(args.previousState, args.currentState);
  }

  return {
    currentState: args.currentState,
    previousState: args.previousState,
    transitionTimestamp: new Date().toISOString(),
    transitionReason: args.transitionReason,
    environment: args.environment,
    blockingConditions: args.blockingConditions ?? [],
  };
}

export function resolvePromotionState(environment: ReleaseEnvironment): { state: ReleaseState; blockers: string[]; reason: string } {
  const blockers = blockingConditionsForPromotion(environment);
  if (blockers.length > 0) {
    return {
      state: "PROMOTION_PENDING",
      blockers,
      reason: "Engineering review remains valid, but repository promotion is pending because the environment cannot complete remote GitHub operations.",
    };
  }

  return {
    state: "PROMOTION_COMPLETE",
    blockers: [],
    reason: "Repository promotion can complete in this environment.",
  };
}
