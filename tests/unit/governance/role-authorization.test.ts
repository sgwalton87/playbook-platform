import { describe, expect, it } from "vitest";
import { authorizeRole, type GovernedResource } from "@/lib/governance";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";

describe("OR-008 role authorization contract", () => {
  it.each(PUBLIC_ONBOARDING_ROLES)(
    "denies %s access to founder administration by default",
    (role) => {
      expect(authorizeRole({
        role,
        resource: "founder_admin",
        action: "manage",
      })).toBe(false);
    },
  );

  it.each(PUBLIC_ONBOARDING_ROLES)(
    "requires ownership to update the %s profile",
    (role) => {
      expect(authorizeRole({
        role,
        resource: "own_profile",
        action: "update",
        context: { isOwner: false },
      })).toBe(false);
      expect(authorizeRole({
        role,
        resource: "own_profile",
        action: "update",
        context: { isOwner: true },
      })).toBe(true);
    },
  );

  it("requires an active relationship for support-role messaging", () => {
    for (const role of ["family", "mentor", "educator", "counselor", "coach"] as const) {
      expect(authorizeRole({ role, resource: "messages", action: "message" })).toBe(false);
      expect(authorizeRole({
        role,
        resource: "messages",
        action: "message",
        context: { hasActiveRelationship: true },
      })).toBe(true);
    }
  });

  it("requires explicit learner sharing in addition to institutional scope", () => {
    for (const role of ["educator", "counselor", "coach"] as const) {
      expect(authorizeRole({
        role,
        resource: "learner_record",
        action: "read",
        context: { institutionalScope: true },
      })).toBe(false);
      expect(authorizeRole({
        role,
        resource: "learner_record",
        action: "read",
        context: { institutionalScope: true, hasExplicitShare: true },
      })).toBe(true);
    }
  });

  it("never exposes an individual learner record through district aggregate scope", () => {
    expect(authorizeRole({
      role: "district",
      resource: "learner_record",
      action: "read",
      context: { institutionalScope: true },
    })).toBe(false);
    expect(authorizeRole({
      role: "district",
      resource: "system_equity",
      action: "read",
      context: { institutionalScope: true },
    })).toBe(true);
  });

  it.each([
    "learner_record",
    "support_network",
    "messages",
    "academic_readiness",
    "cohort",
    "opportunities",
    "institutional_outreach",
    "system_equity",
  ] as GovernedResource[])(
    "defaults to deny for Other on %s",
    (resource) => {
      expect(authorizeRole({ role: "other", resource, action: "read" })).toBe(false);
    },
  );
});
