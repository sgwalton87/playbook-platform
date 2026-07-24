import type {
  CanonicalFile,
  EngineeringGate,
  PbosState,
  ValidationIssue,
  ValidationResult,
} from "./types";

const statuses = new Set(["completed", "current", "blocked", "pending", "UNKNOWN"]);

export function validatePbosState(state: PbosState): ValidationResult {
  const issues: ValidationIssue[] = [];
  const documents: Array<[CanonicalFile, Record<string, unknown>, string[]]> = [
    ["repository-state.yaml", state.repositoryState, ["repository", "status"]],
    ["repository-health.yaml", state.repositoryHealth, ["repository", "health", "blockers"]],
    ["repository-topology.yaml", state.repositoryTopology, ["repository"]],
    ["engineering-gates.yaml", state.engineeringGates, ["repository", "gates"]],
    ["validation-baseline.yaml", state.validationBaseline, ["repository", "validations"]],
  ];

  for (const [file, document, required] of documents) {
    if (!isRecord(document)) {
      add(issues, file, "$", "must be a mapping");
      continue;
    }
    for (const field of required) {
      if (!(field in document)) add(issues, file, field, "is required");
    }
    validateUnknowns(document, file, "$", issues);
  }

  const identity = state.repositoryState?.repository;
  for (const [file, document] of documents.slice(1)) {
    if (typeof document.repository === "string" && document.repository !== identity) {
      add(issues, file, "repository", `must reference repository ${String(identity)}`);
    }
  }

  validateStringArray(state.repositoryHealth?.blockers, "repository-health.yaml", "blockers", issues);
  validateStringArray(state.validationBaseline?.validations, "validation-baseline.yaml", "validations", issues);

  if (!Array.isArray(state.engineeringGates?.gates)) {
    add(issues, "engineering-gates.yaml", "gates", "must be an array");
  } else {
    validateGates(state.engineeringGates.gates, issues);
  }

  return { valid: issues.length === 0, issues };
}

function validateGates(gates: EngineeringGate[], issues: ValidationIssue[]): void {
  const ids = new Set<string>();
  const allIds = new Set(gates.filter(isRecord).map((gate) => gate.id).filter((id): id is string => typeof id === "string"));
  const arrays = ["depends_on", "scope", "required_files", "constraints", "acceptance_criteria", "required_validations"] as const;

  gates.forEach((gate, index) => {
    const base = `gates[${index}]`;
    if (!isRecord(gate)) {
      add(issues, "engineering-gates.yaml", base, "must be a mapping");
      return;
    }
    for (const field of ["id", "goal", "status", ...arrays]) {
      if (!(field in gate)) add(issues, "engineering-gates.yaml", `${base}.${field}`, "is required");
    }
    if (typeof gate.id !== "string" || gate.id.length === 0) add(issues, "engineering-gates.yaml", `${base}.id`, "must be a non-empty string");
    else if (ids.has(gate.id)) add(issues, "engineering-gates.yaml", `${base}.id`, `duplicate gate identifier ${gate.id}`);
    else ids.add(gate.id);
    if (typeof gate.goal !== "string" || gate.goal.length === 0) add(issues, "engineering-gates.yaml", `${base}.goal`, "must be a non-empty string");
    if (typeof gate.status !== "string" || !statuses.has(gate.status)) add(issues, "engineering-gates.yaml", `${base}.status`, "must be completed, current, blocked, pending, or UNKNOWN");
    arrays.forEach((field) => validateStringArray(gate[field], "engineering-gates.yaml", `${base}.${field}`, issues));
    if (Array.isArray(gate.depends_on)) {
      gate.depends_on.forEach((reference, refIndex) => {
        if (typeof reference === "string" && !allIds.has(reference)) add(issues, "engineering-gates.yaml", `${base}.depends_on[${refIndex}]`, `references missing gate ${reference}`);
      });
    }
  });
}

function validateUnknowns(value: unknown, file: CanonicalFile, path: string, issues: ValidationIssue[]): void {
  if (value === null || value === undefined) {
    add(issues, file, path, 'unknown information must use the exact "UNKNOWN" sentinel');
  } else if (typeof value === "string" && /^(unknown|tbd|n\/a)$/i.test(value) && value !== "UNKNOWN") {
    add(issues, file, path, 'unknown information must use the exact "UNKNOWN" sentinel');
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => validateUnknowns(item, file, `${path}[${index}]`, issues));
  } else if (isRecord(value)) {
    Object.entries(value).forEach(([key, item]) => validateUnknowns(item, file, `${path}.${key}`, issues));
  }
}

function validateStringArray(value: unknown, file: CanonicalFile, path: string, issues: ValidationIssue[]): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) add(issues, file, path, "must be an array of strings");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function add(issues: ValidationIssue[], file: CanonicalFile, path: string, message: string): void {
  issues.push({ file, path, message });
}
