/**
 * Explicit authorization states for execution governance.
 *
 * PENDING - Authorization decision not yet made (blocks execution)
 * AUTHORIZED - Decision approved; execution may proceed (passes validation)
 * DENIED - Decision rejected; execution is blocked (blocks execution)
 *
 * Only AUTHORIZED state permits execution eligibility.
 */
export type AuthorizationStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "DENIED";

/**
 * Execution authorization record.
 *
 * Layer 6 creates this artifact to document the authorization decision
 * required before execution eligibility. This record:
 *
 * - References the execution contract
 * - References the work package
 * - Records the authorization decision
 * - Maintains audit trail of approval
 * - Tracks evidence review
 *
 * Fail-closed: Only AUTHORIZED status passes validation.
 */
export interface ExecutionAuthorizationRecord {
  id: string;

  version: string;

  contractId: string;

  workPackageId: string;

  gateId: string;

  status: AuthorizationStatus;

  approvedBy: string | null;

  approvalReason: string | null;

  evidenceReviewed: string[];

  createdAt: string;

  authorizedAt: string | null;
}
