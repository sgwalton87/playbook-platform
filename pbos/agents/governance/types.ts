import type { GovernedEvidenceReference } from "../../cognitive-control-plane/types";

export interface AgentIdentity {
  readonly id: string;
  readonly owner: string;
  readonly model: string;
  readonly version: string;
  readonly organization_scope: string;
}

export interface AgentPermission {
  readonly capability: string;
  readonly actions: readonly string[];
  readonly expires_at: string;
}

export interface AgentScope {
  readonly purpose: string;
  readonly data_boundaries: readonly string[];
  readonly prohibited_actions: readonly string[];
}

export interface AgentEvidence {
  readonly sources: readonly GovernedEvidenceReference[];
  readonly trace_id: string;
}

export interface AgentDecision {
  readonly id: string;
  readonly agent: AgentIdentity;
  readonly requested_action: string;
  readonly permission: AgentPermission;
  readonly scope: AgentScope;
  readonly evidence: AgentEvidence;
  readonly admitted: boolean;
  readonly findings: readonly string[];
  readonly human_approval_required: true;
  readonly digest: string;
}
