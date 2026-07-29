import type {
  ContextValidationResult,
  RepositoryContextArtifact,
  RepositoryContextSnapshot,
} from "../schema";
import { validateRepositoryContext } from "../validator";

export function certifyRepositoryContext(options: {
  artifact: RepositoryContextArtifact;
  observed: RepositoryContextSnapshot;
  rootDir: string;
  now: Date;
}): ContextValidationResult {
  return validateRepositoryContext({
    artifact: options.artifact,
    observed: options.observed,
    expectedRoot: options.rootDir,
    now: options.now,
  });
}
