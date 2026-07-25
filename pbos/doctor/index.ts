import { registerCheck, runDoctorChecks } from "./checks";

import { checkFilesystem } from "./filesystem";
import { checkRegistry } from "./registry";
import { checkRuntime } from "./runtime";

import { createDoctorReport } from "./report";

// Register built-in checks
registerCheck(checkFilesystem);
registerCheck(checkRegistry);
registerCheck(checkRuntime);

export function runDoctor() {
  const checks = runDoctorChecks();
  return createDoctorReport(checks);
}