export interface CodexWorkPackage {
  id: string;

  version: string;

  gateId: string;

  objective: string;

  authorizationRequired: boolean;

  allowedFiles: string[];

  blockedFiles: string[];

  allowedOperations: string[];

  tasks: string[];

  requiredValidation: string[];

  evidenceRequirements: string[];

  createdAt: string;
}
