import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import { productionProviderEvaluationDigest } from "./identity";
import {
  PROVIDER_EVALUATION_DOMAINS,
  type ProductionProviderEvaluation,
} from "./types";

export class ProductionProviderEvaluationAuthority {
  evaluate(
    value: ProductionProviderEvaluation
  ): ProductionProviderEvaluation {
    const errors: string[] = [];
    requireIdentifier(errors, "evaluation.evaluation_id", value.evaluation_id);
    requireIdentifier(errors, "evaluation.provider_id", value.provider_id);
    requireIdentifier(
      errors,
      "evaluation.business_identity",
      value.business_identity
    );
    requireIdentifier(errors, "evaluation.ownership", value.ownership);
    requireIdentifier(
      errors,
      "evaluation.service_description",
      value.service_description
    );
    requireIdentifiers(
      errors,
      "evaluation.supported_capabilities",
      value.supported_capabilities
    );
    requireTimestamp(errors, "evaluation.evaluated_at", value.evaluated_at);
    requireDigest(errors, "evaluation.digest", value.digest);
    if (value.digest !== productionProviderEvaluationDigest(value)) {
      errors.push("provider evaluation digest is invalid.");
    }
    const scores = new Map(value.domain_scores.map((item) => [item.domain, item]));
    for (const domain of PROVIDER_EVALUATION_DOMAINS) {
      const item = scores.get(domain);
      if (!item || item.score < 0 || item.score > 100) {
        errors.push(`provider evaluation domain is invalid: ${domain}.`);
      } else if (item.evidence.length === 0) {
        errors.push(`provider evaluation evidence is missing: ${domain}.`);
      }
    }
    if (scores.size !== PROVIDER_EVALUATION_DOMAINS.length) {
      errors.push("provider evaluation domains are incomplete or duplicated.");
    }
    const calculatedScore = Math.round(
      [...scores.values()].reduce((sum, item) => sum + item.score, 0) /
        PROVIDER_EVALUATION_DOMAINS.length
    );
    if (value.evaluation_score !== calculatedScore) {
      errors.push("provider evaluation score is invalid.");
    }
    const expectedStatus =
      errors.length > 0 || value.risk_assessment === "CRITICAL"
        ? "BLOCKED"
        : calculatedScore >= 80 && value.risk_assessment !== "HIGH"
          ? "READY_FOR_INTAKE"
          : "CONDITIONAL";
    if (value.evaluation_status !== expectedStatus) {
      errors.push("provider evaluation status is inconsistent.");
    }
    if (errors.length > 0) {
      throw new Error(`Provider evaluation rejected: ${errors.join(" ")}`);
    }
    return Object.freeze({
      ...value,
      domain_scores: Object.freeze(
        value.domain_scores.map((item) =>
          Object.freeze({
            ...item,
            evidence: Object.freeze([...item.evidence]),
            findings: Object.freeze([...item.findings]),
          })
        )
      ),
      supported_capabilities: Object.freeze([...value.supported_capabilities]),
    });
  }
}
