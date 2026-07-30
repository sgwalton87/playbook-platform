import { verify } from "node:crypto";
import { artifactDigest } from "../kernel/identity";
import { validateTemporalIdentity } from "../temporal";
import type {
  EvidenceVerification,
  ValidatorIdentity,
  VerificationEvidence,
  VerificationRequest,
} from "./types";

export class CryptographicEvidenceRegistry {
  readonly #validators: ReadonlyMap<string, ValidatorIdentity>;

  constructor(validators: readonly ValidatorIdentity[]) {
    this.#validators = new Map(validators.map((value) => [value.id, value]));
  }

  verify(request: VerificationRequest): VerificationEvidence {
    const validator = this.#validators.get(request.validator_id);
    const record = request.record;
    const certificate = record.certificate;
    const findings = [
      ...(!validator?.active ? ["Validator is unknown or inactive."] : []),
      ...(certificate.issuer_id !== request.validator_id
        ? ["Certificate issuer does not match validator."]
        : []),
      ...(certificate.evidence_identity.id !== record.identity.id ||
      certificate.evidence_digest !== record.digest
        ? ["Certificate identity or digest mismatches evidence."]
        : []),
      ...(record.provenance.length === 0 ? ["Provenance is missing."] : []),
      ...validateTemporalIdentity(record.temporal),
      ...(certificate.revoked_at !== null ? ["Certificate is revoked."] : []),
      ...(Date.parse(certificate.expires_at) <= Date.parse(request.requested_at)
        ? ["Certificate is expired."]
        : []),
      ...(artifactDigest({ ...record, record_digest: undefined }) !==
      record.record_digest
        ? ["Trust record integrity is invalid."]
        : []),
    ];
    if (validator?.active && findings.length === 0) {
      const signatureValid = verify(
        null,
        Buffer.from(record.digest, "utf8"),
        validator.public_key_pem,
        Buffer.from(certificate.signature.signature, "base64")
      );
      if (!signatureValid) findings.push("Evidence signature is invalid.");
    }
    const verificationBody: EvidenceVerification = {
      valid: findings.length === 0,
      findings,
      verified_by: request.validator_id,
      verified_at: request.requested_at,
      digest: "",
    };
    const verification = {
      ...verificationBody,
      digest: artifactDigest({
        ...verificationBody,
        digest: undefined,
      }),
    };
    const decisionBody = {
      request_id: request.id,
      decision: verification.valid ? ("VERIFIED" as const) : ("REJECTED" as const),
      validator_id: request.validator_id,
      findings,
      decided_at: request.requested_at,
      digest: "",
    };
    const decision = {
      ...decisionBody,
      digest: artifactDigest({ ...decisionBody, digest: undefined }),
    };
    const body = { request, decision, verification, digest: "" };
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }
}
