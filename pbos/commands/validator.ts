import { runRuntimeValidator } from "../validator";
import {
  Artifacts,
  Logger,
  Results,
  Runtime,
} from "../kernel";

export function runValidator() {
  const result = runRuntimeValidator();

  Runtime.save(Artifacts.validation, result);

  Logger.blank();
  Logger.section("PBOS Runtime Validator");

  for (const check of result.checks) {
    Logger.info(
      `${check.name.padEnd(24, ".")} ${check.status}`
    );
  }

  Logger.blank();
  Logger.info(`Validation: ${result.status}`);

  Logger.blank();
  Logger.info("Runtime model written:");
  Logger.info(Artifacts.validation);

  return Results.success(
    "validator",
    result,
    Artifacts.validation,
    "Runtime validation completed."
  );
}
