import path from "node:path";
import { runRepositoryKernel } from "../engine/kernel-repository-adapter";
import { runExecutionEngine } from "../execution";
import { loadExecutionAuthorizationOrUndefined } from "../execution/authorization";
import type { ExecutionPlan as AdapterExecutionPlan } from "../execution/types";
import {
  Artifacts,
  Runtime,
  artifactDigest,
} from "../kernel";
import type {
  KernelResult,
  StateTransitionRequest,
} from "../kernel/execution";

export const KERNEL_RUNTIME_VERSION = "1.0.0";

export type RuntimeLifecycleState =
  | "BOOTING"
  | "READY"
  | "EXECUTING"
  | "CERTIFYING"
  | "SHUTTING_DOWN"
  | "STOPPED"
  | "FAILED";

export interface RuntimeTransition {
  readonly executionId: string;
  readonly from: RuntimeLifecycleState | null;
  readonly to: RuntimeLifecycleState;
  readonly requestedTransition: RuntimeLifecycleState;
  readonly approvedTransition: RuntimeLifecycleState;
  readonly actorId: string;
  readonly authorizationId: string;
  readonly timestamp: string;
  readonly reason: string;
}

export interface RuntimeMetrics {
  readonly startupDurationMs: number;
  readonly shutdownDurationMs: number;
  readonly executionDurationMs: number;
  readonly validationDurationMs: number;
  readonly certificationDurationMs: number;
  readonly recoveryDurationMs: number;
  readonly kernelUptimeMs: number;
  readonly executionCount: 1;
  readonly successCount: 0 | 1;
  readonly failureCount: 0 | 1;
}

export interface RuntimeCertification {
  readonly status: "CERTIFIED" | "REJECTED";
  readonly validator: "pbos.runtime.complete-envelope.v1";
  readonly evidenceDigest: string;
  readonly findings: readonly string[];
  readonly certifiedAt: string;
  readonly digest: string;
}

type RuntimeExecutionEvidence = Omit<
  RuntimeExecutionEnvelope,
  "certification"
>;

export interface RuntimeExecutionEnvelope {
  readonly id: string;
  readonly version: "1.0.0";
  readonly executionId: string;
  readonly actorId: string;
  readonly authorizationId: string | null;
  readonly command: "execute";
  readonly requestedAt: string;
  readonly kernelExecutionId: string | null;
  readonly kernelVersion: string;
  readonly runtimeVersion: typeof KERNEL_RUNTIME_VERSION;
  readonly plan: KernelResult["plan"];
  readonly transitionRequest: StateTransitionRequest | null;
  readonly transitionHistory: readonly RuntimeTransition[];
  readonly validationResults: readonly {
    stage: string;
    status: "PASS" | "FAIL";
    validator: string;
    outputDigest: string;
  }[];
  readonly kernelCertification: KernelResult["certification"] | null;
  readonly adapterOutcome: AdapterExecutionPlan | null;
  readonly metrics: RuntimeMetrics;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly recoveryActions: readonly string[];
  readonly outcome: "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "RECOVERED";
  readonly certification: RuntimeCertification | null;
}

export interface RuntimeExecutionHistory {
  readonly version: "1.0.0";
  readonly owner: "kernel-runtime";
  readonly latest: RuntimeExecutionEnvelope;
  readonly history: readonly RuntimeExecutionEnvelope[];
}

export interface KernelRuntimeResult {
  readonly successful: boolean;
  readonly envelope: RuntimeExecutionEnvelope;
}

const ALLOWED_RUNTIME_TRANSITIONS: Readonly<
  Record<string, readonly RuntimeLifecycleState[]>
