import { artifactDigest } from "../../kernel";
import {
  REPOSITORY_CONTEXT_VERSION,
  type RepositoryContextArtifact,
  type RepositoryContextSnapshot,
} from "../schema";

export function buildRepositoryContextArtifact(
  snapshot: RepositoryContextSnapshot,
  capturedAt: string
): RepositoryContextArtifact {
  return {
    version: REPOSITORY_CONTEXT_VERSION,
    capturedAt,
    snapshot,
    identity: artifactDigest(snapshot),
  };
}
