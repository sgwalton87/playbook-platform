export * from "./schema";
export * from "./loader";
export * from "./validator";
export * from "./generate";
export * from "./certification";
export * from "./generator";
export * from "./history";
export * from "./lifecycle";
export * from "./observer";
export * from "./reports";
export * from "./reconciliation";
export * from "./refresh";
export * from "./activation";
export * from "./change-boundary";

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
