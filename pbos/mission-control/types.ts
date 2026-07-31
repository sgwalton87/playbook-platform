import type { KernelCommandName, KernelCommandResult } from "../commands/kernel-command-bus";

export type MissionControlCommand = Extract<
  KernelCommandName,
  "status" | "next" | "run"
>;

export type MissionControlPhase =
  | "BLOCKED"
  | "WAITING_FOR_AUTHORITY"
  | "READY"
  | "ACTIVE"
  | "REVIEW"
  | "COMPLETE"
  | "FAILED";

export interface MissionControlOutcome {
  readonly phase: MissionControlPhase;
  readonly successful: boolean;
  readonly milestone: string | null;
  readonly package_id: string | null;
  readonly execution_id: string | null;
  readonly provider: string | null;
  readonly task: string | null;
  readonly authority_reused: boolean;
  readonly evidence: "CAPTURED" | "VALIDATED" | "FAILED" | "NOT_AVAILABLE";
  readonly advancement: "COMPLETE" | "BLOCKED" | "NOT_ASSESSED";
  readonly recovery_command: string | null;
  readonly next_milestone: string | null;
}

export type MissionCommandDispatcher = (
  command: MissionControlCommand
) => Promise<KernelCommandResult>;

export interface MissionControlResult {
  readonly successful: boolean;
  readonly outcome: MissionControlOutcome;
  readonly output: string;
}
