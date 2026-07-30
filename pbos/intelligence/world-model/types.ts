import type { GovernedEvidenceReference } from "../../cognitive-control-plane/types";

export type EntityKind =
  | "SCHOLAR"
  | "FAMILY"
  | "SCHOOL"
  | "UNIVERSITY"
  | "MENTOR"
  | "COACH"
  | "ORGANIZATION"
  | "EMPLOYER"
  | "OPPORTUNITY"
  | "COMMUNITY";

export interface Entity {
  readonly id: string;
  readonly kind: EntityKind;
  readonly organization_scope: string;
  readonly evidence: readonly GovernedEvidenceReference[];
}

export interface Relationship {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly type: string;
  readonly evidence: readonly GovernedEvidenceReference[];
}

export interface Dependency {
  readonly source_id: string;
  readonly target_id: string;
  readonly required: boolean;
}

export interface WorldStateSnapshot {
  readonly id: string;
  readonly entities: readonly Entity[];
  readonly relationships: readonly Relationship[];
  readonly dependencies: readonly Dependency[];
  readonly observed_at: string;
  readonly confidence: number;
  readonly digest: string;
}
