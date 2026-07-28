import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import type { EngineState, GateDefinition, PbosConfig, PlannerResult } from "./types";
import { RuleEngine } from "./rules";
import {
  isGateStatus,
  isPlanningEligibleStatus,
} from "../lifecycle/status";

function isGateDefinition(value: unknown): value is GateDefinition {
  const gate = value as GateDefinition;
  return Boolean(
    gate &&
      typeof gate.id === "string" &&
      typeof gate.title === "string" &&
      isGateStatus(gate.status) &&
      typeof gate.priority === "number" &&
      Array.isArray(gate.dependencies) &&
      Array.isArray(gate.tasks) &&
      Array.isArray(gate.definition_of_done) &&
      Array.isArray(gate.validation) &&
      (typeof gate.next_gate === "string" || gate.next_gate === null),
  );
}

export async function loadGates(config: PbosConfig, rootDir = process.cwd()): Promise<GateDefinition[]> {
  const gatesDir = path.join(rootDir, config.gatesDirectory);
  let entries: string[];

  try {
    entries = await readdir(gatesDir);
  } catch (error) {
    throw new Error(`PBOS gate directory could not be read: ${config.gatesDirectory}. ${error instanceof Error ? error.message : String(error)}`);
  }

  const gateFiles = entries.filter((entry) => entry.endsWith(".json")).sort();
  if (gateFiles.length === 0) {
    throw new Error(`No PBOS gate files found in ${config.gatesDirectory}. Add at least one structured gate definition.`);
  }

  const gates = await Promise.all(
    gateFiles.map(async (fileName) => {
      const raw = await readFile(path.join(gatesDir, fileName), "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (!isGateDefinition(parsed)) {
        throw new Error(`Invalid PBOS gate definition: ${fileName}`);
      }
      return parsed;
    }),
  );

  return gates;
}

export function selectNextGate(gates: GateDefinition[], config: PbosConfig, state: EngineState): PlannerResult {
  const completedGateIds = gates.filter((gate) => gate.status === "complete").map((gate) => gate.id);
  const completed = new Set(completedGateIds);
  const blockedGates = gates
    .map((gate) => ({ gate, missingDependencies: gate.dependencies.filter((dependency) => !completed.has(dependency)) }))
    .filter(({ gate, missingDependencies }) => gate.status !== "complete" && missingDependencies.length > 0);
  const eligibleGates = gates
    .filter((gate) => isPlanningEligibleStatus(gate.status))
    .filter((gate) => gate.dependencies.every((dependency) => completed.has(dependency)))
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

  const ruleResults = new RuleEngine().evaluate({ config, gates, state, eligibleGates, blockedGates });
  const selectedGate = eligibleGates[0] ?? null;

  return { selectedGate, eligibleGates, blockedGates, completedGateIds, ruleResults };
}
