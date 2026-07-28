export * from "./schema";
export * from "./loader";
export * from "./validator";
export * from "./generate";

import type { ContextValidationResult } from "./schema";
import {
  loadRepositoryContextArtifact,
  loadRepositoryContextSnapshot,
} from "./loader";
import { validateRepositoryContext } from "./validator";

export function verifyStoredRepositoryContext(
  rootDir = process.cwd()
): ContextValidationResult {
  try {
    return validateRepositoryContext({
      artifact: loadRepositoryContextArtifact(rootDir),
      observed: loadRepositoryContextSnapshot(rootDir),
      expectedRoot: rootDir,
    });
  } catch (error: unknown) {
    return {
      valid: false,
      errors: [
        `Context validation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }
}
