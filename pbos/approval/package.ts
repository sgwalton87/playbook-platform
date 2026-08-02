import { loadChangeBoundary } from "../context/change-boundary";
import { artifactDigest } from "../kernel";

export function buildApprovalPackage(rootDir = process.cwd()) {
  const boundary = loadChangeBoundary(rootDir)?.latest;

  if (!boundary) {
    throw new Error(
      "No change boundary exists. Cannot create approval package."
    );
  }

  const body = {
    approval_type: boundary.boundary_type,

    repository: boundary.repository_identity,

    branch: boundary.branch_identity,

    commit: boundary.commit_identity,

    purpose: boundary.purpose,

    business_purpose: boundary.business_purpose,

    technical_purpose: boundary.technical_purpose,

    risk_level: "HIGH",

    required_decision:
      "Approve governed PBOS lifecycle transition",

    required_reviewer:
      "Human authorized reviewer",

    expiration:
      boundary.expiration,

    evidence: {
      inventory_digest:
        boundary.inventory_digest,

      context_digest:
        boundary.context_digest,

      manifest_digest:
        boundary.manifest_digest
    }
  };

  return {
    ...body,
    digest: artifactDigest(body)
  };
}
