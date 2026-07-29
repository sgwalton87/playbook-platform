export const REPOSITORY_CONTEXT_VERSION = "1.1.0";
export const DEFAULT_CONTEXT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface GitContext {
  branch: string;
  commitSha: string;
  upstream: string | null;
  ahead: number;
  behind: number;
  workingTreeClean: boolean;
  workingTreeDigest: string;
  workingTreeContentDigest: string;
}

export interface RuntimeContext {
  engineVersion: string;
  currentGate: string | null;
  completedGates: string[];
  activeSprint: string | null;
  executionMode: string;
}

export interface ArtifactContext {
  path: string;
  exists: boolean;
  gateId: string | null;
  branch: string | null;
  status: string | null;
  generatedAt: string | null;
  digest: string | null;
  owner?: string | null;
  consumers?: string[];
}

export interface RepositoryContextSnapshot {
  repositoryRoot: string;
  remoteName: string;
  remoteUrl: string;
  repositoryIdentity: string;
  git: GitContext;
  runtime: RuntimeContext;
  artifacts: ArtifactContext[];
}

export interface RepositoryContextArtifact {
  version: string;
  capturedAt: string;
  snapshot: RepositoryContextSnapshot;
  identity: string;
}

export interface ContextValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ContextRefreshRecord {
  id: string;
  previousContextIdentity: string | null;
  newContextIdentity: string;
  reason: string;
  triggeringConditions: string[];
  timestamp: string;
  validator: {
    id: "PBOS-CONTEXT-VALIDATOR";
    version: typeof REPOSITORY_CONTEXT_VERSION;
  };
  generationResult: "PASS";
}

export interface ContextRefreshArtifact {
  version: "1.0.0";
  owner: "repository-context";
  latest: ContextRefreshRecord;
  history: ContextRefreshRecord[];
}
