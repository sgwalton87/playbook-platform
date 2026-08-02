#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { OPERATIONAL_ALERTS, validateOperationalAlerts } from "../lib/observability/alerts";
import { validateSyntheticJourney } from "../lib/observability/synthetics";

const requiredArtifacts = [
  "instrumentation.ts",
  "instrumentation-client.ts",
  "app/global-error.tsx",
  "app/api/telemetry/client/route.ts",
  "app/api/health/live/route.ts",
  "app/api/health/ready/route.ts",
  "app/api/health/metrics/route.ts",
  "docs/OPERATIONS/PBOS_OBSERVABILITY_ARCHITECTURE_001.md",
  "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md",
  "docs/REVIEWS/PBOS_OBSERVABILITY_IMPLEMENTATION_REPORT_001.md",
  "pbos/evidence/observability/README.md",
  "pbos/evidence/observability/implementation-evidence.json",
  "pbos/evidence/observability/logging-evidence.json",
  "pbos/evidence/observability/alert-definitions.json",
  "pbos/evidence/observability/monitoring-evidence.json",
  "pbos/evidence/observability/readiness-evidence.json",
] as const;

const errors = [
  ...validateOperationalAlerts(),
  ...validateSyntheticJourney(),
  ...requiredArtifacts.filter((path) => !existsSync(resolve(process.cwd(), path))).map((path) => `Missing observability artifact: ${path}`),
];

if (errors.length === 0) {
  const implementation = JSON.parse(readFileSync(resolve(process.cwd(), "pbos/evidence/observability/implementation-evidence.json"), "utf8")) as Record<string, unknown>;
  const loggingSource = readFileSync(resolve(process.cwd(), "pbos/evidence/observability/logging-evidence.json"), "utf8");
  const alerts = JSON.parse(readFileSync(resolve(process.cwd(), "pbos/evidence/observability/alert-definitions.json"), "utf8")) as { alerts?: Array<{ id?: string }> };
  const monitoring = JSON.parse(readFileSync(resolve(process.cwd(), "pbos/evidence/observability/monitoring-evidence.json"), "utf8")) as Record<string, unknown>;
  if (implementation.production_certified !== false || monitoring.production_certified !== false) errors.push("Local observability evidence must not claim production certification.");
  if (/(?:bearer\s+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|"(?:password|token|secret)"\s*:\s*"(?!\[REDACTED\]))/i.test(loggingSource)) errors.push("Retained logging evidence contains sensitive data.");
  const retainedAlertIds = alerts.alerts?.map(({ id }) => id) ?? [];
  const canonicalAlertIds = OPERATIONAL_ALERTS.map(({ id }) => id);
  if (JSON.stringify(retainedAlertIds) !== JSON.stringify(canonicalAlertIds)) errors.push("Retained alert evidence is out of sync with canonical alert definitions.");
}

if (errors.length > 0) {
  errors.forEach((error) => console.error(`ERROR ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Observability foundation contract passed with ${requiredArtifacts.length} retained artifacts.`);
  console.log("Operational certification remains pending deployed export, alert test, authenticated synthetic, and retained production telemetry evidence.");
}
