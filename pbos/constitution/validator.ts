import type {
  CertificationRuleId,
  CertificationRuleResult,
  ConstitutionalVolume,
} from "./types";
import type { InterfaceCertificationRun } from "../interface-certification";

const names: Record<CertificationRuleId, string> = {
  "INT-001": "Authority Integrity",
  "INT-002": "Architecture Completeness",
  "INT-003": "Internal Consistency",
  "INT-004": "Ecosystem Compatibility",
  "INT-005": "Multi Operating System Compatibility",
  "INT-006": "Accessibility Standard",
  "INT-007": "Experience State Coverage",
  "INT-008": "Enterprise Quality Standard",
  "INT-009": "PBOS Governance Integration",
  "INT-010": "Canonical Promotion Readiness",
};

function result(
  id: CertificationRuleId,
  evidence: string[],
  blockingConditions: string[]
): CertificationRuleResult {
  return {
    id,
    name: names[id],
    passed: blockingConditions.length === 0,
    evidence,
    blockingConditions,
  };
}

function corpus(volume: ConstitutionalVolume): string {
  return volume.documents.map(({ content }) => content).join("\n");
}

function hasExplicitHeading(content: string, pattern: RegExp): boolean {
  return content
    .split(/\r?\n/)
    .some((line) => /^#{1,6}\s/.test(line) && pattern.test(line));
}

export function validateConstitutionalVolume(
  volume: ConstitutionalVolume,
  documentIndex: Map<string, string[]>,
  rootDir = process.cwd(),
  interfaceCertification: InterfaceCertificationRun | null = null
): CertificationRuleResult[] {
  const rules: CertificationRuleResult[] = [];
  const authorityBlockers = [...volume.discoveryErrors];
  if (!volume.authority) {
    authorityBlockers.push(
      `Required authority ${volume.authorityId} is missing.`
    );
  }
  if (!volume.readme) {
    authorityBlockers.push("Volume README.md is missing.");
  }
  if (
    volume.readme?.metadata.id &&
    volume.readme.metadata.id !== volume.id
  ) {
    authorityBlockers.push(
      `README identity ${volume.readme.metadata.id} does not match ${volume.id}.`
    );
  }
  if (
    volume.number > 0 &&
    (volume.authority?.metadata.parent.length ?? 0) === 0
  ) {
    authorityBlockers.push("Authority parent is not explicitly declared.");
  }
  rules.push(
    result(
      "INT-001",
      [
        `Expected authority: ${volume.authorityId}`,
        `Discovered path: ${volume.directory}`,
      ],
      authorityBlockers
    )
  );

  const expectedIds = new Set([
    volume.authorityId,
    ...(volume.authority?.metadata.related.filter((id) =>
      /^PPS-\d+$/.test(id)
    ) ?? []),
  ]);
  const localIds = new Set(
    volume.documents
      .map(({ metadata }) => metadata.id)
      .filter((id): id is string => Boolean(id))
  );
  const completenessBlockers: string[] = [];
  if ((volume.authority?.metadata.related.length ?? 0) === 0) {
    completenessBlockers.push(
      "Authority does not explicitly declare its required document set."
    );
  }
  for (const expectedId of expectedIds) {
    if (!localIds.has(expectedId)) {
      completenessBlockers.push(
        `Declared volume document ${expectedId} is missing.`
      );
    }
  }
  for (const document of volume.documents) {
    if (!document.metadata.id) {
      completenessBlockers.push(
        `Document ${document.path} has no constitutional identity.`
      );
    }
    if (document.content.trim().length < 200) {
      completenessBlockers.push(
        `Document ${document.path} lacks substantive content.`
      );
    }
  }
  rules.push(
    result(
      "INT-002",
      [
        `${volume.documents.length} documents discovered.`,
        `${expectedIds.size} documents declared by authority.`,
      ],
      completenessBlockers
    )
  );

  const consistencyBlockers: string[] = [];
  for (const [id, paths] of documentIndex) {
    if (paths.length > 1 && localIds.has(id)) {
      consistencyBlockers.push(
        `Identity ${id} is duplicated at ${paths.join(", ")}.`
      );
    }
  }
  for (const document of volume.documents) {
    if (
      document !== volume.authority &&
      document !== volume.readme &&
      !document.metadata.parent.includes(volume.authorityId)
    ) {
      consistencyBlockers.push(
        `${document.metadata.id ?? document.path} does not declare parent ${volume.authorityId}.`
      );
    }
  }
  rules.push(
    result(
      "INT-003",
      ["Document identities and parent relationships compared."],
      consistencyBlockers
    )
  );

  const dependencyBlockers: string[] = [];
  const dependencies = new Set(
    volume.documents.flatMap(({ metadata }) => metadata.dependsOn)
  );
  for (const dependency of dependencies) {
    const matches = documentIndex.get(dependency) ?? [];
    if (matches.length !== 1) {
      dependencyBlockers.push(
        matches.length === 0
          ? `Dependency ${dependency} does not resolve.`
          : `Dependency ${dependency} resolves to multiple documents.`
      );
    }
  }
  rules.push(
    result(
      "INT-004",
      [`${dependencies.size} declared dependencies evaluated.`],
      dependencyBlockers
    )
  );

  const fullCorpus = corpus(volume);
  rules.push(
    result(
      "INT-005",
      ["Explicit multi-operating-system contract searched."],
      hasExplicitHeading(
        fullCorpus,
        /Multi[- ]Operating System Compatibility/i
      )
        ? []
        : [
            "No explicit Multi Operating System Compatibility section exists.",
          ]
    )
  );

  const accessibilityDocuments = volume.documents.filter(
    ({ metadata, path }) =>
      /accessibility/i.test(metadata.title ?? "") ||
      /accessibility/i.test(path)
  );
  const accessibilityBlockers: string[] = [];
  if (accessibilityDocuments.length === 0) {
    accessibilityBlockers.push(
      "No explicit accessibility standard document exists."
    );
  } else {
    const accessibilityCorpus = accessibilityDocuments
      .map(({ content }) => content)
      .join("\n");
    for (const requirement of [
      /keyboard/i,
      /screen reader|assistive technolog/i,
      /contrast/i,
      /testing/i,
    ]) {
      if (!requirement.test(accessibilityCorpus)) {
        accessibilityBlockers.push(
          `Accessibility evidence is missing ${requirement.source}.`
        );
      }
    }
  }
  rules.push(
    result(
      "INT-006",
      accessibilityDocuments.map(({ path }) => path),
      accessibilityBlockers
    )
  );

  const stateDocuments = volume.documents.filter(
    ({ metadata, path }) =>
      /\bstate\b/i.test(metadata.title ?? "") ||
      /state/i.test(path)
  );
  const stateBlockers: string[] = [];
  if (stateDocuments.length === 0) {
    stateBlockers.push("No explicit experience state document exists.");
  } else {
    const stateCorpus = stateDocuments
      .map(({ content }) => content)
      .join("\n");
    for (const state of [
      "loading",
      "empty",
      "success",
      "error",
      "recovery",
      "permission",
      "offline",
    ]) {
      if (!new RegExp(`\\b${state}\\b`, "i").test(stateCorpus)) {
        stateBlockers.push(`Experience state ${state} is not defined.`);
      }
    }
  }
  rules.push(
    result(
      "INT-007",
      stateDocuments.map(({ path }) => path),
      stateBlockers
    )
  );

  const enterpriseBlockers: string[] = [];
  for (const standard of [
    "Security",
    "Performance",
    "Analytics",
    "Observability",
  ]) {
    if (!hasExplicitHeading(fullCorpus, new RegExp(standard, "i"))) {
      enterpriseBlockers.push(
        `No explicit ${standard} standard section exists.`
      );
    }
  }
  rules.push(
    result(
      "INT-008",
      ["Enterprise quality headings evaluated across the volume."],
      enterpriseBlockers
    )
  );

  const certificationDocuments = volume.documents.filter(
    ({ metadata, path }) =>
      /certification/i.test(metadata.title ?? "") ||
      /certification/i.test(path)
  );
  const governanceBlockers: string[] = [];
  if (certificationDocuments.length === 0) {
    governanceBlockers.push(
      "No explicit PBOS certification framework exists."
    );
  } else {
    const governanceCorpus = certificationDocuments
      .map(({ content }) => content)
      .join("\n");
    for (const requirement of [
      /PBOS/,
      /evidence/i,
      /validat/i,
      /fail.closed/i,
    ]) {
      if (!requirement.test(governanceCorpus)) {
        governanceBlockers.push(
          `PBOS governance evidence is missing ${requirement.source}.`
        );
      }
    }
  }
  rules.push(
    result(
      "INT-009",
      certificationDocuments.map(({ path }) => path),
      governanceBlockers
    )
  );

  const priorPassed = rules.every(({ passed }) => passed);
  const promotionBlockers: string[] = [];
  if (!priorPassed) {
    promotionBlockers.push(
      "One or more prerequisite certification rules failed."
    );
  }
  if (
    volume.lifecycle !== "certified" &&
    volume.lifecycle !== "canonical"
  ) {
    promotionBlockers.push(
      `Lifecycle ${volume.lifecycle} is not eligible for canonical promotion.`
    );
  }
  if (
    volume.lifecycle === "implementation_ready" ||
    volume.lifecycle === "certified" ||
    volume.lifecycle === "canonical"
  ) {
    if (!interfaceCertification) {
      promotionBlockers.push(
        "Interface certification evidence is missing."
      );
    } else {
      if (
        interfaceCertification.volume !== volume.id ||
        interfaceCertification.volumeDigest !== volume.contentDigest
      ) {
        promotionBlockers.push(
          "Interface certification identity does not match the current volume."
        );
      }
      if (
        interfaceCertification.validationComplete !== true ||
        interfaceCertification.status !== "passed" ||
        interfaceCertification.score !== 100
      ) {
        promotionBlockers.push(
          ...interfaceCertification.blockingConditions,
          "All interface certification domains must PASS."
        );
      }
      if (!interfaceCertification.validator?.id) {
        promotionBlockers.push(
          "Interface certification validator identity is missing."
        );
      }
      if (
        Number.isNaN(
          Date.parse(interfaceCertification.certificationTimestamp)
        )
      ) {
        promotionBlockers.push(
          "Interface certification timestamp is invalid."
        );
      }
    }
  }
  rules.push(
    result(
      "INT-010",
      [
        `Current lifecycle: ${volume.lifecycle}`,
        "Canonical promotion requires explicit certified status.",
        ...(interfaceCertification
          ? ["pbos/runtime/interface-certification.json"]
          : []),
      ],
      promotionBlockers
    )
  );

  return rules;
}
