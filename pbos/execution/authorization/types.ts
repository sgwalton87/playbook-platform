export type AuthorizationStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "DENIED";

export interface ExecutionAuthorizationRecord {

  id: string;

  version: string;

  contractId: string;

  gateId: string;

  status: AuthorizationStatus;

  approvedBy: string | null;

  approvalReason: string | null;

  evidenceReviewed: string[];

  createdAt: string;

  authorizedAt: string | null;
}
