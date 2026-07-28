import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isGateStatus } from "../lifecycle/status";
import type { GateDefinition } from "./types";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isGateDefinition(value: unknown): value is GateDefinition {
  const gate = value as GateDefinition;
  return Boolean(
    gate &&
      typeof gate.id === "string" &&
      typeof gate.title === "string" &&
      typeof gate.description === "string" &&
      isGateStatus(gate.status) &&
      Number.isFinite(gate.priority) &&
      Number.isInteger(gate.lifecycle_stage) &&
      gate.lifecycle_stage >= 0 &&
      isStringArray(gate.dependencies) &&
      isStringArray(gate.produces) &&
      isStringArray(gate.requires) &&
      isStringArray(gate.blocking_conditions) &&
      (gate.completion_state === "pending" ||
        gate.completion_state === "satisfied") &&
      isStringArray(gate.handbook_refs) &&
      isStringArray(gate.tasks) &&
      isStringArray(gate.definition_of_done) &&
      isStringArray(gate.validation) &&
      (typeof gate.next_gate === "string" || gate.next_gate === null)
  );
}

export function loadConstitutionalGates(
  rootDir = process.cwd(),
  gatesDirectory = "pbos/gates"
): GateDefinition[] {
  const directory = join(rootDir, gatesDirectory);
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    throw new Error(`No PBOS gate definitions found in ${gatesDirectory}.`);
  }

  return files.map((file) => {
    const path = join(directory, file);
    const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
    if (!isGateDefinition(parsed)) {
      throw new Error(
        `Invalid constitutional gate metadata: ${gatesDirectory}/${file}`
      );
    }
    return parsed;
  });
}

export const loadGates = loadConstitutionalGates;
