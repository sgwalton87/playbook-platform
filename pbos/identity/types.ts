export type PBOSIdentityKind =
  | "EVIDENCE"
  | "CLAIM"
  | "DECISION"
  | "ACTION"
  | "OUTCOME"
  | "STATE"
  | "ACTOR";

export interface PBOSIdentity {
  readonly id: string;
  readonly kind: PBOSIdentityKind;
  readonly authority: string;
  readonly organization_scope: string;
  readonly version: string;
}
