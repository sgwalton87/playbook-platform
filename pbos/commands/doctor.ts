import { runDoctor } from "../doctor";

import {
  Artifacts,
  Logger,
  Results,
  Runtime,
} from "../kernel";

export function runDoctorCommand() {
  Logger.blank();
  Logger.section("PBOS Doctor");

  const report = runDoctor();

  for (const check of report.checks) {
    Logger.keyValue(
      check.name,
      check.status
    );
  }

  Logger.blank();

  Logger.keyValue(
    "Overall",
    report.status
  );

  Runtime.save(
    Artifacts.doctor,
    report
  );

  Logger.blank();

  Logger.info("Doctor report written:");
  Logger.info(Artifacts.doctor);

  return Results.success(
    "doctor",
    report,
    Artifacts.doctor,
    "Doctor completed."
  );
}
