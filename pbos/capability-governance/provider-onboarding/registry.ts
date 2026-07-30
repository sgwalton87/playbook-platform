import {
  validateProviderEvidencePackage,
  validateProviderEvidenceValidation,
  validateProviderRegistration,
  validateProviderTransition,
} from "./validator";
import { productionProviderRegistrationDigest } from "./identity";
import { providerReadinessAssessmentDigest } from "./identity";
import {
  productionProviderDecisionDigest,
  type ProductionProviderCertificationDecision,
} from "../production-certification";
import type {
  ProductionProviderEvidencePackage,
  ProductionProviderRegistration,
  ProviderEvidenceValidation,
  ProviderCertificationReadinessAssessment,
  ProviderLifecycleTransition,
} from "./types";

function requireValid(errors: readonly string[], subject: string): void {
  if (errors.length > 0) {
    throw new Error(`${subject} rejected: ${errors.join(" ")}`);
  }
}

export class ProductionProviderRegistry {
  readonly #providers = new Map<string, ProductionProviderRegistration>();
  readonly #transitions: ProviderLifecycleTransition[] = [];
  readonly #evidence = new Map<string, ProductionProviderEvidencePackage>();
  readonly #validations = new Map<string, ProviderEvidenceValidation>();

  constructor(
    private readonly registrationAuthorities: ReadonlySet<string>,
    private readonly reviewAuthorities: ReadonlySet<string>,
    private readonly validatorAuthorities: ReadonlySet<string>
  ) {}

  register(
    provider: ProductionProviderRegistration,
    authority: string
  ): void {
    if (!this.registrationAuthorities.has(authority)) {
      throw new Error("provider registration authority is not recognized.");
    }
    requireValid(validateProviderRegistration(provider), "provider registration");
    if (this.#providers.has(provider.provider_id)) {
      throw new Error("provider identity is already registered.");
    }
    this.#providers.set(provider.provider_id, structuredClone(provider));
  }

  transition(value: ProviderLifecycleTransition): void {
    if (!this.reviewAuthorities.has(value.authorized_reviewer)) {
      throw new Error("provider lifecycle reviewer is not recognized.");
    }
    requireValid(validateProviderTransition(value), "provider transition");
    if (value.to === "CERTIFIED") {
      throw new Error(
        "provider certification transition requires certify()."
      );
    }
    this.applyTransition(value);
  }

  certify(
    value: ProviderLifecycleTransition,
    readiness: ProviderCertificationReadinessAssessment,
    certification: ProductionProviderCertificationDecision
  ): void {
    if (
      value.to !== "CERTIFIED" ||
      value.authorized_reviewer !==
        "PBOS-PROVIDER-CERTIFICATION-AUTHORITY" ||
      readiness.provider !== value.provider_id ||
      readiness.decision !== "READY_FOR_CERTIFICATION" ||
      readiness.digest !== providerReadinessAssessmentDigest(readiness) ||
      certification.status !== "CERTIFIED" ||
      certification.digest !== productionProviderDecisionDigest(certification) ||
      !value.evidence.includes(readiness.digest) ||
      !value.evidence.includes(certification.digest)
    ) {
      throw new Error("provider certification evidence is invalid.");
    }
    requireValid(validateProviderTransition(value), "provider transition");
    this.applyTransition(value);
  }

  private applyTransition(value: ProviderLifecycleTransition): void {
    const provider = this.#providers.get(value.provider_id);
    if (!provider || provider.registration_status !== value.from) {
      throw new Error("provider lifecycle state does not match transition.");
    }
    const updated: ProductionProviderRegistration = {
      ...provider,
      registration_status: value.to,
      updated_at: value.timestamp,
      digest: "",
    };
    this.#providers.set(value.provider_id, {
      ...updated,
      digest: productionProviderRegistrationDigest(updated),
    });
    this.#transitions.push(structuredClone(value));
  }

  submit(
    value: ProductionProviderEvidencePackage,
    observedAt: string
  ): void {
    const provider = this.#providers.get(value.provider_id);
    if (!provider || provider.registration_status === "REVOKED") {
      throw new Error("provider evidence references an unknown provider.");
    }
    requireValid(
      validateProviderEvidencePackage(value, observedAt),
      "provider evidence"
    );
    if (this.#evidence.has(value.evidence_id)) {
      throw new Error("provider evidence identity already exists.");
    }
    this.#evidence.set(value.evidence_id, structuredClone(value));
  }

  validate(value: ProviderEvidenceValidation): void {
    const evidence = this.#evidence.get(value.evidence_reference);
    if (!evidence) {
      throw new Error("provider validation references unknown evidence.");
    }
    requireValid(
      validateProviderEvidenceValidation(
        value,
        evidence,
        this.validatorAuthorities
      ),
      "provider evidence validation"
    );
    if (this.#validations.has(value.validation_id)) {
      throw new Error("provider validation identity already exists.");
    }
    this.#validations.set(value.validation_id, structuredClone(value));
  }

  provider(id: string): ProductionProviderRegistration | null {
    const value = this.#providers.get(id);
    return value ? structuredClone(value) : null;
  }

  evidenceFor(providerId: string): readonly ProductionProviderEvidencePackage[] {
    return [...this.#evidence.values()]
      .filter(({ provider_id: id }) => id === providerId)
      .map((value) => structuredClone(value));
  }

  validationsFor(providerId: string): readonly ProviderEvidenceValidation[] {
    const evidenceIds = new Set(
      this.evidenceFor(providerId).map(({ evidence_id: id }) => id)
    );
    return [...this.#validations.values()]
      .filter(({ evidence_reference: id }) => evidenceIds.has(id))
      .map((value) => structuredClone(value));
  }

  transitionsFor(providerId: string): readonly ProviderLifecycleTransition[] {
    return this.#transitions
      .filter(({ provider_id: id }) => id === providerId)
      .map((value) => structuredClone(value));
  }
}
