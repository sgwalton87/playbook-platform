import path from "node:path";
import { Artifacts, Runtime } from "../kernel";
import type { RepositoryContextArtifact } from "./schema";
import { buildRepositoryContextArtifact } from "./generator";
import { loadRepositoryContextSnapshot } from "./loader";

export function generateRepositoryContextArtifact(
  rootDir = process.cwd()
): RepositoryContextArtifact {
  const snapshot = loadRepositoryContextSnapshot(rootDir);
  const artifact = buildRepositoryContextArtifact(
    snapshot,
    new Date().toISOString()
  );

  Runtime.save(
    path.join(rootDir, Artifacts.repositoryContext),
    artifact,
    "repository-context"
  );

  return artifact;
}
