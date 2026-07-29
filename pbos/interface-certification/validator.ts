import { validateEvidenceReference } from "./evidence-loader";
import type {
  InterfaceCertificationDomainId,
  InterfaceCertificationEvidencePackage,
  InterfaceDomainResult,
} from "./types";

export interface InterfaceDomainRule {
  id: InterfaceCertificationDomainId;
  name: string;
  requiredControls: string[];
}

export function validateInterfaceDomain(
  rule: InterfaceDomainRule,
  evidencePackage: InterfaceCertificationEvidencePackage | null,
  rootDir: string,
  evaluatedAt: string
): InterfaceDomainResult {
  const domainEvidence = evidencePackage?.domains?.[rule.id];
  const blockers: string[] = [];
  if (!domainEvidence) {
    blockers.push(`${rule.id} domain evidence is missing.`);
  } else {
    for (const control of rule.requiredControls) {
      if (domainEvidence.controls?.[control] !== true) {
        blockers.push(`${rule.id} control is not proven: ${control}.`);
      }
    }
    if (!Array.isArray(domainEvidence.evidence)) {
      blockers.push(`${rule.id} evidence references are missing.`);
    } else if (domainEvidence.evidence.length === 0) {
      blockers.push(`${rule.id} has no implementation evidence.`);
    } else {
      for (const reference of domainEvidence.evidence) {
        blockers.push(
          ...validateEvidenceReference(
            reference,
            rootDir,
            evaluatedAt
          )
        );
      }
    }
    if (!Array.isArray(domainEvidence.findings)) {
      blockers.push(`${rule.id} findings are missing.`);
    } else if (domainEvidence.findings.length > 0) {
      blockers.push(
        ...domainEvidence.findings.map(
          (finding) => `${rule.id}: ${finding}`
        )
      );
    }
  }
  return {
    id: rule.id,
    name: rule.name,
    passed: blockers.length === 0,
    score: blockers.length === 0 ? 100 : 0,
    requiredControls: rule.requiredControls,
    evidence: domainEvidence?.evidence ?? [],
    blockingConditions: [...new Set(blockers)],
  };
}
