import { RuleEngine } from "./rules";
import type {
  EngineState,
  GateDefinition,
  PbosConfig,
  RuleResult,
} from "./types";
import { loadConstitutionalGates } from "../planner/load";
import type { ConstitutionalPlanningReport } from "../planner/types";

/** @deprecated Gate selection belongs exclusively to pbos/planner. */
export async function loadGates(
  config: PbosConfig,
  rootDir = process.cwd()
): Promise<GateDefinition[]> {
  return loadConstitutionalGates(rootDir, config.gatesDirectory);
}

/** Support-only rules evaluate a constitutional decision and never select. */
export function evaluatePlanningRules(options: {
  gates: GateDefinition[];
  config: PbosConfig;
  state: EngineState;
  plan: ConstitutionalPlanningReport;
}): RuleResult[] {
  const gatesById = new Map(
    options.gates.map((gate) => [gate.id, gate])
  );
  const eligibleGates = options.plan.eligibleGates
    .map((gateId) => gatesById.get(gateId))
    .filter((gate): gate is GateDefinition => Boolean(gate));
  const blockedGates = options.plan.blockedGates
    .map(({ gateId, incompleteDependencies }) => {
      const gate = gatesById.get(gateId);
      return gate ? { gate, missingDependencies: incompleteDependencies } : null;
    })
    .filter(
      (
        entry
      ): entry is {
        gate: GateDefinition;
        missingDependencies: string[];
      } => Boolean(entry)
    );

  return new RuleEngine().evaluate({
    config: options.config,
    gates: options.gates,
    state: options.state,
    eligibleGates,
    blockedGates,
  });
}
