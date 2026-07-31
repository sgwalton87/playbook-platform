import { describe, expect, it } from "vitest";
import { buildPBOSRecoveryAssessment } from "../recovery";
import type { PBOSRecoveryEvidence } from "../recovery";
import {
  createOperatorPlan,
  executeSafeOperatorActions,
  formatOperatorReport,
  operatorPipelineReady,
  parseOperatorIntent,
  OPERATOR_CAPABILITIES,
} from "./index";

const timestamp = "2026-07-31T12:00:00.000Z";

function evidence(
  overrides: Partial<PBOSRecoveryEvidence> = {}
): PBOSRecoveryEvidence {
  return {
    repository: {
      identity: "playbook-platform",
      branch: "pbos/test",
      commit: "a".repeat(40),
      working_tree: "CLEAN",
      artifact_state: "VALID",
    },
    reconciliation: {
      reconciliation_state: "REVIEW_REQUIRED",
      previous_identity: "old",
      proposed_identity: "new",
      stored_identity: "old",
      validation: "FAIL",
    },
    trusted: false,
    trustedContextIdentity: null,
    boundary: "INVALID",
    launchApproval: "INVALID",
    refreshApproval: "INVALID",
    refreshApprovalState: null,
    findings: ["Repository identity changed."],
    ...overrides,
  };
}

function plan(input = evidence()) {
  return createOperatorPlan(
    parseOperatorIntent("RUN_IT"),
    buildPBOSRecoveryAssessment(input, timestamp)
  );
}

describe("PBOS autonomous operator experience", () => {
  it("accepts RUN as the governed RUN_IT intent", () => {
    expect(parseOperatorIntent("RUN_IT")).toBe("RUN_IT");
    expect(parseOperatorIntent("run it")).toBe("RUN_IT");
  });

  it("selects change-boundary authority without asking for lifecycle choices", () => {
    const result = plan();
    expect(result.decision.transition).toBe("CHANGE");
    expect(result.human_action?.command).toBe("npm run pbos:change-boundary");
  });

  it("requires refresh approval only when boundary and launch authority are valid", () => {
    const result = plan(evidence({
      boundary: "VALID",
      launchApproval: "VALID",
    }));
    expect(result.decision.transition).toBe("RECONCILE");
    expect(result.human_action?.command).toBe("npm run pbos:approve-refresh");
  });

  it("does not prompt when context is trusted", () => {
    const result = plan(evidence({
      trusted: true,
      boundary: "VALID",
      launchApproval: "VALID",
      refreshApproval: "VALID",
      refreshApprovalState: "APPLIED",
      reconciliation: {
        reconciliation_state: "VERIFIED",
        previous_identity: "current",
        proposed_identity: "current",
        stored_identity: "current",
        validation: "PASS",
      },
      findings: [],
    }));
    expect(result.decision.transition).toBe("NONE");
    expect(result.human_action).toBeNull();
  });

  it("produces deterministic plans and reports for identical state", () => {
    const assessment = buildPBOSRecoveryAssessment(evidence(), timestamp);
    const first = createOperatorPlan("RUN_IT", assessment);
    const second = createOperatorPlan("RUN_IT", assessment);
    expect(second).toEqual(first);
    expect(
      formatOperatorReport(executeSafeOperatorActions(first), assessment)
    ).toBe(
      formatOperatorReport(executeSafeOperatorActions(second), assessment)
    );
  });

  it("keeps operator execution read-only while authority is required", () => {
    const result = executeSafeOperatorActions(plan());
    expect(result.status).toBe("WAITING_FOR_AUTHORITY");
    expect(result.mutation_performed).toBe(false);
  });

  it("reports an operational execution pipeline", () => {
    expect(operatorPipelineReady()).toBe(true);
    expect(OPERATOR_CAPABILITIES.every(
      ({ status }) => status === "OPERATIONAL"
    )).toBe(true);
  });
});
