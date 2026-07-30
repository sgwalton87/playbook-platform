import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import {
  productionEvidenceCertificationDigest,
  productionIdentityCertificationDigest,
  productionOperationsCertificationDigest,
  productionProviderDecisionDigest,
  productionProviderPackageDigest,
  productionRecoveryCertificationDigest,
  productionSecurityCertificationDigest,
  productionStorageCertificationDigest,
} from "./identity";
import type {
  ProductionProviderCertificationDecision,
  ProductionProviderCertificationPackage,
} from "./types";

function common(
  errors: string[],
  record: {
    readonly record_id: string;
    readonly provider: string;
    readonly evidence: readonly string[];
    readonly timestamp: string;
    readonly status: string;
    readonly digest: string;
  }
): void {
  requireIdentifier(errors, "provider.record_id", record.record_id);
  requireIdentifier(errors, "provider.provider", record.provider);
  requireIdentifiers(errors, "provider.evidence", record.evidence);
  requireTimestamp(errors, "provider.timestamp", record.timestamp);
  requireDigest(errors, "provider.digest", record.digest);
  if (record.evidence.length === 0) {
    errors.push(`provider evidence is missing: ${record.record_id}.`);
  }
  if (record.status !== "CERTIFIED") {
    errors.push(`provider is not certified: ${record.record_id}.`);
  }
}

export class ProductionProviderCertificationAuthority {
  certify(
    value: ProductionProviderCertificationPackage
  ): ProductionProviderCertificationDecision {
    const errors: string[] = [];
    requireIdentifier(errors, "package.package_id", value.package_id);
    requireTimestamp(errors, "package.timestamp", value.timestamp);
    requireDigest(errors, "package.digest", value.digest);
    if (value.digest !== productionProviderPackageDigest(value)) {
      errors.push("production provider package digest is invalid.");
    }
    common(errors, value.identity);
    if (
      value.identity.digest !==
        productionIdentityCertificationDigest(value.identity) ||
      !value.identity.identity_resolution ||
      !value.identity.credential_verification ||
      !value.identity.issuer_authentication ||
      !value.identity.organization_verification ||
      !value.identity.tenant_ownership ||
      !value.identity.authority_scope_validation ||
      !value.identity.revocation_handling ||
      value.identity.credential_status !== "CURRENT" ||
      Date.parse(value.identity.valid_until) <= Date.parse(value.timestamp)
    ) {
      errors.push("production identity provider validation failed.");
    }
    common(errors, value.storage);
    if (
      value.storage.digest !==
        productionStorageCertificationDigest(value.storage) ||
      !value.storage.transaction_support ||
      !value.storage.revision_control ||
      !value.storage.concurrency_handling ||
      (value.storage.consistency_model !== "LINEARIZABLE" &&
        value.storage.consistency_model !== "SERIALIZABLE") ||
      !value.storage.failure_handling ||
      !value.storage.recovery_model ||
      !value.storage.backup_strategy
    ) {
      errors.push("production storage provider validation failed.");
    }
    common(errors, value.evidence);
    if (
      value.evidence.digest !==
        productionEvidenceCertificationDigest(value.evidence) ||
      !value.evidence.immutable_storage ||
      !value.evidence.audit_ordering ||
      !value.evidence.retrieval_verified ||
      !value.evidence.tamper_detection ||
      value.evidence.verification_result !== "PASS" ||
      value.evidence.expected_digest !== value.evidence.observed_digest
    ) {
      errors.push("production evidence provider validation failed.");
    }
    common(errors, value.recovery);
    if (
      value.recovery.digest !==
        productionRecoveryCertificationDigest(value.recovery) ||
      value.recovery.validation_result !== "PASS" ||
      !value.recovery.state_verification ||
      !value.recovery.evidence_preservation ||
      !value.recovery.rollback_prevention
    ) {
      errors.push("production recovery provider validation failed.");
    }
    common(errors, value.operations);
    if (
      value.operations.digest !==
        productionOperationsCertificationDigest(value.operations) ||
      value.operations.metric_names.length === 0 ||
      value.operations.alert_definitions.length === 0 ||
      !value.operations.security_event_logging ||
      !value.operations.owner ||
      !value.operations.response_process
    ) {
      errors.push("production operations provider validation failed.");
    }
    common(errors, value.security);
    if (
      value.security.digest !==
        productionSecurityCertificationDigest(value.security) ||
      !value.security.key_management ||
      !value.security.credential_rotation ||
      !value.security.access_review ||
      !value.security.revocation_propagation ||
      !value.security.incident_response ||
      !value.security.security_logging ||
      !value.security.owner
    ) {
      errors.push("production security provider validation failed.");
    }
    const recordDigests = [
      value.identity.digest,
      value.storage.digest,
      value.evidence.digest,
      value.recovery.digest,
      value.operations.digest,
      value.security.digest,
    ].sort();
    const body: ProductionProviderCertificationDecision = {
      certification_id: `PROVIDER-CERTIFICATION-${value.package_id}`,
      package_id: value.package_id,
      status: errors.length === 0 ? "CERTIFIED" : "BLOCKED",
      provider_record_digests: recordDigests,
      findings: errors,
      authority: "PBOS-PRODUCTION-PROVIDER-CERTIFICATION",
      timestamp: value.timestamp,
      digest: "",
    };
    return { ...body, digest: productionProviderDecisionDigest(body) };
  }
}