> = {
  START: ["BOOTING"],
  BOOTING: ["READY", "FAILED"],
  READY: ["EXECUTING", "FAILED"],
  EXECUTING: ["CERTIFYING", "FAILED"],
  CERTIFYING: ["SHUTTING_DOWN", "FAILED"],
  FAILED: ["SHUTTING_DOWN"],
  SHUTTING_DOWN: ["STOPPED"],
  STOPPED: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertEnvelope(
  value: unknown
): asserts value is RuntimeExecutionEnvelope {
  const transitionsValid =
    isRecord(value) &&
    Array.isArray(value.transitionHistory) &&
    value.transitionHistory.every(
      (transition) =>
        isRecord(transition) &&
        typeof transition.executionId === "string" &&
        (transition.from === null ||
          typeof transition.from === "string") &&
        typeof transition.to === "string" &&
        transition.requestedTransition === transition.to &&
        transition.approvedTransition === transition.to &&
        typeof transition.actorId === "string" &&
        typeof transition.authorizationId === "string" &&
        typeof transition.timestamp === "string" &&
        typeof transition.reason === "string"
    );
  if (
    !isRecord(value) ||
    value.version !== "1.0.0" ||
    typeof value.id !== "string" ||
    typeof value.executionId !== "string" ||
    typeof value.actorId !== "string" ||
    value.command !== "execute" ||
    typeof value.requestedAt !== "string" ||
    !transitionsValid ||
    !isRecord(value.metrics) ||
    value.metrics.executionCount !== 1 ||
    !Array.isArray(value.errors) ||
    !Array.isArray(value.warnings) ||
    !Array.isArray(value.recoveryActions) ||
    !["IN_PROGRESS", "SUCCEEDED", "FAILED", "RECOVERED"].includes(
      String(value.outcome)
    )
  ) {
    throw new Error("Kernel runtime history contains an invalid envelope.");
  }
}

function parseEnvelope(value: unknown): RuntimeExecutionEnvelope {
  assertEnvelope(value);
  return value;
}

function parseHistory(value: unknown): RuntimeExecutionHistory {
  if (
    !isRecord(value) ||
    value.version !== "1.0.0" ||
    value.owner !== "kernel-runtime" ||
    !Array.isArray(value.history)
  ) {
    throw new Error("Kernel runtime history artifact is invalid.");
  }
  const history = value.history.map(parseEnvelope);
  const latest = parseEnvelope(value.latest);
  for (const envelope of history) {
    if (!envelope.certification) {
      throw new Error("Finalized kernel runtime history lacks certification.");
    }
    const { certification, ...evidence } = envelope;
    if (
      certification.evidenceDigest !== artifactDigest(evidence) ||
      certification.digest !==
        artifactDigest({
          status: certification.status,
          validator: certification.validator,
          evidenceDigest: certification.evidenceDigest,
          findings: certification.findings,
          certifiedAt: certification.certifiedAt,
        })
    ) {
      throw new Error("Finalized kernel runtime history is immutable and invalid.");
    }
  }
  return { version: "1.0.0", owner: "kernel-runtime", latest, history };
}

function readHistory(rootDir: string): RuntimeExecutionHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.kernelExecutionHistory);
  if (!Runtime.exists(artifactPath)) return null;
  return parseHistory(Runtime.load(artifactPath));
}

export function loadKernelRuntimeHistory(
  rootDir = process.cwd()
): RuntimeExecutionHistory | null {
  return readHistory(rootDir);
}

function saveHistory(
  rootDir: string,
  prior: RuntimeExecutionHistory | null,
  envelope: RuntimeExecutionEnvelope,
  finalized: boolean
): void {
  const previousFinalized = prior?.history ?? [];
  const history = finalized
    ? [...previousFinalized, envelope]
    : previousFinalized;
  Runtime.save(
    path.join(rootDir, Artifacts.kernelExecutionHistory),
    {
      version: "1.0.0",
      owner: "kernel-runtime",
      latest: envelope,
      history,
    } satisfies RuntimeExecutionHistory,
    "kernel-runtime"
  );
}

function certifyEvidence(
  evidence: RuntimeExecutionEvidence,
  status: RuntimeCertification["status"],
  findings: readonly string[],
  certifiedAt: string
): RuntimeExecutionEnvelope {
  const certificationBody = {
    status,
    validator: "pbos.runtime.complete-envelope.v1" as const,
    evidenceDigest: artifactDigest(evidence),
    findings,
    certifiedAt,
  };
  return {
    ...evidence,
    certification: {
      ...certificationBody,
      digest: artifactDigest(certificationBody),
    },
  };
}

function withoutCertification(
  envelope: RuntimeExecutionEnvelope
): RuntimeExecutionEvidence {
  const evidence = { ...envelope };
  Reflect.deleteProperty(evidence, "certification");
  return evidence;
}

