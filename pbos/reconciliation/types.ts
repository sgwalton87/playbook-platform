export type ReconciliationClassification =
  | "valid"
  | "stale"
  | "superseded"
  | "invalid"
  | "recoverable";

export interface ReconciledArtifactEvidence {
  path: string;
  owner: string;
  producer: string;
  classification: ReconciliationClassification;
  reasons: string[];
  previousDigest: string | null;
  currentDigest: string | null;
  previousArtifact: unknown;
  regenerated: boolean;
}

export interface ArtifactReconciliationRun {
  runId: string;
  evaluatedAt: string;
  owner: "artifact-reconciliation";
  engineStateOwner: "engine-state-manager";
  artifacts: ReconciledArtifactEvidence[];
  unresolvedConflicts: string[];
  artifactHealth: "VALID" | "INVALID";
  refreshRequired: boolean;
  readyForContextRefresh: boolean;
}

export interface ArtifactReconciliationArtifact
  extends ArtifactReconciliationRun {
  schemaVersion: 1;
  history: ArtifactReconciliationRun[];
}
