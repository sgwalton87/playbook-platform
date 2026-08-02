import { artifactDigest } from "../kernel";

export function createApprovalScope(input: {
  repository_identity: string;
  branch_identity: string;
  commit_identity: string;
  approved_files: readonly string[];
  excluded_files: readonly string[];
}) {
  const body = {
    repository_identity: input.repository_identity,
    branch_identity: input.branch_identity,
    commit_identity: input.commit_identity,
    approved_files: input.approved_files,
    excluded_files: input.excluded_files,
  };

  return {
    ...body,
    digest: artifactDigest(body),
  };
}