function recoverInterruptedHistory(
  prior: RuntimeExecutionHistory | null,
  actorId: string,
  recoveredAt: string
): RuntimeExecutionHistory | null {
  if (!prior || prior.latest.outcome !== "IN_PROGRESS") return prior;
  const priorEvidence = withoutCertification(prior.latest);
  const evidence: RuntimeExecutionEvidence = {
    ...priorEvidence,
    transitionHistory: [
      ...priorEvidence.transitionHistory,
      {
        executionId: priorEvidence.executionId,
        from: priorEvidence.transitionHistory.at(-1)?.to ?? null,
        to: "STOPPED",
        requestedTransition: "STOPPED",
        approvedTransition: "STOPPED",
        actorId,
        authorizationId:
          priorEvidence.authorizationId ?? "PBOS-RUNTIME-BOOTSTRAP",
        timestamp: recoveredAt,
        reason: "Interrupted runtime attempt recovered without applying state.",
      },
    ],
    errors: [
      ...priorEvidence.errors,
      "Runtime interruption detected before complete-envelope certification.",
    ],
    recoveryActions: [
      ...priorEvidence.recoveryActions,
      `Recovery finalized by ${actorId}.`,
    ],
    outcome: "RECOVERED",
  };
  const recovered = certifyEvidence(
    evidence,
    "REJECTED",
    ["Interrupted execution was preserved and no state transition was applied."],
    recoveredAt
  );
  return {
    ...prior,
    latest: recovered,
    history: [...prior.history, recovered],
  };
}

function elapsed(start: number): number {
  return Math.max(0, Math.round((performance.now() - start) * 1000) / 1000);
}

