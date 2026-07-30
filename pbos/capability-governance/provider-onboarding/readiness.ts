import { providerReadinessAssessmentDigest } from "./identity";
import type { ProductionProviderRegistry } from "./registry";
import type {
  ProviderCertificationReadinessAssessment,
  ProviderEvidenceCategory,
} from "./types";

const REQUIRED_CATEGORIES: readonly ProviderEvidenceCategory[] = [
  "IDENTITY_ASSURANCE",
  "OWNERSHIP_PROOF",
  "KEY_MANAGEMENT",
  "MONITORING",
  "INCIDENT_RESPONSE",
  "RECOVERY_PROCEDURES",
];

export class ProviderCertificationReadinessAuthority {
  assess(
    registry: ProductionProviderRegistry,
    providerId: string,
    timestamp: string
  ): ProviderCertificationReadinessAssessment {
    const provider = registry.provider(providerId);
    if (!provider) {
      throw new Error("provider readiness references an unknown provider.");
    }
    const evidence = registry.evidenceFor(providerId);
    const validations = registry.validationsFor(providerId);
    const verifiedEvidenceIds = new Set(
      validations
        .filter(({ validation_result: result }) => result === "VERIFIED")
        .map(({ evidence_reference: id }) => id)
    );
    const verifiedCategories = new Set(
      evidence
        .filter(({ evidence_id: id }) => verifiedEvidenceIds.has(id))
        .map(({ category }) => category)
    );
    const missing = REQUIRED_CATEGORIES.filter(
      (category) => !verifiedCategories.has(category)
    );
    const score = Math.round(
      ((REQUIRED_CATEGORIES.length - missing.length) /
        REQUIRED_CATEGORIES.length) *
        100
    );
    const body: ProviderCertificationReadinessAssessment = {
      assessment_id: `PROVIDER-READINESS-${providerId}`,
      provider: providerId,
      domain: provider.provider_type,
      requirement: "Production provider identity, ownership, security, operations, recovery, and independent validation.",
      evidence: evidence.map(({ digest }) => digest).sort(),
      validation: validations.map(({ digest }) => digest).sort(),
      risk: missing.length === 0 ? "LOW" : score === 0 ? "CRITICAL" : "HIGH",
      readiness_score: score,
      decision:
        missing.length === 0
          ? "READY_FOR_CERTIFICATION"
          : score === 0
            ? "BLOCKED"
            : "CONDITIONAL",
      timestamp,
      digest: "",
    };
    return { ...body, digest: providerReadinessAssessmentDigest(body) };
  }
}
