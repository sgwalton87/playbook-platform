import fs from "node:fs";
import path from "node:path";
import { AUDIT_CONTROL_CHECKS, type AuditControlCheck } from "./manifest";

export type AuditControlResult = {
  id: string;
  category: AuditControlCheck["category"];
  description: string;
  file: string;
  ok: boolean;
  failures: string[];
};

export type AuditControlReport = {
  generatedAt: string;
  ok: boolean;
  passed: number;
  failed: number;
  results: AuditControlResult[];
};

function evaluate(check: AuditControlCheck, root: string): AuditControlResult {
  const absolute = path.join(root, check.file);
  const failures: string[] = [];
  if (!fs.existsSync(absolute)) {
    failures.push(`Missing required artifact: ${check.file}`);
    return { ...check, ok: false, failures };
  }

  const source = fs.readFileSync(absolute, "utf8");
  for (const required of check.required ?? []) {
    if (!source.includes(required)) failures.push(`Missing required invariant: ${required}`);
  }
  for (const forbidden of check.forbidden ?? []) {
    if (source.includes(forbidden)) failures.push(`Forbidden invariant detected: ${forbidden}`);
  }

  return { ...check, ok: failures.length === 0, failures };
}

export function runAuditControl(root = process.cwd()): AuditControlReport {
  const results = AUDIT_CONTROL_CHECKS.map((check) => evaluate(check, root));
  const failed = results.filter((result) => !result.ok).length;
  return {
    generatedAt: new Date().toISOString(),
    ok: failed === 0,
    passed: results.length - failed,
    failed,
    results,
  };
}

export function renderAuditControlReport(report: AuditControlReport): string {
  const lines = [
    "# PBOS Audit Control Report",
    "",
    `Status: ${report.ok ? "PASS" : "BLOCKED"}`,
    `Checks: ${report.passed} passed / ${report.failed} failed`,
    `Generated: ${report.generatedAt}`,
    "",
  ];
  for (const result of report.results) {
    lines.push(`## ${result.ok ? "✅" : "❌"} ${result.id}`);
    lines.push("");
    lines.push(result.description);
    lines.push("");
    lines.push(`Artifact: \`${result.file}\``);
    if (result.failures.length) {
      lines.push("");
      for (const failure of result.failures) lines.push(`- ${failure}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
