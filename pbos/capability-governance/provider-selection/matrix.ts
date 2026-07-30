import {
  requireDigest,
  requireIdentifier,
} from "../../kernel/contracts";
import { providerEvidenceRequirementMatrixDigest } from "./identity";
import type { ProviderEvidenceRequirementMatrix } from "./types";

export function validateProviderEvidenceRequirementMatrix(
  value: ProviderEvidenceRequirementMatrix
): ProviderEvidenceRequirementMatrix {
  const errors: string[] = [];
  requireIdentifier(errors, "matrix.matrix_id", value.matrix_id);
  requireIdentifier(errors, "matrix.version", value.version);
  requireDigest(errors, "matrix.digest", value.digest);
  if (value.digest !== providerEvidenceRequirementMatrixDigest(value)) {
    errors.push("provider evidence requirement matrix digest is invalid.");
  }
  if (value.requirements.length === 0) {
    errors.push("provider evidence requirement matrix is empty.");
  }
  const keys = new Set<string>();
  for (const requirement of value.requirements) {
    const key = `${requirement.provider_type}:${requirement.required_evidence}`;
    if (keys.has(key)) {
      errors.push(`provider evidence requirement is duplicated: ${key}.`);
    }
    keys.add(key);
    if (
      !requirement.validation_method ||
      !requirement.reviewer_authority ||
      requirement.expiration_days <= 0
    ) {
      errors.push(`provider evidence requirement is invalid: ${key}.`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`Provider evidence matrix rejected: ${errors.join(" ")}`);
  }
  return Object.freeze({
    ...value,
    requirements: Object.freeze(
      value.requirements.map((item) => Object.freeze({ ...item }))
    ),
  });
}
