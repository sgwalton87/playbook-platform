import { access, appendFile, mkdir } from "node:fs/promises";
import * as path from "node:path";
import type { ExecutionReport, PbosConfig, ValidationResult } from "./types";

export async function verifyHandbookFiles(config: PbosConfig, rootDir = process.cwd()): Promise<ValidationResult> {
  const required = [
    config.handbook.implementationTruth,
    config.handbook.releasePolicy,
    config.handbook.sprintSequencing,
    config.handbook.historyDirectory,
    config.handbook.ledgerDirectory,
  ];
  const missing: string[] = [];

  for (const relativePath of required) {
    try {
      await access(path.join(rootDir, relativePath));
    } catch {
      missing.push(relativePath);
    }
  }

  if (missing.length > 0) {
    return {
      id: "HandbookDiscovery",
      severity: "error",
      passed: false,
      message: `Missing authority sources: ${missing.join(", ")}`,
      remediation: "Restore the missing handbook, history, or ledger path before running PBOS execution mode.",
      handbookReference: "docs/auto_sprint.md#canonical-source-hierarchy",
    };
  }

  return {
    id: "HandbookDiscovery",
    severity: "info",
    passed: true,
    message: `Discovered authority sources: ${required.join(", ")}`,
    remediation: "No remediation required.",
    handbookReference: "docs/auto_sprint.md#canonical-source-hierarchy",
  };
}

export async function appendHistoryAndLedger(report: ExecutionReport, config: PbosConfig, rootDir = process.cwd()): Promise<void> {
  const stamp = report.timestamp;
  const entry = `\n## ${stamp}\n- PBOS Engine ${report.engineVersion} ran in ${report.executionMode} mode.\n- Selected gate: ${report.selectedGate ?? "none"}.\n- Recommendation: ${report.recommendation.replace(/[.]+$/, "")}.\n`;
  const historyPath = path.join(rootDir, config.handbook.historyDirectory, "PBOS_ENGINE_HISTORY.md");
  const ledgerPath = path.join(rootDir, config.handbook.ledgerDirectory, "PBOS_ENGINE_LEDGER.md");
  await mkdir(path.dirname(historyPath), { recursive: true });
  await mkdir(path.dirname(ledgerPath), { recursive: true });
  await appendFile(historyPath, entry);
  await appendFile(ledgerPath, entry);
}
