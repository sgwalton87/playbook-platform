import { mkdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { recommendNextGate } from "./recommendation";
import type { ExecutionMode, ExecutionReport, GateDefinition, PbosConfig, ValidationResult } from "./types";

export function createReport(args: {
  config: PbosConfig;
  mode: ExecutionMode;
  selectedGate: GateDefinition | null;
  validationResults: ValidationResult[];
  duration: number;
  release?: import("../release/state-machine").ReleaseTransition;
}): ExecutionReport {
  const blockers = args.validationResults.filter((result) => !result.passed).map((result) => `${result.id}: ${result.message} Remediation: ${result.remediation}`);
  const recommendation = recommendNextGate(args.selectedGate, args.release);
  return {
    engineVersion: args.config.version,
    executionMode: args.mode,
    selectedGate: args.selectedGate?.id ?? null,
    completedTasks: args.selectedGate
      ? [
          `Selected ${args.selectedGate.id} as the next eligible production-safe sprint.`,
          "Stopped before application code changes because PBOS Engine v3 is still planning-first.",
        ]
      : ["No eligible gate was selected."],
    validationResults: args.validationResults,
    blockers,
    recommendation: args.selectedGate && recommendation.recommendedNextGate ? `Complete ${args.selectedGate.id}, then evaluate ${recommendation.recommendedNextGate}. ${recommendation.reason}` : recommendation.reason,
    duration: args.duration,
    timestamp: new Date().toISOString(),
    release: args.release,
  };
}

export function formatReport(report: ExecutionReport): string {
  const completedTasks = report.completedTasks.map((task) => `- ${task}`).join("\n");
  const validation = report.validationResults
    .map(
      (result) =>
        `- ${result.passed ? "PASS" : "FAIL"}: ${result.id} [${result.severity}] — ${result.message}\n  - Remediation: ${result.remediation}\n  - Handbook: ${result.handbookReference}${result.command ? `\n  - Command: ${result.command}` : ""}`,
    )
    .join("\n");
  const blockers = report.blockers.length > 0 ? report.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None from planning validation.";

  return `# PBOS Engine Report\n\n## Structured Report\n\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\`\n\n## Completed Tasks\n${completedTasks}\n\n## Validation Results\n${validation}\n\n## Blockers\n${blockers}\n\n## Recommendation\n${report.recommendation}\n`;
}

export async function writeReport(report: ExecutionReport, config: PbosConfig, rootDir = process.cwd()): Promise<string> {
  await mkdir(path.join(rootDir, config.reportsDirectory), { recursive: true });
  const reportName = report.selectedGate ? `${report.selectedGate.toLowerCase()}-${report.executionMode}.md` : `no-eligible-gate-${report.executionMode}.md`;
  const reportPath = path.join(rootDir, config.reportsDirectory, reportName);
  await writeFile(reportPath, formatReport(report));
  return reportPath;
}
