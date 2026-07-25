import { loadGates } from "../planner/load";
import { analyzeGates } from "../planner/analyze";
import {
  Artifacts,
  Logger,
  Results,
  Runtime,
} from "../kernel";

export function runPlanner() {
  const gates = loadGates();
  const analysis = analyzeGates(gates);

  const selected = analysis.eligible.sort(
    (a, b) => b.priority - a.priority
  )[0];

  const output = {
    selectedGate: selected ?? null,
    eligible: analysis.eligible.map(g => g.id),
    blocked: analysis.blocked.map(g => g.id),
  };

  Runtime.save(Artifacts.planning, output);

  Logger.blank();
  Logger.section("PBOS Planning Engine");

  if (selected) {
    Logger.keyValue("Selected Gate", selected.id);
    Logger.keyValue("Title", selected.title);
    Logger.keyValue("Priority", selected.priority);
  } else {
    Logger.info("No eligible gate found.");
  }

  Logger.blank();
  Logger.keyValue("Eligible", analysis.eligible.length);
  Logger.keyValue("Blocked", analysis.blocked.length);

  Logger.blank();
  Logger.info("Planning model written to:");
  Logger.info(Artifacts.planning);

  return Results.success(
    "planner",
    output,
    Artifacts.planning,
    "Planning completed."
  );
}
