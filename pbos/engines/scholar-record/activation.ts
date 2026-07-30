import {
  requireDigest,
  requireIdentifier,
  requireTimestamp,
} from "../../kernel/contracts";
import { engineActivationDecisionDigest } from "../../kernel/engine-activation";
import { scholarRecordActivationContractDigest } from "./identity";
import type { ScholarRecordActivationContract } from "./types";

export function validateScholarRecordActivationContract(
  value: ScholarRecordActivationContract
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "contract.contract_id", value.contract_id);
  requireIdentifier(
    errors,
    "contract.scholar_identity",
    value.scholar_identity
  );
  requireIdentifier(
    errors,
    "contract.capability_reference",
    value.capability_reference
  );
  requireIdentifier(
    errors,
    "contract.provider_reference",
    value.provider_reference
  );
  requireIdentifier(
    errors,
    "contract.kernel_activation_reference",
    value.kernel_activation_reference
  );
  requireIdentifier(
    errors,
    "contract.evidence_reference",
    value.evidence_reference
  );
  requireTimestamp(errors, "contract.timestamp", value.timestamp);
  requireDigest(errors, "contract.digest", value.digest);
  if (value.digest !== scholarRecordActivationContractDigest(value)) {
    errors.push("Scholar Record activation contract digest is invalid.");
  }
  if (
    value.activation.digest !==
      engineActivationDecisionDigest(value.activation) ||
    value.activation.engine_id !== value.engine_id ||
    value.activation.capability_id !== value.capability_reference ||
    value.activation.decision !== value.lifecycle_state ||
    value.activation.decision_id !== value.kernel_activation_reference ||
    value.activation.authority !== "PBOS-KERNEL-ENGINE-ACTIVATION"
  ) {
    errors.push("Scholar Record activation authority binding is invalid.");
  }
  if (
    value.lifecycle_state === "ACTIVATED" &&
    !value.activation.evidence.includes(value.evidence_reference)
  ) {
    errors.push("Scholar Record activation evidence binding is invalid.");
  }
  return errors;
}
