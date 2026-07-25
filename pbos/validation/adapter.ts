import type {
  ContractStatus,
  ValidationAdapter,
  ValidationEvidence,
} from "../release/contracts";

export interface ValidationCheckResult {
  status: ContractStatus;
  summary: string;
  evidence?: readonly string[];
  executedAt?: string;
  durationMs?: number;
}

export type ValidationCheck = () =>
  | ValidationCheckResult
  | Promise<ValidationCheckResult>;

export interface CreateValidationAdapterOptions {
  id: string;
  name: string;
  check: ValidationCheck;
}

function normalizeRequiredText(
  value: string,
  fieldName: string
): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(
      `Validation adapter ${fieldName} must not be empty.`
    );
  }

  return normalized;
}

function normalizeStatus(
  status: ContractStatus
): ContractStatus {
  if (
    status !== "PASS" &&
    status !== "FAIL" &&
    status !== "PENDING"
  ) {
    throw new Error(
      `Unsupported validation status: ${String(status)}`
    );
  }

  return status;
}

function normalizeDuration(
  durationMs: number | undefined,
  fallbackDurationMs: number
): number {
  if (
    typeof durationMs === "number" &&
    Number.isFinite(durationMs) &&
    durationMs >= 0
  ) {
    return durationMs;
  }

  return Math.max(0, fallbackDurationMs);
}

function normalizeExecutedAt(
  executedAt: string | undefined,
  fallbackExecutedAt: string
): string {
  if (typeof executedAt !== "string") {
    return fallbackExecutedAt;
  }

  const normalized = executedAt.trim();

  if (normalized.length === 0) {
    return fallbackExecutedAt;
  }

  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    return fallbackExecutedAt;
  }

  return new Date(timestamp).toISOString();
}

function normalizeEvidence(
  evidence: readonly string[] | undefined
): string[] {
  if (!Array.isArray(evidence)) {
    return [];
  }

  return evidence
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error.trim();
  }

  return "Validation failed with an unknown error.";
}

export function createValidationAdapter(
  options: CreateValidationAdapterOptions
): ValidationAdapter {
  const id = normalizeRequiredText(options.id, "id");
  const name = normalizeRequiredText(options.name, "name");

  if (typeof options.check !== "function") {
    throw new TypeError(
      `Validation adapter "${id}" requires a check function.`
    );
  }

  return {
    id,
    name,

    async run(): Promise<ValidationEvidence> {
      const startedAt = Date.now();
      const fallbackExecutedAt = new Date().toISOString();

      try {
        const result = await options.check();

        if (
          result === null ||
          typeof result !== "object"
        ) {
          throw new TypeError(
            `Validation adapter "${id}" returned an invalid result.`
          );
        }

        const summary = normalizeRequiredText(
          result.summary,
          "summary"
        );

        return {
          id,
          name,
          status: normalizeStatus(result.status),
          executedAt: normalizeExecutedAt(
            result.executedAt,
            fallbackExecutedAt
          ),
          durationMs: normalizeDuration(
            result.durationMs,
            Date.now() - startedAt
          ),
          summary,
          evidence: normalizeEvidence(result.evidence),
        };
      } catch (error: unknown) {
        return {
          id,
          name,
          status: "FAIL",
          executedAt: fallbackExecutedAt,
          durationMs: Date.now() - startedAt,
          summary: `${name} could not complete.`,
          evidence: [errorMessage(error)],
        };
      }
    },
  };
}

export function createPassingAdapter(
  id: string,
  name: string,
  summary: string,
  evidence: readonly string[] = []
): ValidationAdapter {
  return createValidationAdapter({
    id,
    name,
    check: () => ({
      status: "PASS",
      summary,
      evidence,
    }),
  });
}

export function createFailingAdapter(
  id: string,
  name: string,
  summary: string,
  evidence: readonly string[] = []
): ValidationAdapter {
  return createValidationAdapter({
    id,
    name,
    check: () => ({
      status: "FAIL",
      summary,
      evidence,
    }),
  });
}

export function createPendingAdapter(
  id: string,
  name: string,
  summary: string,
  evidence: readonly string[] = []
): ValidationAdapter {
  return createValidationAdapter({
    id,
    name,
    check: () => ({
      status: "PENDING",
      summary,
      evidence,
    }),
  });
}
