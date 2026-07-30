import { artifactDigest } from "../../kernel/identity";
import type {
  ChangeBoundaryAssessment,
  ChangeBoundaryDeclaration,
  ChangeInventory,
  ChangeRisk,
} from "./types";

const RISK_ORDER: Readonly<Record<ChangeRisk, number>> = {
  GREEN: 0,
  YELLOW: 1,
  RED: 2,
};

export function assessChangeBoundary(
  inventory: ChangeInventory,
  declaration: ChangeBoundaryDeclaration | null,
  timestamp: string
): ChangeBoundaryAssessment {
  const approved = new Set(declaration?.approved_files ?? []);
  const excluded = new Set(declaration?.excluded_files ?? []);
  const risk = inventory.changes.reduce<ChangeRisk>(
    (current, change) =>
      RISK_ORDER[change.risk_level] > RISK_ORDER[current]
        ? change.risk_level
        : current,
    "GREEN"
  );
  const change_summary = inventory.changes.map((change) => {
    const classification = approved.has(change.file_path)
      ? "INCLUDE" as const
      : excluded.has(change.file_path)
        ? "EXCLUDE" as const
        : "REVIEW_REQUIRED" as const;
    return {
      file_path: change.file_path,
      classification,
      domain: change.domain,
      risk: change.risk_level,
      recommendation: change.approval_status === "APPROVED_CANDIDATE"
        ? "INCLUDE" as const
        : "REVIEW_REQUIRED" as const,
      reason: `${change.owner} owns this ${change.change_type.toLowerCase()} ${change.domain} change.`,
    };
  });
  const classification_summary = {
    INCLUDE: change_summary.filter(({ classification }) => classification === "INCLUDE").length,
    EXCLUDE: change_summary.filter(({ classification }) => classification === "EXCLUDE").length,
    REVIEW_REQUIRED: change_summary.filter(({ classification }) => classification === "REVIEW_REQUIRED").length,
  };
  const body = {
    boundary_id: declaration?.boundary_id ?? `UNDECLARED-${inventory.content_identity.slice(0, 16)}`,
    repository_identity: inventory.repository_identity,
    commit_identity: inventory.commit_identity,
    branch_identity: inventory.branch_identity,
    changed_file_count: inventory.changes.length,
    scope_digest: inventory.content_identity,
    included_files: [...approved].sort(),
    excluded_files: [...excluded].sort(),
    change_summary,
    risk_level: risk,
    classification_summary,
    owner_identity: declaration?.requester_identity ?? "UNASSIGNED",
    created_at: timestamp,
  };
  return { ...body, digest: artifactDigest(body) };
}
