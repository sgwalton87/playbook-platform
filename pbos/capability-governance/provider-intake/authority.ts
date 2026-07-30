import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import {
  productionProviderIntakeDigest,
  providerEvidenceRequirementPackageDigest,
  providerEvidenceSubmissionDigest,
} from "./identity";
import type {
  ProductionProviderIntakeRecord,
  ProviderEvidenceRequirementPackage,
  ProviderEvidenceSubmission,
} from "./types";

function reject(errors: readonly string[], subject: string): void {
  if (errors.length > 0) {
    throw new Error(`${subject} rejected: ${errors.join(" ")}`);
  }
}

export class ProductionProviderIntakeAuthority {
  readonly #providers = new Map<string, ProductionProviderIntakeRecord>();
  readonly #requirements = new Map<string, ProviderEvidenceRequirementPackage>();
  readonly #submissions = new Map<string, ProviderEvidenceSubmission>();

  constructor(
    private readonly registrationAuthorities: ReadonlySet<string>,
    private readonly requestAuthorities: ReadonlySet<string>
  ) {}

  register(value: ProductionProviderIntakeRecord, authority: string): void {
    const errors: string[] = [];
    if (!this.registrationAuthorities.has(authority)) {
      errors.push("registration authority is not recognized.");
    }
    requireIdentifier(errors, "intake.intake_id", value.intake_id);
    requireIdentifier(errors, "intake.provider_id", value.provider_id);
    requireIdentifier(errors, "intake.provider_name", value.provider_name);
    requireIdentifier(
      errors,
      "intake.organization_identity",
      value.organization_identity
    );
    requireIdentifier(
      errors,
      "intake.ownership_identity",
      value.ownership_identity
    );
    requireIdentifiers(errors, "intake.service_scope", value.service_scope);
    requireIdentifiers(
      errors,
      "intake.requested_capabilities",
      value.requested_capabilities
    );
    requireIdentifier(errors, "intake.technical_owner", value.technical_owner);
    requireIdentifier(errors, "intake.security_owner", value.security_owner);
    requireIdentifier(
      errors,
      "intake.operational_owner",
      value.operational_owner
    );
    requireIdentifiers(
      errors,
      "intake.authorized_submitters",
      value.authorized_submitters
    );
    requireTimestamp(errors, "intake.created_at", value.created_at);
    requireDigest(errors, "intake.digest", value.digest);
    if (value.status !== "REGISTERED") {
      errors.push("provider intake must begin REGISTERED.");
    }
    if (value.digest !== productionProviderIntakeDigest(value)) {
      errors.push("provider intake digest is invalid.");
    }
    if (this.#providers.has(value.provider_id)) {
      errors.push("provider intake identity already exists.");
    }
    reject(errors, "Provider intake");
    this.#providers.set(value.provider_id, structuredClone(value));
  }

  request(value: ProviderEvidenceRequirementPackage): void {
    const errors: string[] = [];
    const provider = this.#providers.get(value.provider_id);
    if (!provider) {
      errors.push("evidence request references an unknown provider.");
    }
    if (!this.requestAuthorities.has(value.requested_by)) {
      errors.push("evidence request authority is not recognized.");
    }
    requireIdentifier(errors, "requirements.package_id", value.package_id);
    requireIdentifiers(errors, "requirements.categories", value.categories);
    requireTimestamp(errors, "requirements.requested_at", value.requested_at);
    requireTimestamp(errors, "requirements.expires_at", value.expires_at);
    requireDigest(errors, "requirements.digest", value.digest);
    if (value.digest !== providerEvidenceRequirementPackageDigest(value)) {
      errors.push("evidence requirement package digest is invalid.");
    }
    if (
      Date.parse(value.expires_at) <= Date.parse(value.requested_at) ||
      value.categories.some((category) => !value.verification_paths[category])
    ) {
      errors.push("evidence requirement package has no valid verification path.");
    }
    if (this.#requirements.has(value.package_id)) {
      errors.push("evidence requirement package already exists.");
    }
    reject(errors, "Provider evidence request");
    this.#requirements.set(value.package_id, structuredClone(value));
  }

  submit(value: ProviderEvidenceSubmission, observedAt: string): void {
    const errors: string[] = [];
    const provider = this.#providers.get(value.provider_id);
    const requirement = this.#requirements.get(value.requirement_package_id);
    if (!provider || !requirement || requirement.provider_id !== value.provider_id) {
      errors.push("evidence submission references unknown intake authority.");
    }
    if (!provider?.authorized_submitters.includes(value.submitted_by)) {
      errors.push("evidence submitter is not authorized.");
    }
    requireIdentifier(errors, "submission.submission_id", value.submission_id);
    requireIdentifier(
      errors,
      "submission.source_reference",
      value.source_reference
    );
    requireDigest(errors, "submission.content_digest", value.content_digest);
    requireTimestamp(errors, "submission.submitted_at", value.submitted_at);
    requireTimestamp(errors, "submission.expiration", value.expiration);
    requireDigest(errors, "submission.digest", value.digest);
    if (value.digest !== providerEvidenceSubmissionDigest(value)) {
      errors.push("evidence submission digest is invalid.");
    }
    if (
      value.verification_state !== "SUBMITTED" ||
      Date.parse(value.expiration) <= Date.parse(observedAt)
    ) {
      errors.push("evidence submission is expired or has invalid state.");
    }
    if (!requirement?.categories.includes(value.category)) {
      errors.push("evidence category was not requested.");
    }
    if (this.#submissions.has(value.submission_id)) {
      errors.push("evidence submission is duplicated.");
    }
    reject(errors, "Provider evidence submission");
    this.#submissions.set(value.submission_id, structuredClone(value));
  }

  submissions(providerId: string): readonly ProviderEvidenceSubmission[] {
    return [...this.#submissions.values()]
      .filter(({ provider_id: id }) => id === providerId)
      .map((value) => structuredClone(value));
  }
}
