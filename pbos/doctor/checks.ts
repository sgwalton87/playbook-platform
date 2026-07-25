import type { DoctorCheck } from "./types";

export type DoctorCheckRunner = () => DoctorCheck;

const checks: DoctorCheckRunner[] = [];

export function registerCheck(check: DoctorCheckRunner) {
  checks.push(check);
}

export function runDoctorChecks(): DoctorCheck[] {
  return checks.map(check => check());
}
