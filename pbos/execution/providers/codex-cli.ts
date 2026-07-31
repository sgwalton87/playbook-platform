import { execFile, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { artifactDigest } from "../../kernel/identity";
import type { ExecutionTask } from "../tasks";
import type { CodexTaskDelegate } from "../adapters";

const executeFile = promisify(execFile);
const VALIDATION_COMMANDS: Readonly<Record<
  string,
  readonly [string, readonly string[]]
>> = {
  "npm test": ["npm", ["test"]],
  "npm run lint": ["npm", ["run", "lint"]],
  "npm run build": ["npm", ["run", "build"]],
  "npx tsc --noEmit --incremental false": [
    "npx",
    ["tsc", "--noEmit", "--incremental", "false"],
  ],
};

function changedFiles(rootDir: string): readonly string[] {
  return execFileSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: rootDir, encoding: "utf8" }
  )
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replaceAll("\\", "/"))
    .sort();
}

function prompt(task: ExecutionTask): string {
  return [
    "Execute this PBOS-governed assignment.",
    `Task: ${task.task_id}`,
    `Milestone: ${task.milestone_id}`,
    `Allowed scope: ${task.allowed_scope.join(", ")}`,
    `Prohibited scope: ${task.prohibited_scope.join(", ")}`,
    "Do not modify anything outside allowed scope.",
    "Do not alter PBOS authority, runtime truth, approvals, or lifecycle state.",
    `Required validations: ${task.validation_requirements.join(", ")}`,
    `Evidence requirements: ${task.evidence_requirements.join(", ")}`,
    "Complete the bounded implementation and report truthfully.",
  ].join("\n");
}

export function createCodexCliDelegate(input: {
  readonly rootDir: string;
  readonly codexBinary?: string;
  readonly timeout_ms?: number;
}): CodexTaskDelegate {
  return async (task) => {
    const startedAt = new Date().toISOString();
    const before = new Set(changedFiles(input.rootDir));
    const binary = input.codexBinary ?? "codex";
    const execution = await executeFile(binary, [
      "exec",
      "--ephemeral",
      "--json",
      "--sandbox",
      "workspace-write",
      "--cd",
      input.rootDir,
      prompt(task),
    ], {
      cwd: input.rootDir,
      timeout: input.timeout_ms ?? 1_800_000,
      maxBuffer: 20 * 1024 * 1024,
    });
    const after = changedFiles(input.rootDir);
    const produced = after.filter((file) => !before.has(file));
    const artifacts = produced.map((file) => {
      const absolute = path.join(input.rootDir, file);
      return {
        path: file,
        digest: existsSync(absolute)
          ? artifactDigest(readFileSync(absolute))
          : "DELETED",
      };
    });
    const validationResults: string[] = [];
    const evidenceReferences = [
      "COMMAND_INVENTORY",
      "FILE_CHANGE_INVENTORY",
      "EXECUTION_TIMESTAMPS",
      `COMMAND_INVENTORY:${artifactDigest([binary, "exec"])}`,
      `FILE_CHANGE_INVENTORY:${artifactDigest(artifacts)}`,
      `EXECUTION_TIMESTAMPS:${artifactDigest({ startedAt })}`,
      `PROVIDER_OUTPUT:${artifactDigest(execution.stdout)}`,
    ];
    for (const requirement of task.validation_requirements) {
      const command = VALIDATION_COMMANDS[requirement];
      if (!command) continue;
      const [executable, args] = command;
      try {
        await executeFile(executable, [...args], {
          cwd: input.rootDir,
          timeout: input.timeout_ms ?? 1_800_000,
          maxBuffer: 20 * 1024 * 1024,
        });
        validationResults.push(requirement);
      } catch {
        // Missing PASS evidence is preserved and blocks completion.
      }
    }
    evidenceReferences.push(
      "VALIDATION_RESULTS",
      `VALIDATION_RESULTS:${artifactDigest(validationResults)}`
    );
    const completedAt = new Date().toISOString();
    return {
      execution_id: `EXECUTION-${artifactDigest({
        task: task.digest,
        startedAt,
      }).slice(0, 16)}`,
      task_id: task.task_id,
      agent_id: task.assigned_agent,
      status: "SUCCEEDED",
      artifacts,
      validation_results: validationResults,
      evidence_references: evidenceReferences,
      started_at: startedAt,
      completed_at: completedAt,
    };
  };
}
