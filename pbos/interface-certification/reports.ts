import type { InterfaceCertificationRun } from "./types";

export function renderInterfaceCertificationReport(
  run: InterfaceCertificationRun
): string {
  const rows = Object.values(run.domains)
    .map(
      (domain) =>
        `| ${domain.id} | ${domain.name} | ${
          domain.passed ? "PASS" : "FAIL"
        } | ${domain.score} | ${
          domain.blockingConditions.join("; ") || "None"
        } |`
    )
    .join("\n");
  const blockers = run.blockingConditions.length
    ? run.blockingConditions.map((blocker) => `- ${blocker}`).join("\n")
    : "- None";
  return `# PBOS Interface Certification Report

## Identity

- Volume: ${run.volume}
- Volume digest: \`${run.volumeDigest}\`
- Implementation: ${run.implementation || "Unidentified"}
- Implementation digest: \`${run.digest}\`
- Validator: ${run.validator?.id ?? "Unidentified"} ${
    run.validator?.version ?? ""
  }
- Certification timestamp: ${run.certificationTimestamp}
- Measurement run: ${run.measurement?.runId ?? "Unavailable"}
- Measurement complete: ${
    run.measurement?.measurementComplete ? "YES" : "NO"
  }
- Measurement alone authorizes certification: NO

## Result

- Status: ${run.status}
- Score: ${run.score}/100
- Validation complete: ${run.validationComplete ? "YES" : "NO"}

## Domains

| Rule | Domain | Result | Score | Blocking Conditions |
| --- | --- | --- | --- | --- |
${rows}

## Blocking Conditions

${blockers}
`;
}
