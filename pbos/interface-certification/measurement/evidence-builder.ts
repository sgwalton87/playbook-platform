import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { discoverConstitutionalVolume } from "../../constitution/discovery";
import { Artifacts, Runtime } from "../../kernel";
import { decodeInterfaceMeasurementArtifact } from "../../runtime/artifact-decoders";
import { computeInterfaceImplementationDigest } from "../evidence-loader";
import { analyzeInterfaceImplementation } from "./analyzers";
import { validateInterfaceMeasurementHistory } from "./history";
import type {
  InterfaceMeasurementArtifact,
  InterfaceMeasurementRun,
} from "./measurement-types";
import { renderInterfaceMeasurementReport } from "./measurement-report";
import { scanInterfaceImplementation } from "./scanner";

export function evaluateInterfaceMeasurement(
  requestedVolume: number,
  rootDir = process.cwd(),
  measuredAt = new Date().toISOString()
): InterfaceMeasurementRun {
  const volume = discoverConstitutionalVolume(
    requestedVolume,
    rootDir
  );
  const files = scanInterfaceImplementation(rootDir);
  const implementationDigest =
    computeInterfaceImplementationDigest(rootDir);
  const domains = analyzeInterfaceImplementation(files);
  const domainFindings = Object.values(domains).flatMap(
    ({ id, findings }) =>
      findings.map((finding) => `${id}: ${finding}`)
  );
  const findings = [
    ...(files.length === 0
      ? ["No interface implementation files were available to measure."]
      : []),
    ...domainFindings,
  ];
  return {
    runId: `${volume.id}:${implementationDigest}:${volume.contentDigest}:${measuredAt}`,
    volume: volume.id,
    volumeDigest: volume.contentDigest,
    implementation: "playbook-platform-interface",
    implementationDigest,
    measuredAt,
    owner: "interface-measurement",
    scannerVersion: "1.0.0",
    filesScanned: files.length,
    domains,
    findings,
    measurementComplete:
      files.length > 0 && Object.keys(domains).length === 8,
    certificationEligible: false,
  };
}

export function measureInterfaceImplementation(
  requestedVolume: number,
  rootDir = process.cwd(),
  measuredAt = new Date().toISOString()
): InterfaceMeasurementRun {
  const run = evaluateInterfaceMeasurement(
    requestedVolume,
    rootDir,
    measuredAt
  );
  const artifactPath = path.join(
    rootDir,
    Artifacts.interfaceMeasurement
  );
  const existing = Runtime.exists(artifactPath)
    ? decodeInterfaceMeasurementArtifact(Runtime.load(artifactPath))
    : null;
  if (existing) {
    validateInterfaceMeasurementHistory(existing);
  }
  const artifact: InterfaceMeasurementArtifact = {
    schemaVersion: 1,
    ...run,
    history: [...(existing?.history ?? []), run],
  };
  Runtime.save(artifactPath, artifact, "interface-measurement");

  const reportDirectory = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(
      reportDirectory,
      `volume-${requestedVolume}-interface-measurement.md`
    ),
    renderInterfaceMeasurementReport(run),
    "utf8"
  );
  return run;
}
