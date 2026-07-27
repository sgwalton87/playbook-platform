import type { GateDefinition } from "../../planner/types";
import type { ExecutionContract } from "./types";

export function buildExecutionContract(
  gate: GateDefinition
): ExecutionContract {
  return {
    id: `execution-${gate.id}`,
    version: "1.0.0",

    gateId: gate.id,

    authorization: "PENDING",

    objective: gate.title,

    allowedFiles: [
      "pbos/execution/**",
      "pbos/adapters/**",
      "docs/**",
    ],

    blockedFiles: [
      ".env",
      "supabase/migrations/**",
      "app/**",
    ],

    allowedOperations: [
      "CREATE_FILE",
      "UPDATE_FILE",
      "RUN_VALIDATION",
      "GENERATE_EVIDENCE",
    ],

    requiredValidation: gate.validation,

    rollbackReference: null,

    evidenceRequirements: [
      "execution-report",
      "validation-results",
      "change-summary",
    ],

    createdAt: new Date().toISOString(),

    completedAt: null,
  };
}
