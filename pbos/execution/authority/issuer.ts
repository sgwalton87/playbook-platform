import type { TrustedBuildContext } from "../../context/activation";
import { artifactDigest } from "../../kernel/identity";
import type { CodexExecutionPackage } from "../../orchestration";
import type { ProviderContract } from "../providers";
import type {
  ExecutionAuthorization,
  ExecutionAuthorityRecord,
} from "./types";

export function issueExecutionAuthorization(input: {
  readonly authority: ExecutionAuthorityRecord;
  readonly context: TrustedBuildContext;
  readonly package: CodexExecutionPackage;
  readonly provider: ProviderContract;
  readonly created_by: string;
  readonly approved_by: string;
  readonly issued_at: string;
}): ExecutionAuthorization {
  const { authority, context, package: executionPackage, provider } = input;
  if (
    !input.created_by ||
    !input.approved_by ||
    input.created_by === input.approved_by ||
    authority.authority_status !== "AUTHORIZED" ||
    authority.package_id !== executionPackage.package_id ||
    authority.package_digest !== executionPackage.digest ||
    authority.context_id !== context.context_id ||
    authority.context_digest !== context.digest ||
    authority.agent_id !== provider.provider_id ||
    Date.parse(authority.expiration_time) <= Date.parse(input.issued_at) ||
    !authority.required_capabilities.every((capability) =>
      provider.capabilities.includes(capability)
    ) ||
    !authority.evidence_requirements.every((requirement) =>
      provider.evidence_contract.includes(requirement)
    )
  ) {
    throw new Error("Execution authorization issuance rejected.");
  }
  const body = {
    authorization_id: `EXECUTION-AUTHORIZATION-${artifactDigest({
      authority: authority.digest,
      provider: provider.digest,
    }).slice(0, 16)}`,
    package_id: executionPackage.package_id,
    package_digest: executionPackage.digest,
    repository_identity: context.repository_identity,
    branch_identity: context.branch_identity,
    commit_identity: context.commit_identity,
    context_digest: context.digest,
    provider_id: provider.provider_id,
    provider_contract_digest: provider.digest,
    allowed_actions: [...authority.scope].sort(),
    prohibited_actions: [...authority.blocked_operations].sort(),
    expiration: authority.expiration_time,
    evidence_requirements: [...authority.evidence_requirements].sort(),
    trusted_context_identity: context.context_id,
    created_by: input.created_by,
    approved_by: input.approved_by,
    status: "AUTHORIZED" as const,
    issued_at: input.issued_at,
  };
  return { ...body, digest: artifactDigest(body) };
}

export function validateExecutionAuthorization(input: {
  readonly authorization: ExecutionAuthorization;
  readonly context: TrustedBuildContext;
  readonly package: CodexExecutionPackage;
  readonly provider: ProviderContract;
  readonly timestamp: string;
}): readonly string[] {
  const { authorization, context, package: executionPackage, provider } = input;
  return [
    ...(authorization.digest !==
    artifactDigest({ ...authorization, digest: undefined })
      ? ["Execution authorization digest is invalid."]
      : []),
    ...(authorization.package_id !== executionPackage.package_id ||
    authorization.package_digest !== executionPackage.digest
      ? ["Execution authorization package identity does not match."]
      : []),
    ...(authorization.repository_identity !== context.repository_identity ||
    authorization.branch_identity !== context.branch_identity ||
    authorization.commit_identity !== context.commit_identity ||
    authorization.context_digest !== context.digest
      ? ["Execution authorization repository context does not match."]
      : []),
    ...(authorization.provider_id !== provider.provider_id ||
    authorization.provider_contract_digest !== provider.digest
      ? ["Execution authorization provider identity does not match."]
      : []),
    ...(Date.parse(authorization.expiration) <= Date.parse(input.timestamp)
      ? ["Execution authorization is expired."]
      : []),
    ...(authorization.allowed_actions.length === 0
      ? ["Execution authorization has no allowed actions."]
      : []),
    ...authorization.allowed_actions
      .filter((allowed) =>
        authorization.prohibited_actions.some(
          (blocked) =>
            allowed === blocked || allowed.startsWith(`${blocked}/`)
        )
      )
      .map((allowed) => `Authorized action is prohibited: ${allowed}.`),
  ];
}
