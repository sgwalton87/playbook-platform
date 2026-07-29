import type { InterfaceMeasurementRun } from "./measurement-types";

export function renderInterfaceMeasurementReport(
  run: InterfaceMeasurementRun
): string {
  const rows = Object.values(run.domains)
    .map(
      (domain) =>
        `| ${domain.id} | ${domain.name} | ${domain.status} | ${domain.observedSignals}/${domain.requiredSignals} |`
    )
    .join("\n");
  const findings = run.findings.length
    ? run.findings.map((finding) => `- ${finding}`).join("\n")
    : "- None";
  return `# PBOS Interface Measurement Report

## Identity

- Volume: ${run.volume}
- Volume digest: \`${run.volumeDigest}\`
- Implementation: ${run.implementation}
- Implementation digest: \`${run.implementationDigest}\`
- Measurement run: \`${run.runId}\`
- Measured at: ${run.measuredAt}
- Scanner: interface-measurement@${run.scannerVersion}

## Measurement Boundary

Repository signals are observations, not compliance decisions. This report does not certify Volume 34, set certification controls to PASS, or authorize a lifecycle transition.

## Result

- Files scanned: ${run.filesScanned}
- Measurement complete: ${run.measurementComplete ? "YES" : "NO"}
- Certification eligible from measurement alone: NO

| Rule | Domain | Signal Status | Signals Observed |
| --- | --- | --- | --- |
${rows}

## Findings

${findings}
`;
}
