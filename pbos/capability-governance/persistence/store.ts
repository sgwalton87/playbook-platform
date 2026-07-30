import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { canonicalJson } from "../../kernel/identity";
import { controlPlaneStateDigest } from "./identity";
import type { CapabilityControlPlaneState } from "./types";
import { validateCapabilityControlPlaneState } from "./validator";

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasControlPlaneShape(
  value: unknown
): value is CapabilityControlPlaneState {
  if (!isObject(value)) {
    return false;
  }
  return (
    typeof value.schema_version === "string" &&
    typeof value.authority === "string" &&
    typeof value.revision === "number" &&
    typeof value.updated_at === "string" &&
    Array.isArray(value.capabilities) &&
    Array.isArray(value.capability_transitions) &&
    Array.isArray(value.entitlements) &&
    Array.isArray(value.issuers) &&
    Array.isArray(value.revocations) &&
    Array.isArray(value.activation_decisions) &&
    Array.isArray(value.evidence) &&
    Array.isArray(value.events) &&
    typeof value.state_digest === "string"
  );
}

function decodeState(value: unknown): CapabilityControlPlaneState {
  if (!hasControlPlaneShape(value)) {
    throw new Error("Capability control-plane state structure is invalid.");
  }
  let errors: readonly string[];
  try {
    errors = validateCapabilityControlPlaneState(value);
  } catch {
    throw new Error("Capability control-plane state is structurally invalid.");
  }
  if (errors.length > 0) {
    throw new Error(
      `Capability control-plane state validation failed: ${errors.join(" ")}`
    );
  }
  return value;
}

function cloneState(
  state: CapabilityControlPlaneState
): CapabilityControlPlaneState {
  return structuredClone(state);
}

function stateWithDigest(
  content: Omit<CapabilityControlPlaneState, "state_digest">
): CapabilityControlPlaneState {
  return { ...content, state_digest: controlPlaneStateDigest(content) };
}

export class CapabilityControlPlaneStore {
  readonly #path: string;
  readonly #lockPath: string;

  constructor(path: string) {
    this.#path = path;
    this.#lockPath = `${path}.lock`;
  }

  exists(): boolean {
    return existsSync(this.#path);
  }

  initialize(timestamp: string): CapabilityControlPlaneState {
    return this.withLock(() => {
      if (existsSync(this.#path)) {
        throw new Error("Capability control-plane state already exists.");
      }
      const state = stateWithDigest({
        schema_version: "1.0.0",
        authority: "PBOS_CAPABILITY_CONTROL_PLANE",
        revision: 0,
        updated_at: timestamp,
        capabilities: [],
        capability_transitions: [],
        entitlements: [],
        issuers: [],
        revocations: [],
        activation_decisions: [],
        evidence: [],
        events: [],
      });
      this.atomicWrite(state);
      return cloneState(state);
    });
  }

  load(): CapabilityControlPlaneState {
    if (!existsSync(this.#path)) {
      throw new Error("Capability control-plane state does not exist.");
    }
    const parsed: unknown = JSON.parse(readFileSync(this.#path, "utf8"));
    return cloneState(decodeState(parsed));
  }

  commit(
    expectedRevision: number,
    mutate: (
      current: CapabilityControlPlaneState
    ) => CapabilityControlPlaneState
  ): CapabilityControlPlaneState {
    return this.withLock(() => {
      const current = this.load();
      if (current.revision !== expectedRevision) {
        throw new Error(
          `Capability control-plane revision conflict: expected ${expectedRevision}, current ${current.revision}.`
        );
      }
      const next = mutate(current);
      const errors = validateCapabilityControlPlaneState(next);
      if (errors.length > 0) {
        throw new Error(
          `Capability control-plane mutation rejected: ${errors.join(" ")}`
        );
      }
      if (next.revision !== current.revision + 1) {
        throw new Error(
          "Capability control-plane mutation must advance exactly one revision."
        );
      }
      this.atomicWrite(next);
      return cloneState(next);
    });
  }

  private withLock<T>(operation: () => T): T {
    mkdirSync(dirname(this.#path), { recursive: true });
    let lock: number;
    try {
      lock = openSync(this.#lockPath, "wx", 0o600);
    } catch {
      throw new Error(
        "Capability control-plane write lock is unavailable; ownership is ambiguous."
      );
    }
    try {
      return operation();
    } finally {
      closeSync(lock);
      unlinkSync(this.#lockPath);
    }
  }

  private atomicWrite(state: CapabilityControlPlaneState): void {
    const temporaryPath = `${this.#path}.${process.pid}.${randomUUID()}.tmp`;
    const file = openSync(temporaryPath, "wx", 0o600);
    try {
      writeFileSync(file, `${canonicalJson(state, 2)}\n`, "utf8");
      fsyncSync(file);
    } finally {
      closeSync(file);
    }
    renameSync(temporaryPath, this.#path);
    const directory = openSync(dirname(this.#path), "r");
    try {
      fsyncSync(directory);
    } finally {
      closeSync(directory);
    }
  }
}

export function createEmptyCapabilityControlPlaneState(
  timestamp: string
): CapabilityControlPlaneState {
  return stateWithDigest({
    schema_version: "1.0.0",
    authority: "PBOS_CAPABILITY_CONTROL_PLANE",
    revision: 0,
    updated_at: timestamp,
    capabilities: [],
    capability_transitions: [],
    entitlements: [],
    issuers: [],
    revocations: [],
    activation_decisions: [],
    evidence: [],
    events: [],
  });
}
