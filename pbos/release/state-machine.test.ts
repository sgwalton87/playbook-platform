import { describe, expect, it } from "vitest";
import {
  blockingConditionsForPromotion,
  canTransition,
  createTransition,
  resolvePromotionState,
  validateTransition,
  type ReleaseEnvironment,
} from "./state-machine";

const localEnvironment: ReleaseEnvironment = {
  name: "local",
  gitRemoteAvailable: true,
  gitCredentialsAvailable: true,
  repositoryWritable: true,
  pullRequestPossible: true,
  tagCreationPossible: true,
};

const sandboxEnvironment: ReleaseEnvironment = {
  name: "sandbox",
  gitRemoteAvailable: false,
  gitCredentialsAvailable: false,
  repositoryWritable: true,
  pullRequestPossible: false,
  tagCreationPossible: false,
};

describe("PBOS release state machine", () => {
  it("allows canonical state transitions", () => {
    expect(canTransition("DRAFT", "ENGINEERING_REVIEW")).toBe(true);
    expect(canTransition("ENGINEERING_REVIEW", "ENGINEERING_APPROVED")).toBe(true);
    expect(canTransition("ENGINEERING_APPROVED", "PROMOTION_PENDING")).toBe(true);
    expect(canTransition("PROMOTION_PENDING", "PROMOTION_COMPLETE")).toBe(true);
    expect(canTransition("PROMOTION_COMPLETE", "AUDIT_COMPLETE")).toBe(true);
    expect(canTransition("AUDIT_COMPLETE", "ARCHIVED")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => validateTransition("DRAFT", "PROMOTION_COMPLETE")).toThrow("Invalid PBOS release transition");
  });

  it("keeps sandbox promotion pending without failing engineering review", () => {
    const result = resolvePromotionState(sandboxEnvironment);

    expect(result.state).toBe("PROMOTION_PENDING");
    expect(result.blockers).toContain("Git remote unavailable");
    expect(result.reason).toContain("Engineering review remains valid");
  });

  it("allows local promotion when remote and credentials exist", () => {
    const result = resolvePromotionState(localEnvironment);

    expect(result.state).toBe("PROMOTION_COMPLETE");
    expect(result.blockers).toEqual([]);
  });

  it("records release evidence fields for a transition", () => {
    const transition = createTransition({
      previousState: "ENGINEERING_APPROVED",
      currentState: "PROMOTION_PENDING",
      transitionReason: "Remote is unavailable in sandbox.",
      environment: sandboxEnvironment,
      blockingConditions: blockingConditionsForPromotion(sandboxEnvironment),
    });

    expect(transition.currentState).toBe("PROMOTION_PENDING");
    expect(transition.previousState).toBe("ENGINEERING_APPROVED");
    expect(transition.transitionTimestamp).toEqual(expect.any(String));
    expect(transition.blockingConditions).toContain("Git remote unavailable");
  });
});
