import type { DurableCapabilityControlPlane } from "../persistence";
import type { CapabilityOperationalMetrics } from "./types";

export function collectCapabilityOperationalMetrics(
  controlPlane: DurableCapabilityControlPlane
): CapabilityOperationalMetrics {
  const state = controlPlane.state();
  const health = controlPlane.health();
  const outcomes = state.activation_decisions.map(({ decision }) => decision);
  return {
    revision: health.revision,
    capability_inventory: health.capability_count,
    active_entitlements: health.active_entitlement_count,
    trusted_issuers: health.trusted_issuer_count,
    admission_total: outcomes.length,
    admission_allowed: outcomes.filter((value) => value === "ALLOW").length,
    admission_denied: outcomes.filter((value) => value === "DENY").length,
    admission_suspended: outcomes.filter((value) => value === "SUSPEND").length,
    admission_review_required: outcomes.filter(
      (value) => value === "REQUIRES_REVIEW"
    ).length,
    security_events: health.security_event_count,
    recovery_events: 0,
    state_digest: health.state_digest,
  };
}
