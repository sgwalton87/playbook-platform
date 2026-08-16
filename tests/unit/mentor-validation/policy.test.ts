import { describe, expect, it } from "vitest";
import { evaluateMentorValidation } from "@/lib/mentor-validation";

describe("Mentor validation policy", () => {
  it.each(["parent_guardian", "coach"] as const)(
    "validates with one active %s approval",
    (relationship) => {
      expect(
        evaluateMentorValidation([
          { approverUserId: "support-1", relationship, active: true },
        ])
      ).toMatchObject({
        validated: true,
        method: "parent_or_coach",
        validApprovalCount: 1,
      });
    }
  );

  it("validates with two distinct active support-system members", () => {
    expect(
      evaluateMentorValidation([
        { approverUserId: "educator-1", relationship: "educator", active: true },
        { approverUserId: "mentor-2", relationship: "mentor", active: true },
      ])
    ).toMatchObject({
      validated: true,
      method: "two_support_members",
      validApprovalCount: 2,
    });
  });

  it("does not count the same supporter twice", () => {
    expect(
      evaluateMentorValidation([
        { approverUserId: "educator-1", relationship: "educator", active: true },
        { approverUserId: "educator-1", relationship: "mentor", active: true },
      ])
    ).toMatchObject({
      validated: false,
      method: null,
      validApprovalCount: 1,
    });
  });

  it("ignores inactive approvals and Mentor self-approval", () => {
    expect(
      evaluateMentorValidation(
        [
          { approverUserId: "mentor-pending", relationship: "coach", active: true },
          { approverUserId: "support-inactive", relationship: "parent_guardian", active: false },
          { approverUserId: "support-1", relationship: "educator", active: true },
        ],
        "mentor-pending"
      )
    ).toMatchObject({
      validated: false,
      method: null,
      validApprovalCount: 1,
      validApproverUserIds: ["support-1"],
    });
  });
});
