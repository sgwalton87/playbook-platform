import { artifactDigest } from "../../kernel/identity";
import { refreshRepositoryContext } from "../lifecycle";
import { validateContextRefreshApproval } from "./approval";
import type {
  ContextRefreshApprovalRecord,
  ContextRefreshApproval,
  ContextRefreshAuthorityInput,
  ContextRefreshState,
} from "./types";

const TRANSITIONS: Readonly<Record<ContextRefreshState, readonly ContextRefreshState[]>> = {
  INVALID: ["DETECTED"],
  DETECTED: ["REVIEW_REQUIRED"],
  REVIEW_REQUIRED: ["APPROVED"],
  APPROVED: ["REFRESHING"],
  REFRESHING: ["VERIFIED"],
  VERIFIED: ["TRUSTED"],
  TRUSTED: [],
};

export class ContextRefreshAuthority {
  constructor(
    private readonly contextRefresher: typeof refreshRepositoryContext =
      refreshRepositoryContext
  ) {}

  transition(
    current: ContextRefreshApproval,
    state: ContextRefreshState,
    actor: string,
    approvalEvidence: string | null,
    timestamp: string
  ): ContextRefreshApproval {
    if (!actor || !TRANSITIONS[current.state].includes(state)) {
      throw new Error("Context refresh transition rejected.");
    }
    if (state === "APPROVED" && !approvalEvidence) {
      throw new Error("Context refresh approval evidence is required.");
    }
    const body: ContextRefreshApproval = {
      ...current,
      state,
      approved_by: state === "APPROVED" ? actor : current.approved_by,
      approval_evidence:
        state === "APPROVED" ? approvalEvidence : current.approval_evidence,
      timestamp,
      digest: "",
    };
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }

  refresh(
    rootDir: string,
    input: ContextRefreshAuthorityInput
  ): ReturnType<typeof refreshRepositoryContext> {
    if (
      input.request.state !== "APPROVED" ||
      !input.request.approved_by ||
      !input.request.approval_evidence ||
      input.request.reconciliation_digest !== input.reconciliation.digest
    ) {
      throw new Error("Governed context refresh authorization is invalid.");
    }
    return this.contextRefresher({
      rootDir,
      reason: input.request.reason,
    });
  }

  refreshApproved(
    rootDir: string,
    input: {
      readonly reconciliation: ContextRefreshAuthorityInput["reconciliation"];
      readonly approval: ContextRefreshApprovalRecord;
      readonly timestamp?: string;
    }
  ): ReturnType<typeof refreshRepositoryContext> {
    const validation = validateContextRefreshApproval({
      approval: input.approval,
      reconciliation: input.reconciliation,
      timestamp: input.timestamp ?? new Date().toISOString(),
    });
    if (!validation.valid) {
      throw new Error(
        `Governed context refresh authorization is invalid:\n${validation.findings.join("\n")}`
      );
    }
    return this.contextRefresher({
      rootDir,
      reason: input.approval.decision_reason,
    });
  }
}
