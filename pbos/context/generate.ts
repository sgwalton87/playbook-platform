import path from "node:path";
import {
  Artifacts,
  Runtime,
  artifactDigest,
} from "../kernel";
import {
  REPOSITORY_CONTEXT_VERSION,
  type RepositoryContextArtifact,
} from "./schema";
import { loadRepositoryContextSnapshot } from "./loader";

export function generateRepositoryContextArtifact(
  rootDir = process.cwd()
): RepositoryContextArtifact {
  const snapshot = loadRepositoryContextSnapshot(rootDir);
  const artifact: RepositoryContextArtifact = {
    version: REPOSITORY_CONTEXT_VERSION,
    capturedAt: new Date().toISOString(),
    snapshot,
    identity: artifactDigest(snapshot),
  };

  Runtime.save(
    path.join(rootDir, Artifacts.repositoryContext),
    artifact
  );

  return artifact;
}
