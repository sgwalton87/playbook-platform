import { EventEmitter } from "node:events";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Artifacts, artifactDigest } from "../../kernel";
import type { ExecutionTask } from "../tasks";
import type { ExecutionTelemetry, ProviderExecutionEvent } from "./telemetry";
import { createCodexCliDelegate } from "./codex-cli";

function repository(): string {
  const root = mkdtempSync(path.join(tmpdir(), "pbos-codex-provider-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  return root;
}

function task(): ExecutionTask {
  const body = {
    task_id: "TASK-001",
    package_id: "PACKAGE-001",
    milestone_id: "MILESTONE-001",
    context_identity: "a".repeat(64),
    authorization_reference: "APPROVAL-001",
    execution_authorization_id: "AUTHORIZATION-001",
    provider_id: "PBOS-CODEX-CODE-001",
    provider_contract_id: "PROVIDER-CONTRACT-001",
    assigned_agent: "PBOS-CODEX-CODE-001",
    allowed_scope: ["docs"],
    prohibited_scope: ["pbos/runtime"],
    required_capabilities: ["CODE_GENERATION"],
    validation_requirements: [],
    evidence_requirements: ["COMMAND_INVENTORY"],
  };
  return { ...body, digest: artifactDigest(body) };
}

function processDouble(input: {
  readonly stdout?: readonly string[];
  readonly stderr?: readonly string[];
  readonly delay?: number;
  readonly code?: number;
}) {
  const child = new EventEmitter() as EventEmitter & {
    stdout: PassThrough;
    stderr: PassThrough;
  };
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  setTimeout(() => {
    for (const value of input.stdout ?? []) child.stdout.write(value);
    for (const value of input.stderr ?? []) child.stderr.write(value);
    child.stdout.end();
    child.stderr.end();
    child.emit("close", input.code ?? 0, null);
  }, input.delay ?? 5);
  return child;
}

afterEach(() => vi.restoreAllMocks());

describe("Codex CLI execution telemetry", () => {
  it("prints the operator execution banner immediately after provider startup", async () => {
    const output = vi.spyOn(console, "log").mockImplementation(() => undefined);
    await createCodexCliDelegate({
      rootDir: repository(),
      heartbeat_interval_ms: 1_000,
      no_response_timeout_ms: 1_000,
      launch: () => processDouble({}) as never,
    })(task());

    expect(output.mock.calls[0]?.[0]).toContain("PBOS EXECUTION STARTED");
    expect(output.mock.calls[0]?.[0]).toContain("Provider: PBOS-CODEX-CODE-001");
    expect(output.mock.calls[0]?.[0]).toContain("Task: TASK-001");
    expect(output.mock.calls[0]?.[0]).toContain("Milestone: MILESTONE-001");
    expect(output.mock.calls[0]?.[0]).toContain("Status: RUNNING");
  });

  it("emits startup, streaming, completion, and durable evidence events", async () => {
    const rootDir = repository();
    const observed: ProviderExecutionEvent[] = [];
    const result = await createCodexCliDelegate({
      rootDir,
      heartbeat_interval_ms: 1_000,
      no_response_timeout_ms: 1_000,
      event_sink: (_, event) => observed.push(event),
      launch: () => processDouble({
        stdout: ['{"type":"item.completed","item":"result"}\n'],
      }) as never,
    })(task());

    expect(observed.map(({ type }) => type)).toEqual([
      "PROVIDER_STARTED",
      "PROVIDER_RUNNING",
      "PROVIDER_OUTPUT_RECEIVED",
      "PROVIDER_COMPLETED",
    ]);
    expect(result.status).toBe("SUCCEEDED");
    expect(result.evidence_references).toEqual(
      expect.arrayContaining([expect.stringMatching(/^PROVIDER_OUTPUT:/)])
    );
    const telemetry = JSON.parse(readFileSync(
      path.join(rootDir, Artifacts.executionTelemetry), "utf8"
    )) as ExecutionTelemetry;
    expect(telemetry.completion_state).toBe("SUCCEEDED");
    expect(telemetry.status).toBe("COMPLETED");
    expect(telemetry.digest).toBeTruthy();
  });

  it("emits heartbeats and a waiting warning without stopping the provider", async () => {
    const events: ProviderExecutionEvent[] = [];
    await createCodexCliDelegate({
      rootDir: repository(),
      heartbeat_interval_ms: 5,
      no_response_timeout_ms: 10,
      event_sink: (_, event) => events.push(event),
      launch: () => processDouble({ delay: 30 }) as never,
    })(task());

    expect(events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "PROVIDER_RUNNING", detail: "Execution heartbeat." }),
      expect.objectContaining({ type: "PROVIDER_WAITING" }),
      expect.objectContaining({ type: "PROVIDER_COMPLETED" }),
    ]));
  });

  it("persists provider failure and never returns success evidence", async () => {
    const rootDir = repository();
    const events: ProviderExecutionEvent[] = [];
    await expect(createCodexCliDelegate({
      rootDir,
      heartbeat_interval_ms: 1_000,
      no_response_timeout_ms: 1_000,
      event_sink: (_, event) => events.push(event),
      launch: () => processDouble({
        stderr: ["provider failure\n"],
        code: 2,
      }) as never,
    })(task())).rejects.toThrow("exit code 2");

    expect(events.at(-1)?.type).toBe("PROVIDER_FAILED");
    const telemetry = JSON.parse(readFileSync(
      path.join(rootDir, Artifacts.executionTelemetry), "utf8"
    )) as ExecutionTelemetry;
    expect(telemetry.completion_state).toBe("FAILED");
    expect(telemetry.status).toBe("FAILED");
  });
});
