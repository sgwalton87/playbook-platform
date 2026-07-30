import { describe, expect, it } from "vitest";
import { formatItCommand } from "./format";

describe("it command presentation", () => {
  it("presents deterministic readiness guidance without claiming execution", () => {
    const output = formatItCommand({
      loop_id: "LOOP-1",
      readiness: "NOT_READY",
      phases_completed: ["OBSERVE"],
      mission_alignment: {
        aligned: true,
        mission: "Advance the Playbook Platform through governed development",
        findings: [],
        evidence: ["evidence"],
        digest: "mission",
      },
      next_play: null,
      risk: null,
      guidance: {
        current_blocker: "Context is invalid.",
        business_impact: "Planning is unavailable.",
        why: "Stored identity is stale.",
        required_resolution: ["Reconcile context."],
        responsible_authority: "Context Authority",
        commands: ["npm run pbos:context-reconcile"],
        expected_next_state: "Planning available.",
      },
      mission_control: {
        current_mission: "Advance the Playbook Platform through governed development",
        current_state: "NOT_READY",
        current_blockers: ["Context is invalid."],
        current_authority: "Context Authority",
        current_execution: "NOT_STARTED",
        current_outcome: "NOT_READY",
        next_action: "Reconcile context.",
        launch_status: "HOLD",
        authority_state: "MISSING",
        execution_state: "NOT_STARTED",
        evidence_state: "NOT_AVAILABLE",
        change_boundary_status: "MISSING",
        launch_approval_status: "MISSING",
        context_status: "MISSING",
        digest: "mission-control",
      },
      launch_readiness: {
        assessment_id: "launch-readiness",
        launch_status: "HOLD",
        system_status: "PBOS is healthy but prerequisites are incomplete.",
        current_blockers: ["Context is invalid."],
        business_impact: "Planning is unavailable.",
        technical_explanation: "Stored identity is stale.",
        responsible_authority: "Context Authority",
        required_remediation: ["Reconcile context."],
        expected_resolution_state: "Planning available.",
        timestamp: "2026-07-30T00:00:00.000Z",
        digest: "launch-digest",
      },
      outcome: "STOPPED_SAFELY",
      mutation: "NOT_PERFORMED",
      evidence: ["evidence"],
      digest: "result",
    });
    expect(output).toContain("System readiness: NOT_READY");
    expect(output).toContain("Launch status: HOLD");
    expect(output).toContain("Human Evidence: MISSING");
    expect(output).toContain("Change boundary: MISSING");
    expect(output).toContain("Launch approval: MISSING");
    expect(output).toContain("Trusted context: MISSING");
    expect(output).toContain("npm run pbos:context-reconcile");
    expect(output).toContain("No action was executed outside existing PBOS authority.");
  });
});
