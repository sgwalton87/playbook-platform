import { Runtime, Artifacts } from "../kernel";
import type { DoctorCheck } from "./types";

export function checkRuntime(): DoctorCheck {
  const artifacts = [
    Artifacts.repository,
    Artifacts.planning,
    Artifacts.validation,
    Artifacts.execution,
    Artifacts.workflow,
  ];

  const missing = artifacts.filter(path => !Runtime.exists(path));

  return {
    id: "runtime",
    name: "Runtime Artifacts",
    status: missing.length === 0 ? "PASS" : "FAIL",
    message:
      missing.length === 0
        ? "All runtime artifacts present."
        : `Missing ${missing.length} runtime artifact(s).`,
  };
}
