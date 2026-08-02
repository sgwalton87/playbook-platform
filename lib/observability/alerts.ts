export type AlertSeverity = "critical" | "high" | "medium";

export interface OperationalAlert {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly signal: string;
  readonly condition: string;
  readonly evaluationWindow: string;
  readonly owner: string;
  readonly runbook: string;
}

export const OPERATIONAL_ALERTS: readonly OperationalAlert[] = [
  { id: "ALERT-APP-UNAVAILABLE", severity: "critical", signal: "synthetic.availability", condition: "Two consecutive readiness or public landing failures", evaluationWindow: "5m", owner: "Platform Reliability", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#critical-sev-1" },
  { id: "ALERT-DATABASE-UNAVAILABLE", severity: "critical", signal: "database_query_failure_total", condition: "Five failures and more than 50% of database operations fail", evaluationWindow: "5m", owner: "Database Operations", runbook: "docs/OPERATIONS/RECOVERY_RUNBOOK.md#database-recovery" },
  { id: "ALERT-AUTH-OUTAGE", severity: "critical", signal: "auth_failure_total", condition: "Failure rate exceeds 50% with at least 20 attempts", evaluationWindow: "10m", owner: "Identity and Access", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#critical-sev-1" },
  { id: "ALERT-SECURITY-FAILURE", severity: "critical", signal: "database_authorization_failure_total", condition: "Any confirmed unauthorized data access or privilege escalation", evaluationWindow: "immediate", owner: "Security Incident Response", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#critical-sev-1" },
  { id: "ALERT-ERROR-SURGE", severity: "critical", signal: "api_error_total", condition: "Error rate exceeds 20% and is three times the trailing baseline", evaluationWindow: "10m", owner: "Platform Reliability", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#critical-sev-1" },
  { id: "ALERT-API-DEGRADATION", severity: "high", signal: "api_latency_ms", condition: "p95 exceeds 1500ms or error rate exceeds 5%", evaluationWindow: "15m", owner: "Platform Reliability", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#high-sev-2" },
  { id: "ALERT-EMAIL-DELIVERY", severity: "high", signal: "delivery_failure_total", condition: "Failure rate exceeds 10% with at least 10 attempts", evaluationWindow: "15m", owner: "Communications Operations", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#high-sev-2" },
  { id: "ALERT-NOTIFICATION-FAILURE", severity: "high", signal: "notification_total", condition: "Materialization or delivery backlog exceeds 100 or oldest item exceeds 15m", evaluationWindow: "15m", owner: "Communications Operations", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#high-sev-2" },
  { id: "ALERT-ONBOARDING-SPIKE", severity: "high", signal: "onboarding_completion_total", condition: "Completion success falls below 80% with at least 10 attempts", evaluationWindow: "30m", owner: "Scholar OS Operations", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#high-sev-2" },
  { id: "ALERT-ABNORMAL-USAGE", severity: "medium", signal: "api_rate_limit_total", condition: "Rate-limit events exceed five times the trailing baseline", evaluationWindow: "30m", owner: "Security Operations", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#medium-sev-3" },
  { id: "ALERT-WORKFLOW-FAILURE", severity: "medium", signal: "workflow.failure", condition: "A governed workflow fails ten times for the same operation", evaluationWindow: "30m", owner: "Domain Operations", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#medium-sev-3" },
  { id: "ALERT-PERFORMANCE-DEGRADATION", severity: "medium", signal: "web_vitals", condition: "p75 LCP exceeds 2.5s or INP exceeds 200ms", evaluationWindow: "1h", owner: "Experience Reliability", runbook: "docs/OPERATIONS/PBOS_OPERATIONAL_OWNERSHIP_001.md#medium-sev-3" },
] as const;

export function validateOperationalAlerts(alerts: readonly OperationalAlert[] = OPERATIONAL_ALERTS): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const alert of alerts) {
    if (!/^ALERT-[A-Z0-9-]+$/.test(alert.id) || ids.has(alert.id)) errors.push(`Invalid or duplicate alert identifier: ${alert.id}`);
    ids.add(alert.id);
    if (!alert.signal || !alert.condition || !alert.evaluationWindow || !alert.owner || !alert.runbook) errors.push(`${alert.id} has an incomplete operational contract.`);
  }
  for (const severity of ["critical", "high", "medium"] as const) {
    if (!alerts.some((alert) => alert.severity === severity)) errors.push(`No ${severity} alerts are defined.`);
  }
  return errors;
}
