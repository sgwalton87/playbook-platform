import { planConstitutionalGate } from "../planner";
import { Artifacts, Logger, Results } from "../kernel";

export async function runPlanner(rootDir = process.cwd()) {
  const report = await planConstitutionalGate({ rootDir });

  Logger.blank();
  Logger.section("PBOS Constitutional Planning Engine");
  Logger.keyValue(
    "Selected Gate",
    report.selectedGate?.id ?? "none"
  );
  Logger.keyValue("Eligible", report.eligibleGates.length);
  Logger.keyValue("Blocked", report.blockedGates.length);
  Logger.info(`Authority: constitutional-planner`);
  Logger.info(`Planning model written to: ${Artifacts.planning}`);

  return Results.success(
    "planner",
    report,
    Artifacts.planning,
    report.reasonSelected
  );
}
