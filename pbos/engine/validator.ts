import { spawn } from "node:child_process";
import type { GateDefinition, PbosConfig, RuleResult, ValidationResult } from "./types";
import { verifyHandbookFiles } from "./docs";
import { verifyPromptCompatibility } from "./prompts";

function fromRuleResult(result: RuleResult): ValidationResult {
  return { ...result };
}

function runCommand(id: string, command: string, args: string[], handbookReference: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      const output = `${stdout}\n${stderr}`.trim();
      const failureDetails = output.slice(-1000);
      resolve({
        id,
        severity: code === 0 ? "info" : "error",
        passed: code === 0,
        message: code === 0 ? `${id} passed.` : `${id} failed.${failureDetails ? ` ${failureDetails}` : ""}`,
        remediation: code === 0 ? "No remediation required." : "Review command output and repair the validation failure before execution mode.",
        handbookReference,
        command: [command, ...args].join(" "),
      });
    });
  });
}

export async function validateGatePlanning(gate: GateDefinition | null, config: PbosConfig, ruleResults: RuleResult[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = ruleResults.map(fromRuleResult);
  results.push(await verifyHandbookFiles(config));
  results.push(await verifyPromptCompatibility(config));

  if (gate?.validation.includes("docs")) {
    results.push(
      await runCommand(
        "HandbookVerification",
        "node",
        ["scripts/verify-handbook.mjs"],
        "docs/auto_sprint.md#canonical-source-hierarchy",
      ),
    );
  }

  return results;
}
