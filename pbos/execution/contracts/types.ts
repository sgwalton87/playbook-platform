export type ExecutionAuthorization =
  | "PENDING"
  | "AUTHORIZED"
  | "DENIED"
  | "COMPLETED";

export interface ExecutionContract {
  id: string;
  version: string;

  gateId: string;

  authorization: ExecutionAuthorization;

  objective: string;

  allowedFiles: string[];

  blockedFiles: string[];

  allowedOperations: string[];

  requiredValidation: string[];

  rollbackReference: string | null;

  evidenceRequirements: string[];

  createdAt: string;

  completedAt: string | null;
}
