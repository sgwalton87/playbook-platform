import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../../kernel/contracts";
import type { EngineActivationDecision } from "../../kernel/engine-activation";

export type ScholarRecordDomain =
  | "PROFILE"
  | "ACADEMIC"
  | "ATHLETIC"
  | "GOAL"
  | "ACHIEVEMENT"
  | "ACTIVITY"
  | "INTEREST"
  | "DEVELOPMENT_MILESTONE";

export interface ScholarRecordEntry {
  readonly entry_id: string;
  readonly domain: ScholarRecordDomain;
  readonly label: string;
  readonly value: string;
  readonly source: "HUMAN" | "INSTITUTION" | "VERIFIED_SYSTEM";
  readonly owner_identity: string;
  readonly evidence_references: readonly string[];
  readonly human_confirmed: boolean;
  readonly recorded_at: string;
  readonly digest: string;
}

export interface ScholarRecordRevision {
  readonly revision: number;
  readonly previous_record_digest: string | null;
  readonly changed_entry_ids: readonly string[];
  readonly actor_identity: string;
  readonly authority_reference: string;
  readonly evidence_references: readonly string[];
  readonly timestamp: string;
  readonly digest: string;
}

export interface ScholarRecord {
  readonly record_id: string;
  readonly scholar_identity: string;
  readonly owner_identity: string;
  readonly organization_id: string;
  readonly tenant_id: string | null;
  readonly revision: number;
  readonly entries: readonly ScholarRecordEntry[];
  readonly history: readonly ScholarRecordRevision[];
  readonly created_at: string;
  readonly updated_at: string;
  readonly digest: string;
}

export interface ScholarRecordMutation {
  readonly mutation_id: string;
  readonly record_id: string;
  readonly expected_revision: number;
  readonly entry: ScholarRecordEntry;
  readonly identity: IdentityEnvelope;
  readonly authority: AuthorityEnvelope;
  readonly activation: EngineActivationDecision;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ScholarRecordActivationContract {
  readonly contract_id: string;
  readonly engine_id: "PBOS-ENGINE-SCHOLAR-RECORD";
  readonly scholar_identity: string;
  readonly capability_reference: string;
  readonly provider_reference: string;
  readonly kernel_activation_reference: string;
  readonly evidence_reference: string;
  readonly lifecycle_state: "ACTIVATED" | "BLOCKED";
  readonly activation: EngineActivationDecision;
  readonly timestamp: string;
  readonly digest: string;
}
