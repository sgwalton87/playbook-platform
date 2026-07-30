import { artifactDigest } from "../../kernel/identity";
import type {
  KeyLifecycleRecord,
  KeyOwnershipRecord,
  KeyRevocationEvent,
  KeyRotationEvent,
  KeyVerificationRecord,
} from "./types";

export class TrustKeyAuthority {
  verify(input: {
    readonly ownership: KeyOwnershipRecord;
    readonly lifecycle: KeyLifecycleRecord;
    readonly at: string;
    readonly validator_id: string;
    readonly revocations: readonly KeyRevocationEvent[];
  }): KeyVerificationRecord {
    const findings = [
      ...(!input.ownership.owner_id || !input.ownership.authority
        ? ["Key ownership authority is missing."]
        : []),
      ...(input.lifecycle.key_id !== input.ownership.key_id
        ? ["Key lifecycle identity mismatches ownership."]
        : []),
      ...(input.lifecycle.evidence_ids.length === 0
        ? ["Key lifecycle evidence is missing."]
        : []),
      ...(input.lifecycle.state !== "ACTIVE"
        ? [`Key lifecycle is ${input.lifecycle.state}.`]
        : []),
      ...(Date.parse(input.lifecycle.expires_at) <= Date.parse(input.at)
        ? ["Key is expired."]
        : []),
      ...(input.revocations.some(
        ({ key_id }) => key_id === input.ownership.key_id
      )
        ? ["Key is revoked."]
        : []),
      ...(artifactDigest({
        ...input.ownership,
        digest: undefined,
      }) !== input.ownership.digest
        ? ["Key ownership record is altered."]
        : []),
      ...(artifactDigest({
        ...input.lifecycle,
        digest: undefined,
      }) !== input.lifecycle.digest
        ? ["Key lifecycle record is altered."]
        : []),
    ];
    const body: KeyVerificationRecord = {
      key_id: input.ownership.key_id,
      valid: findings.length === 0,
      findings,
      verified_by: input.validator_id,
      verified_at: input.at,
      digest: "",
    };
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }

  validateRotation(
    event: KeyRotationEvent,
    previous: KeyOwnershipRecord,
    next: KeyOwnershipRecord
  ): readonly string[] {
    return [
      ...(event.previous_key_id !== previous.key_id ||
      event.next_key_id !== next.key_id
        ? ["Key rotation identity is invalid."]
        : []),
      ...(previous.owner_id !== next.owner_id ||
      previous.provider_id !== next.provider_id
        ? ["Key rotation changes ownership or provider."]
        : []),
      ...(!event.authorized_by || event.evidence_ids.length === 0
        ? ["Key rotation authority or evidence is missing."]
        : []),
      ...(artifactDigest({ ...event, digest: undefined }) !== event.digest
        ? ["Key rotation record is altered."]
        : []),
    ];
  }
}
