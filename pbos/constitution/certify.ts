import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Artifacts, Runtime } from "../kernel";
import {
  buildConstitutionalDocumentIndex,
  discoverConstitutionalVolume,
} from "./discovery";
import { certifyInterfaceImplementation } from "../interface-certification";
import { recommendConstitutionalPromotion } from "./lifecycle";
import { renderVolumeCertificationReport } from "./report";
import type {
  VolumeCertificationArtifact,
  VolumeCertificationRun,
} from "./types";
import { validateConstitutionalVolume } from "./validator";

function validateExistingArtifact(
  value: VolumeCertificationArtifact
): void {
  if (
    value.schemaVersion !== 1 ||
    value.owner !== "volume-certification" ||
    !Array.isArray(value.history)
  ) {
    throw new Error(
      "Existing volume certification artifact is invalid; history preservation cannot be proven."
    );
  }
}

export function certifyConstitutionalVolume(
  requestedVolume: number,
  rootDir = process.cwd(),
  evaluatedAt = new Date().toISOString()
): VolumeCertificationRun {
  const volume = discoverConstitutionalVolume(
    requestedVolume,
    rootDir
  );
  const documentIndex = buildConstitutionalDocumentIndex(rootDir);
  const interfaceCertification = certifyInterfaceImplementation(
    requestedVolume,
    rootDir,
    evaluatedAt
  );
  const rules = validateConstitutionalVolume(
    volume,
    documentIndex,
    rootDir,
    interfaceCertification
  );
  const passedRules = rules
    .filter(({ passed }) => passed)
    .map(({ id }) => id);
  const failedRules = rules
    .filter(({ passed }) => !passed)
    .map(({ id }) => id);
  const blockingConditions = rules.flatMap(({ blockingConditions }) =>
    blockingConditions
  );
  const governanceRulesPassed = rules
    .filter(({ id }) => id !== "INT-010")
    .every(({ passed }) => passed) &&
    (volume.lifecycle !== "implementation_ready" ||
      interfaceCertification.validationComplete);
  const promotionRecommendation = recommendConstitutionalPromotion(
    volume.lifecycle,
    governanceRulesPassed
  );
  const run: VolumeCertificationRun = {
    runId: `${volume.id}:${volume.contentDigest}:${evaluatedAt}`,
    volume: volume.number,
    volumeId: volume.id,
    volumePath: volume.directory,
    authorityId: volume.authorityId,
    lifecycle: volume.lifecycle,
    lifecycleSource: volume.lifecycleSource,
    contentDigest: volume.contentDigest,
    evaluatedAt,
    status: failedRules.length === 0 ? "PASS" : "FAIL",
    certificationScore: Math.round(
      (passedRules.length / rules.length) * 100
    ),
    rules,
    passedRules,
    failedRules,
    blockingConditions,
    promotionRecommendation,
  };

  const artifactPath = path.join(
    rootDir,
    Artifacts.volumeCertification
  );
  const history = Runtime.exists(artifactPath)
    ? Runtime.load<VolumeCertificationArtifact>(artifactPath)
    : null;
  if (history) {
    validateExistingArtifact(history);
  }
  const artifact: VolumeCertificationArtifact = {
    schemaVersion: 1,
    owner: "volume-certification",
    latest: run,
    history: [...(history?.history ?? []), run],
  };
  Runtime.save(
    artifactPath,
    artifact,
    "volume-certification"
  );

  const reportDirectory = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(
      reportDirectory,
      `volume-${requestedVolume}-certification.md`
    ),
    renderVolumeCertificationReport(run),
    "utf8"
  );
  return run;
}
