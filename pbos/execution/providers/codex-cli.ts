import {
  execFile,
  execFileSync,
  spawn,
  type ChildProcess,
} from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { Artifacts } from "../../kernel/artifacts";
import { artifactDigest } from "../../kernel/identity";
import type { ExecutionTask } from "../tasks";
import type { CodexTaskDelegate } from "../adapters";
import {
  ExecutionTelemetryRecorder,
  loadExecutionTelemetry,
  type ProviderEventSink,
  type ProviderExecutionEventType,
} from "./telemetry";

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

function configuredDuration(value: number | undefined, environment: string | undefined, fallback: number): number {
  const candidate = value ?? Number(environment);
  return Number.isFinite(candidate) && candidate > 0 ? candidate : fallback;
}

export function createCodexCliDelegate(input: {
  readonly rootDir: string;
  readonly codexBinary?: string;
  readonly timeout_ms?: number;
  readonly heartbeat_interval_ms?: number;
  readonly no_response_timeout_ms?: number;
  readonly now?: () => Date;
  readonly event_sink?: ProviderEventSink;
  readonly launch?: (
    binary: string,
    args: readonly string[],
    options: { readonly cwd: string }
  ) => ChildProcess;
}): CodexTaskDelegate {
  return async (task) => {
    const now = input.now ?? (() => new Date());
    const startedAt = now().toISOString();
    const before = new Set(changedFiles(input.rootDir));
    const binary = input.codexBinary ?? "codex";
    const executionId = `EXECUTION-${artifactDigest({
      task: task.digest,
      startedAt,
    }).slice(0, 16)}`;
    const defaultSink: ProviderEventSink = (telemetry, event) => {
      if (event.type === "PROVIDER_STARTED") {
        console.log([
          "PBOS EXECUTION STARTED",
          `Execution: ${telemetry.execution_id}`,
          `Provider: ${telemetry.provider}`,
          `Task: ${telemetry.task}`,
          `Milestone: ${telemetry.milestone}`,
          "Status: RUNNING",
        ].join("\n"));
        return;
      }
      if (event.detail === "Execution heartbeat.") {
        console.log([
          "PBOS EXECUTION HEARTBEAT",
          `Execution: ${telemetry.execution_id}`,
          `Provider: ${telemetry.provider}`,
          "State: RUNNING",
          `Elapsed: ${Math.floor(event.elapsed_ms / 1000)}s`,
          `Last Provider Event: ${telemetry.events.at(-2)?.type ?? event.type}`,
        ].join("\n"));
        return;
      }
      if (event.type === "PROVIDER_WAITING") {
        console.warn([
          "PBOS EXECUTION WARNING",
          `Provider: ${telemetry.provider}`,
          "State: NO_PROVIDER_RESPONSE",
          "Action: Waiting; PBOS has not fabricated completion or stopped the provider.",
        ].join("\n"));
        return;
      }
      console.log(`PBOS PROVIDER EVENT: ${event.type} - ${event.detail}`);
    };
    const recorder = new ExecutionTelemetryRecorder({
      rootDir: input.rootDir,
      executionId,
      task,
      startedAt,
      now,
      sink: input.event_sink ?? defaultSink,
    });
    recorder.record("PROVIDER_STARTED", "Codex provider process requested.");
    const providerArgs = [
      "exec", "--ephemeral", "--json", "--sandbox", "workspace-write",
      "--cd", input.rootDir, prompt(task),
    ];
    let child: ChildProcess;
    try {
      child = input.launch
        ? input.launch(binary, providerArgs, { cwd: input.rootDir })
        : spawn(binary, providerArgs, {
            cwd: input.rootDir,
            stdio: ["ignore", "pipe", "pipe"],
          });
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      recorder.record("PROVIDER_FAILED", failure.message);
      throw failure;
    }
    recorder.record("PROVIDER_RUNNING", "Codex provider process launched.");

    let stdout = "";
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let lastProviderEvent: ProviderExecutionEventType = "PROVIDER_RUNNING";
    let lastProviderEventAt = Date.parse(now().toISOString());
    let waitingEmitted = false;
    const consumeLine = (line: string, stream: "stdout" | "stderr") => {
      const normalized = line.trim();
      if (!normalized) return;
      let payload: unknown = normalized;
      if (stream === "stdout") {
        try {
          payload = JSON.parse(normalized) as unknown;
        } catch {
          // Non-JSON provider output is still observable and digest-bound.
        }
      }
      lastProviderEvent = "PROVIDER_OUTPUT_RECEIVED";
      lastProviderEventAt = Date.parse(now().toISOString());
      waitingEmitted = false;
      recorder.record(
        "PROVIDER_OUTPUT_RECEIVED",
        `${stream} event received.`,
        payload
      );
    };
    const consumeChunk = (chunk: Buffer | string, stream: "stdout" | "stderr") => {
      const value = chunk.toString();
      if (stream === "stdout") stdout += value;
      const combined = (stream === "stdout" ? stdoutBuffer : stderrBuffer) + value;
      const lines = combined.split(/\r?\n/);
      const remainder = lines.pop() ?? "";
      if (stream === "stdout") stdoutBuffer = remainder;
      else stderrBuffer = remainder;
      for (const line of lines) consumeLine(line, stream);
    };
    child.stdout?.on("data", (chunk: Buffer | string) => consumeChunk(chunk, "stdout"));
    child.stderr?.on("data", (chunk: Buffer | string) => consumeChunk(chunk, "stderr"));

    const heartbeatInterval = configuredDuration(
      input.heartbeat_interval_ms,
      process.env.PBOS_CODEX_HEARTBEAT_INTERVAL_MS,
      30_000
    );
    const heartbeat = setInterval(() => {
      recorder.record("PROVIDER_RUNNING", "Execution heartbeat.", {
        lastProviderEvent,
      });
    }, heartbeatInterval);
    const noResponseTimeout = configuredDuration(
      input.no_response_timeout_ms,
      process.env.PBOS_CODEX_NO_RESPONSE_TIMEOUT_MS,
      120_000
    );
    const responseMonitor = setInterval(() => {
      const elapsed = Date.parse(now().toISOString()) - lastProviderEventAt;
      if (elapsed >= noResponseTimeout && !waitingEmitted) {
        waitingEmitted = true;
        lastProviderEvent = "PROVIDER_WAITING";
        recorder.record(
          "PROVIDER_WAITING",
          `No provider event received for ${elapsed}ms.`
        );
      }
    }, Math.min(noResponseTimeout, 1_000));

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearInterval(heartbeat);
        clearInterval(responseMonitor);
        if (stdoutBuffer) consumeLine(stdoutBuffer, "stdout");
        if (stderrBuffer) consumeLine(stderrBuffer, "stderr");
        if (error) {
          recorder.record("PROVIDER_FAILED", error.message);
          reject(error);
        } else {
          recorder.record("PROVIDER_COMPLETED", "Codex provider exited successfully.");
          resolve();
        }
      };
      child.once("error", (error) => finish(error));
      child.once("close", (code, signal) => {
        if (code === 0) finish();
        else finish(new Error(
          `Codex provider failed with exit code ${String(code)} and signal ${String(signal)}.`
        ));
      });
    });
    const after = changedFiles(input.rootDir);
    const produced = after.filter(
      (file) => !before.has(file) && file !== Artifacts.executionTelemetry
    );
    const inspected = task.allowed_scope.filter((file) => {
      const absolute = path.join(input.rootDir, file);
      return existsSync(absolute) && statSync(absolute).isFile();
    });
    const artifactPaths = [...new Set([...produced, ...inspected])].sort();
    const artifacts = artifactPaths.map((file) => {
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
      `PROVIDER_OUTPUT:${artifactDigest(stdout)}`,
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
    const completedAt = now().toISOString();
    const telemetry = loadExecutionTelemetry(input.rootDir);
    return {
      execution_id: executionId,
      task_id: task.task_id,
      agent_id: task.assigned_agent,
      status: "SUCCEEDED",
      artifacts,
      validation_results: validationResults,
      evidence_references: evidenceReferences,
      provider_telemetry: telemetry,
      provider_exit_status: 0,
      started_at: startedAt,
      completed_at: completedAt,
    };
  };
}
