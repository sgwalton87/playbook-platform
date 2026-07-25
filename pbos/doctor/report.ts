import type { DoctorCheck, DoctorReport } from "./types";

export function createDoctorReport(
  checks: DoctorCheck[]
): DoctorReport {
  const healthy = checks.every(
    c => c.status === "PASS"
  );

  return {
    status: healthy ? "HEALTHY" : "UNHEALTHY",
    generatedAt: new Date().toISOString(),
    checks,
  };
}
