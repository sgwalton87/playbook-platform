import { artifactDigest } from "../../kernel/identity";
import type {
  AgentEvidence,
  AgentIdentity,
  AgentPermission,
  AgentScope,
  AgentDecision,
} from "./types";

const ALWAYS_PROHIBITED = [
  "SELF_AUTHORIZE",
  "MODIFY_PERMISSIONS",
  "SELF_CERTIFY",
  "CHANGE_GOVERNANCE",
];

export function governAgentAction(input: {
  readonly agent: AgentIdentity;
  readonly permission: AgentPermission;
  readonly scope: AgentScope;
  readonly evidence: AgentEvidence;
  readonly requested_action: string;
  readonly timestamp: string;
}): AgentDecision {
  const findings = [
    ...(!input.agent.owner ? ["Agent owner is missing."] : []),
    ...(input.evidence.sources.length === 0 ? ["Agent evidence is missing."] : []),
    ...(!input.permission.actions.includes(input.requested_action)
      ? ["Requested action is outside permission."]
      : []),
    ...([...ALWAYS_PROHIBITED, ...input.scope.prohibited_actions].includes(
      input.requested_action
    )
      ? ["Requested action is prohibited."]
      : []),
    ...(Date.parse(input.permission.expires_at) <= Date.parse(input.timestamp)
      ? ["Agent permission is expired."]
      : []),
  ];
  const body: AgentDecision = {
    id: `AGENT-DECISION-${input.agent.id}-${artifactDigest(input).slice(0, 12)}`,
    agent: input.agent,
    requested_action: input.requested_action,
    permission: input.permission,
    scope: input.scope,
    evidence: input.evidence,
    admitted: findings.length === 0,
    findings,
    human_approval_required: true,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
