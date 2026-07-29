import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { discoverConstitutionalVolume } from "../constitution/discovery";
import type { ConstitutionalVolume } from "../constitution/types";
import { Artifacts, Runtime } from "../kernel";
import { decodeInterfaceCertificationArtifact } from "../runtime/artifact-decoders";
import { loadInterfaceEvidence } from "./evidence-loader";
import { validateInterfaceCertificationHistory } from "./history";
import {
  measureInterfaceImplementation,
  type InterfaceMeasurementRun,
} from "./measurement";
import { renderInterfaceCertificationReport } from "./reports";
import { accessibilityRule } from "./rules/accessibility";
import { componentArchitectureRule } from "./rules/components";
import { designSystemRule } from "./rules/design-system";
import { interactionPatternRule } from "./rules/interaction-patterns";
import { interfaceStateRule } from "./rules/interface-states";
import { performanceRule } from "./rules/performance";
import { responsiveRule } from "./rules/responsive";
import { designTokenRule } from "./rules/tokens";
import { scoreInterfaceCertification } from "./scoring";
import type {
  InterfaceCertificationArtifact,
  InterfaceCertificationDomainId,
  InterfaceCertificationRun,
  InterfaceDomainResult,
} from "./types";
import {
  type InterfaceDomainRule,
  validateInterfaceDomain,
} from "./validator";

const rules: InterfaceDomainRule[] = [
  designSystemRule,
  componentArchitectureRule,
  designTokenRule,
  accessibilityRule,
  responsiveRule,
  interactionPatternRule,
  interfaceStateRule,
  performanceRule,
];

function evaluateFreshness(
  timestamp: string | undefined,
  evaluatedAt: string
): string[] {
  if (!timestamp) {
    return ["Interface certification timestamp is missing."];
  }
  const certified = Date.parse(timestamp);
  const evaluated = Date.parse(evaluatedAt);
  if (Number.isNaN(certified) || certified > evaluated) {
    return ["Interface certification timestamp is invalid."];
  }
  if ((evaluated - certified) / 86_400_000 > 30) {
    return ["Interface certification evidence is stale."];
  }
  return [];
}

export function evaluateInterfaceCertification(
  volume: ConstitutionalVolume,
  rootDir = process.cwd(),
  evaluatedAt = new Date().toISOString(),
  measurement: InterfaceMeasurementRun | null = null
): InterfaceCertificationRun {
  const loaded = loadInterfaceEvidence(volume, rootDir);
  const evidencePackage = loaded.evidencePackage;
  const domainEntries = rules.map((rule) => [
    rule.id,
    validateInterfaceDomain(
      rule,
      evidencePackage,
      rootDir,
      evaluatedAt
    ),
  ] as const);
  const domains = Object.fromEntries(domainEntries) as Record<
    InterfaceCertificationDomainId,
    InterfaceDomainResult
  >;
  const domainBlockers = Object.values(domains).flatMap(
    ({ blockingConditions }) => blockingConditions
  );
  const blockers = [
    ...loaded.blockingConditions,
    ...evaluateFreshness(
      evidencePackage?.certificationTimestamp,
      evaluatedAt
    ),
    ...domainBlockers,
  ];
  if (!measurement) {
    blockers.push("Interface implementation measurement is missing.");
  } else {
    if (measurement.volume !== volume.id) {
      blockers.push("Interface measurement volume identity does not match.");
    }
    if (measurement.volumeDigest !== volume.contentDigest) {
      blockers.push("Interface measurement Volume 34 digest does not match.");
    }
    if (
      measurement.implementationDigest !== loaded.implementationDigest
    ) {
      blockers.push(
        "Interface measurement implementation digest does not match."
      );
    }
    if (!measurement.measurementComplete) {
      blockers.push("Interface implementation measurement is incomplete.");
    }
  }
  const allDomainsPass = Object.values(domains).every(
    ({ passed }) => passed
  );
  if (evidencePackage?.validationComplete === true && !allDomainsPass) {
    blockers.push(
      "False completion claim: validationComplete is true while required interface domains are not PASS."
    );
  }
  if (evidencePackage?.validationComplete !== true) {
    blockers.push("Interface validation is not complete.");
  }
  const blockingConditions = [...new Set(blockers)];
  const validationComplete =
    evidencePackage?.validationComplete === true &&
    allDomainsPass &&
    blockingConditions.length === 0;
  const score = scoreInterfaceCertification(domains);
  return {
    runId: `${volume.id}:${loaded.implementationDigest}:${volume.contentDigest}:${evaluatedAt}`,
    volume: volume.id,
    volumeDigest: volume.contentDigest,
    implementation: evidencePackage?.implementation ?? "",
    digest: loaded.implementationDigest,
    validationComplete,
    domains,
    score,
    status: validationComplete
      ? "passed"
      : evidencePackage?.validationComplete === true
        ? "failed"
        : "pending",
    certificationTimestamp: evaluatedAt,
    validator: evidencePackage?.validator ?? null,
    measurement: measurement
      ? {
          runId: measurement.runId,
          implementationDigest:
            measurement.implementationDigest,
          measurementComplete: measurement.measurementComplete,
          certificationEligible: false,
        }
      : null,
    blockingConditions,
  };
}

export function certifyInterfaceImplementation(
  requestedVolume: number,
  rootDir = process.cwd(),
  evaluatedAt = new Date().toISOString()
): InterfaceCertificationRun {
  const volume = discoverConstitutionalVolume(
    requestedVolume,
    rootDir
  );
  const measurement = measureInterfaceImplementation(
    requestedVolume,
    rootDir,
    evaluatedAt
  );
  const run = evaluateInterfaceCertification(
    volume,
    rootDir,
    evaluatedAt,
    measurement
  );
  const artifactPath = path.join(
    rootDir,
    Artifacts.interfaceCertification
  );
  const existing = Runtime.exists(artifactPath)
    ? decodeInterfaceCertificationArtifact(Runtime.load(artifactPath))
    : null;
  if (existing) {
    validateInterfaceCertificationHistory(existing);
  }
  const artifact: InterfaceCertificationArtifact = {
    schemaVersion: 1,
    owner: "interface-certification",
    ...run,
    history: [...(existing?.history ?? []), run],
  };
  Runtime.save(
    artifactPath,
    artifact,
    "interface-certification"
  );
  const reportDirectory = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(
      reportDirectory,
      `volume-${requestedVolume}-interface-certification.md`
    ),
    renderInterfaceCertificationReport(run),
    "utf8"
  );
  return run;
}