export class PBOSKernelRuntime {
  async execute(options: {
    rootDir?: string;
    actorId: string;
    now?: () => Date;
  }): Promise<KernelRuntimeResult> {
    const rootDir = options.rootDir ?? process.cwd();
    const actorId = options.actorId.trim();
    if (!actorId) throw new Error("Anonymous kernel execution is prohibited.");
    const now = options.now ?? (() => new Date());
    const started = performance.now();
    const requestedAt = now().toISOString();
    const loadedHistory = readHistory(rootDir);
    const recoveryStarted = performance.now();
    const recoveryActions =
      loadedHistory?.latest.outcome === "IN_PROGRESS"
        ? [`Recovered interrupted execution ${loadedHistory.latest.executionId}; no state transition was applied.`]
        : [];
    const prior = recoverInterruptedHistory(loadedHistory, actorId, requestedAt);
    const recoveryDurationMs = elapsed(recoveryStarted);
    let state: RuntimeLifecycleState | null = null;
    const transitions: RuntimeTransition[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let transitionAuthorizationId = "PBOS-RUNTIME-BOOTSTRAP";
    let authorizationId: string | null = null;
    let kernel: KernelResult | null = null;
    let adapterOutcome: AdapterExecutionPlan | null = null;
    let startupDurationMs = 0;
    let shutdownDurationMs = 0;
    let executionDurationMs = 0;
    let validationDurationMs = 0;
    let certificationDurationMs = 0;
    const initialExecutionId = `EXEC-${artifactDigest({
      actorId,
      requestedAt,
      prior: prior?.latest.id ?? null,
    }).slice(0, 16)}`;

    const transition = (
      to: RuntimeLifecycleState,
      reason: string
    ): void => {
      const from = state ?? "START";
      if (!ALLOWED_RUNTIME_TRANSITIONS[from].includes(to)) {
        throw new Error(`Invalid runtime lifecycle transition: ${from} -> ${to}.`);
      }
      transitions.push({
        executionId: initialExecutionId,
        from: state,
        to,
        requestedTransition: to,
        approvedTransition: to,
        actorId,
        authorizationId: transitionAuthorizationId,
        timestamp: now().toISOString(),
        reason,
      });
      state = to;
    };

    const draft = (): RuntimeExecutionEnvelope => ({
      id: `ENVELOPE-${artifactDigest({
        executionId: initialExecutionId,
        actorId,
        transitions,
      }).slice(0, 16)}`,
      version: "1.0.0",
      executionId: initialExecutionId,
      actorId,
      authorizationId,
      command: "execute",
      requestedAt,
      kernelExecutionId: kernel?.executionId ?? null,
      kernelVersion: kernel?.version ?? "1.0.0",
      runtimeVersion: KERNEL_RUNTIME_VERSION,
      plan: kernel?.plan ?? null,
      transitionRequest: kernel?.transition ?? null,
      transitionHistory: [...transitions],
      validationResults:
        kernel?.events.map(({ stage, status, validator, outputDigest }) => ({
          stage,
          status,
          validator,
          outputDigest,
        })) ?? [],
      kernelCertification: kernel?.certification ?? null,
      adapterOutcome,
      metrics: {
        startupDurationMs,
        shutdownDurationMs,
        executionDurationMs,
        validationDurationMs,
        certificationDurationMs,
        recoveryDurationMs,
        kernelUptimeMs: elapsed(started),
        executionCount: 1,
        successCount: adapterOutcome?.status === "READY" ? 1 : 0,
        failureCount: adapterOutcome?.status === "READY" ? 0 : 1,
      },
      errors: [...errors],
      warnings: [...warnings],
      recoveryActions,
      outcome: "IN_PROGRESS",
      certification: null,
    });

    try {
      const startupStarted = performance.now();
      transition("BOOTING", "Actor-bound runtime bootstrap authorized.");
      saveHistory(rootDir, prior, draft(), false);
      transition("READY", "Runtime construction and recovery validation completed.");
      startupDurationMs = elapsed(startupStarted);

      const validationStarted = performance.now();
      kernel = await runRepositoryKernel(rootDir);
      validationDurationMs = elapsed(validationStarted);
      if (
        kernel.certification.status !== "CERTIFIED" ||
        !kernel.plan ||
        !kernel.transition
      ) {
        throw new Error(
          kernel.certification.findings.join("; ") ||
            kernel.decision.rationale.join("; ")
        );
      }

      const authorization = loadExecutionAuthorizationOrUndefined(rootDir);
      authorizationId = authorization?.id ?? null;
      if (authorization?.status !== "AUTHORIZED") {
        throw new Error("Execution authorization is not AUTHORIZED.");
      }
      transitionAuthorizationId = authorization.id;

      transition("EXECUTING", "Certified plan and durable authorization accepted.");
      saveHistory(rootDir, prior, draft(), false);
      const executionStarted = performance.now();
      adapterOutcome = runExecutionEngine(undefined, rootDir);
      executionDurationMs = elapsed(executionStarted);
      if (adapterOutcome.status !== "READY") {
        throw new Error("Execution adapter dispatch did not complete successfully.");
      }
      transition("CERTIFYING", "Execution outcome ready for complete-envelope certification.");
    } catch (error: unknown) {
      errors.push(error instanceof Error ? error.message : String(error));
      transition("FAILED", "Runtime terminated fail closed.");
    } finally {
      const shutdownStarted = performance.now();
      transition("SHUTTING_DOWN", "Runtime shutdown initiated.");
      transition("STOPPED", "Runtime resources released.");
      shutdownDurationMs = elapsed(shutdownStarted);
    }

    const certificationStarted = performance.now();
    const findings = [
      ...errors,
      ...(kernel?.certification.status === "CERTIFIED"
        ? []
        : ["Kernel decision certification did not pass."]),
      ...(authorizationId ? [] : ["Authorization identity is missing."]),
      ...(adapterOutcome?.status === "READY"
        ? []
        : ["Execution outcome is not successful."]),
      ...(state === "STOPPED" ? [] : ["Runtime did not stop cleanly."]),
    ];
    certificationDurationMs = elapsed(certificationStarted);
    const status = findings.length === 0 ? "CERTIFIED" : "REJECTED";
    const draftEvidence = withoutCertification(draft());
    const finalEvidence: RuntimeExecutionEvidence = {
      ...draftEvidence,
      outcome: status === "CERTIFIED" ? "SUCCEEDED" : "FAILED",
    };
    const envelope = certifyEvidence(
      finalEvidence,
      status,
      findings,
      now().toISOString()
    );
    saveHistory(rootDir, prior, envelope, true);
    return { successful: status === "CERTIFIED", envelope };
  }
}

export async function runKernelRuntime(options: {
  rootDir?: string;
  actorId: string;
  now?: () => Date;
}): Promise<KernelRuntimeResult> {
  return new PBOSKernelRuntime().execute(options);
}
