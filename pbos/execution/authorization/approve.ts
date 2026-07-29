import path from "node:path";
import { Runtime, Artifacts } from "../../kernel";
import type { ExecutionAuthorizationRecord, AuthorizationStatus } from "./types";

/**
 * Approve an execution authorization record.
 *
 * Layer 7 Enforcement: Updates authorization status to AUTHORIZED.
 * This simulates an approval decision and is used for testing and
 * integration with external authorization systems.
 *
 * In production, this would be called by an authorization service
 * after governance review.
 */
export function approveExecutionAuthorization(
  approvedBy: string,
  approvalReason: string,
  rootDir = process.cwd()
): ExecutionAuthorizationRecord {
  const artifactPath = path.join(
    rootDir,
    Artifacts.executionAuthorization
  );

  const authorization = Runtime.load<ExecutionAuthorizationRecord>(
    artifactPath
  );

  assertDecisionTransition(authorization, "AUTHORIZED");

  if (authorization.status === "AUTHORIZED") {
    return authorization;
  }

  const approved: ExecutionAuthorizationRecord = {
    ...authorization,
    status: "AUTHORIZED",
    approvedBy,
    approvalReason,
    authorizedAt: new Date().toISOString(),
  };

  Runtime.save(artifactPath, approved, "execution-authorization");

  return approved;
}

/**
 * Deny an execution authorization record.
 *
 * Layer 7 Enforcement: Updates authorization status to DENIED.
 * This documents an approval rejection.
 */
export function denyExecutionAuthorization(
  deniedBy: string,
  denialReason: string,
  rootDir = process.cwd()
): ExecutionAuthorizationRecord {
  const artifactPath = path.join(
    rootDir,
    Artifacts.executionAuthorization
  );

  const authorization = Runtime.load<ExecutionAuthorizationRecord>(
    artifactPath
  );

  assertDecisionTransition(authorization, "DENIED");

  if (authorization.status === "DENIED") {
    return authorization;
  }

  const denied: ExecutionAuthorizationRecord = {
    ...authorization,
    status: "DENIED",
    approvedBy: deniedBy,
    approvalReason: denialReason,
    authorizedAt: new Date().toISOString(),
  };

  Runtime.save(artifactPath, denied, "execution-authorization");

  return denied;
}

/**
 * Set authorization status explicitly.
 *
 * For testing and advanced authorization workflows.
 */
export function setAuthorizationStatus(
  status: AuthorizationStatus,
  metadata: {
    approvedBy?: string | null;
    approvalReason?: string | null;
  } = {},
  rootDir = process.cwd()
): ExecutionAuthorizationRecord {
  const artifactPath = path.join(
    rootDir,
    Artifacts.executionAuthorization
  );

  const authorization = Runtime.load<ExecutionAuthorizationRecord>(
    artifactPath
  );

  assertDecisionTransition(authorization, status);

  if (authorization.status === status) {
    return authorization;
  }

  const updated: ExecutionAuthorizationRecord = {
    ...authorization,
    status,
    approvedBy: metadata.approvedBy ?? authorization.approvedBy,
    approvalReason: metadata.approvalReason ?? authorization.approvalReason,
    authorizedAt: status !== "PENDING" ? (new Date().toISOString()) : null,
  };

  Runtime.save(artifactPath, updated, "execution-authorization");

  return updated;
}

function assertDecisionTransition(
  authorization: ExecutionAuthorizationRecord,
  nextStatus: AuthorizationStatus
): void {
  if (
    authorization.status !== "PENDING" &&
    authorization.status !== nextStatus
  ) {
    throw new Error(
      `Authorization decision is immutable after status ${authorization.status}.`
    );
  }
}
