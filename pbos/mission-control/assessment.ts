import type { MissionControlOutcome } from "./types";

function field(output: string, label: string): string | null {
  const prefix = `${label}:`;
  const line = output.split("\n").find((candidate) => candidate.startsWith(prefix));
  const value = line?.slice(prefix.length).trim();
  return value && value !== "NONE" ? value : null;
}

function command(output: string): string | null {
  return output.match(/(?:Command|NEXT COMMAND|Recommended Action):\s*(npm run pbos:[\w-]+)/)?.[1] ?? null;
}

export function assessMissionOutput(
  output: string,
  successful: boolean
): MissionControlOutcome {
  const advancement = output.includes("Milestone Advancement: COMPLETE") ||
      output.includes("Advancement: COMPLETE")
    ? "COMPLETE" as const
    : output.includes("Milestone Advancement: BLOCKED") ||
        output.includes("Advancement: BLOCKED")
      ? "BLOCKED" as const
      : "NOT_ASSESSED" as const;
  const evidence = output.includes("Evidence: VALIDATED")
    ? "VALIDATED" as const
    : output.includes("Evidence: CAPTURED")
      ? "CAPTURED" as const
      : output.includes("Evidence: FAILED") || output.includes("Validation: FAIL")
        ? "FAILED" as const
        : "NOT_AVAILABLE" as const;
  const waiting = output.includes("PBOS HUMAN ACTION REQUIRED");
  const contextRecovery = output.includes("Context Trust: INVALID") ||
    output.includes("Context validation failed:");
  const recovery = contextRecovery || output.includes("PBOS RECOVERY REQUIRED") ||
    output.includes("CURRENT STATE: COMMITTED_CONTEXT_RECONCILIATION_REQUIRED") ||
    command(output) !== null;
  const active = output.includes("PBOS EXECUTION STARTED") ||
    output.includes("PBOS MISSION ACTIVE") ||
    output.includes("Status: RUNNING");
  const phase = advancement === "COMPLETE"
    ? "COMPLETE" as const
    : waiting
      ? "WAITING_FOR_AUTHORITY" as const
      : evidence === "FAILED" || advancement === "BLOCKED"
        ? "REVIEW" as const
        : !successful
          ? (recovery ? "BLOCKED" as const : "FAILED" as const)
          : active
            ? "ACTIVE" as const
            : output.includes("PBOS EXECUTION READY")
              ? "READY" as const
              : recovery
                ? "BLOCKED" as const
                : "READY" as const;

  return {
    phase,
    successful,
    milestone: field(output, "Milestone") ?? field(output, "Next Eligible Milestone"),
    package_id: field(output, "Package"),
    execution_id: field(output, "Execution"),
    provider: field(output, "Provider"),
    task: field(output, "Task"),
    authority_reused: output.includes("PBOS EXISTING AUTHORITY FOUND"),
    evidence,
    advancement,
    recovery_command: recovery
      ? command(output) ?? (contextRecovery ? "npm run pbos:recover" : null)
      : null,
    next_milestone: null,
  };
}

export function selectedMilestone(output: string): string | null {
  return field(output, "Next Eligible Milestone") ?? field(output, "Milestone");
}
