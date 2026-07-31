import { describe, expect, it, vi } from "vitest";
import { runMissionControl } from "./orchestrator";
import type { MissionControlCommand } from "./types";

function result(command: MissionControlCommand, output: string, successful = true) {
  return { command, output, successful };
}

function dispatcher(outputs: Partial<Record<MissionControlCommand, ReturnType<typeof result>>>) {
  return vi.fn(async (command: MissionControlCommand) =>
    outputs[command] ?? result(command, `${command} output`)
  );
}

const healthy = result("status", "Context Trust: VERIFIED\nPlanning Readiness: READY");
const planned = result(
  "next",
  "PBOS NEXT ANALYSIS\nNext Eligible Milestone: MILESTONE-001\nRisk: LOW"
);

describe("PBOS Mission Control", () => {
  it("coordinates one complete mission and continuation analysis", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "Milestone: MILESTONE-001\nExecution: SUCCEEDED\nEvidence: VALIDATED\nMilestone Advancement: COMPLETE"),
    });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.phase).toBe("COMPLETE");
    expect(mission.output).toContain("PBOS MISSION COMPLETE");
    expect(dispatch.mock.calls.map(([command]) => command)).toEqual(["status", "next", "run", "next"]);
  });

  it("fails closed when trusted context assessment fails", async () => {
    const dispatch = dispatcher({ status: result("status", "Context Trust: INVALID", false) });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.phase).toBe("BLOCKED");
    expect(mission.outcome.recovery_command).toBe("npm run pbos:recover");
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("pauses for missing approval", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "PBOS HUMAN ACTION REQUIRED\nPackage: PACKAGE-001\nCommand: npm run pbos:approve"),
    });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.phase).toBe("WAITING_FOR_AUTHORITY");
    expect(mission.output).toContain("HUMAN ACTION REQUIRED: npm run pbos:approve");
  });

  it("reports valid authority reuse", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "PBOS EXISTING AUTHORITY FOUND\nPBOS EXECUTION READY\nPackage: PACKAGE-001"),
    });
    expect((await runMissionControl(dispatch)).outcome.authority_reused).toBe(true);
  });

  it("does not treat invalid authority as reusable", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "PBOS HUMAN ACTION REQUIRED\nReason: Existing authority expired.\nCommand: npm run pbos:approve"),
    });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.authority_reused).toBe(false);
    expect(mission.outcome.phase).toBe("WAITING_FOR_AUTHORITY");
  });

  it("surfaces provider running telemetry", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "PBOS EXECUTION STARTED\nExecution: EXEC-001\nProvider: CODEX\nTask: TASK-001\nStatus: RUNNING"),
    });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.phase).toBe("ACTIVE");
    expect(mission.outcome.execution_id).toBe("EXEC-001");
  });

  it("surfaces provider timeout without inventing completion", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "PBOS EXECUTION WARNING\nState: NO_PROVIDER_RESPONSE\nMilestone Advancement: BLOCKED", false),
    });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.advancement).toBe("BLOCKED");
    expect(mission.output).not.toContain("Execution: SUCCEEDED");
  });

  it("reports provider failure", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "PROVIDER_FAILED\nValidation: FAIL", false),
    });
    expect((await runMissionControl(dispatch)).outcome.evidence).toBe("FAILED");
  });

  it("blocks advancement after evidence validation failure", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "Evidence: FAILED\nMilestone Advancement: BLOCKED", false),
    });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.phase).toBe("REVIEW");
    expect(dispatch).toHaveBeenCalledTimes(3);
  });

  it("reports successful evidence-gated advancement", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "Evidence: VALIDATED\nMilestone Advancement: COMPLETE"),
    });
    expect((await runMissionControl(dispatch)).outcome.advancement).toBe("COMPLETE");
  });

  it("prevents duplicate execution dispatch", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "Evidence: VALIDATED\nMilestone Advancement: COMPLETE"),
    });
    await runMissionControl(dispatch);
    expect(dispatch.mock.calls.filter(([command]) => command === "run")).toHaveLength(1);
  });

  it("reports the governed recovery continuation command", async () => {
    const dispatch = dispatcher({
      status: healthy,
      next: planned,
      run: result("run", "PBOS RECOVERY REQUIRED\nRecommended Action: npm run pbos:approve-refresh", false),
    });
    const mission = await runMissionControl(dispatch);
    expect(mission.outcome.recovery_command).toBe("npm run pbos:approve-refresh");
    expect(mission.output).toContain("PBOS MISSION BLOCKED");
  });
});
