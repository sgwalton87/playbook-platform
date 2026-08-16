export type MentorValidatorRelationship =
  | "parent_guardian"
  | "coach"
  | "educator"
  | "mentor"
  | "district_admin"
  | "university_partner"
  | "employer_partner";

export interface MentorValidationApproval {
  approverUserId: string;
  relationship: MentorValidatorRelationship;
  active: boolean;
}

export interface MentorValidationDecision {
  validated: boolean;
  method: "parent_or_coach" | "two_support_members" | null;
  validApprovalCount: number;
  validApproverUserIds: readonly string[];
}

/**
 * Mirrors the database activation threshold without granting authority itself.
 * The database RPC remains the enforcement boundary. This evaluator supports
 * deterministic UI state, unit tests, and evidence reporting.
 */
export function evaluateMentorValidation(
  approvals: readonly MentorValidationApproval[],
  mentorUserId?: string | null
): MentorValidationDecision {
  const uniqueActive = new Map<string, MentorValidationApproval>();

  for (const approval of approvals) {
    if (!approval.active) continue;
    if (!approval.approverUserId) continue;
    if (mentorUserId && approval.approverUserId === mentorUserId) continue;
    if (!uniqueActive.has(approval.approverUserId)) {
      uniqueActive.set(approval.approverUserId, approval);
    }
  }

  const validApprovals = [...uniqueActive.values()];
  const privileged = validApprovals.some(
    ({ relationship }) =>
      relationship === "parent_guardian" || relationship === "coach"
  );

  if (privileged) {
    return {
      validated: true,
      method: "parent_or_coach",
      validApprovalCount: validApprovals.length,
      validApproverUserIds: validApprovals.map(({ approverUserId }) => approverUserId),
    };
  }

  if (validApprovals.length >= 2) {
    return {
      validated: true,
      method: "two_support_members",
      validApprovalCount: validApprovals.length,
      validApproverUserIds: validApprovals.map(({ approverUserId }) => approverUserId),
    };
  }

  return {
    validated: false,
    method: null,
    validApprovalCount: validApprovals.length,
    validApproverUserIds: validApprovals.map(({ approverUserId }) => approverUserId),
  };
}
