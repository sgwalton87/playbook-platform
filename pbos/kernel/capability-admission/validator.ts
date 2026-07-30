import {
  contractResult,
  requireDigest,
  requireIdentifier,
  requireTimestamp,
  type ContractValidationResult,
} from "../contracts";
import type { CapabilityAdmissionRequest } from "./types";
import { capabilityAdmissionRequestDigest } from "./identity";

export function validateCapabilityAdmissionRequest(
  request: CapabilityAdmissionRequest
): ContractValidationResult {
  const errors: string[] = [];
  requireIdentifier(errors, "capability_request.request_id", request.request_id);
  requireIdentifier(errors, "capability_request.subject_id", request.subject_id);
  requireIdentifier(
    errors,
    "capability_request.organization_id",
    request.organization_id
  );
  requireIdentifier(
    errors,
    "capability_request.capability_id",
    request.capability_id
  );
  requireIdentifier(errors, "capability_request.engine_id", request.engine_id);
  requireIdentifier(
    errors,
    "capability_request.requested_action",
    request.requested_action
  );
  requireIdentifier(
    errors,
    "capability_request.entitlement_reference",
    request.entitlement_reference
  );
  requireIdentifier(
    errors,
    "capability_request.policy_reference",
    request.policy_reference
  );
  requireIdentifier(
    errors,
    "capability_request.authority_reference",
    request.authority_reference
  );
  requireTimestamp(
    errors,
    "capability_request.requested_at",
    request.requested_at
  );
  requireDigest(
    errors,
    "capability_request.content_digest",
    request.content_digest
  );
  if (request.content_digest !== capabilityAdmissionRequestDigest(request)) {
    errors.push("capability admission request digest does not match content.");
  }
  return contractResult(errors);
}
