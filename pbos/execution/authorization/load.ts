import path from "node:path";
import { Runtime, Artifacts } from "../../kernel";
import { decodeExecutionAuthorization } from "../../runtime/artifact-decoders";
import type { ExecutionAuthorizationRecord } from "./types";

/**
 * Load an execution authorization record from the runtime artifact.
 *
 * Layer 7: Loads the authorization created in Layer 6 and checks its status.
 * This allows external authorization systems to update the status before
 * Layer 7 enforces execution eligibility.
 *
 * Throws error if artifact does not exist.
 */
export function loadExecutionAuthorization(
  rootDir = process.cwd()
): ExecutionAuthorizationRecord {
  const artifactPath = path.join(
    rootDir,
    Artifacts.executionAuthorization
  );

  return decodeExecutionAuthorization(Runtime.load(artifactPath));
}

/**
 * Load or return undefined if authorization artifact does not exist.
 *
 * Layer 7: Checks whether an authorization has been created.
 * Missing authorization blocks execution (fail closed).
 */
export function loadExecutionAuthorizationOrUndefined(
  rootDir = process.cwd()
): ExecutionAuthorizationRecord | undefined {
  const artifactPath = path.join(
    rootDir,
    Artifacts.executionAuthorization
  );

  if (!Runtime.exists(artifactPath)) {
    return undefined;
  }

  return decodeExecutionAuthorization(Runtime.load(artifactPath));
}
