import { describe, expect, it } from "vitest";
import { authorizeRouteContext } from "@/lib/authorization/routeAuthorization";
import { getRoleNavigation, hasCanonicalRoleNavigation } from "@/lib/navigation/roleNavigation";
import { getRoleDestination, roleOptions } from "@/lib/role-os/roleRoutes";
import {
  PLAYBOOK_ROLES,
  PUBLIC_ONBOARDING_ROLES,
  type PlaybookRole,
} from "@/lib/roles/registry";

const EXPECTED_DESTINATIONS: Record<PlaybookRole, string> = {
  scholar: "/dashboard",
  "scholar-athlete": "/scholar-athlete-os",
  "transition-youth": "/dashboard",
  family: "/family-os",
  mentor: "/mentor-os",
  educator: "/educator-os",
  coach: "/educator-os",
  "college-coach": "/university-os",
  "college-admissions": "/university-os",
  "brand-partner": "/brand-partner-os",
  employer: "/employer-os",
  district: "/district-os",
  other: "/pending",
};

describe("Role OS routing", () => {
  it("resolves every supported role to its canonical destination", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(getRoleDestination(role)).toBe(EXPECTED_DESTINATIONS[role]);
      expect(roleOptions.find((option) => option.role === role)?.href).toBe(
        EXPECTED_DESTINATIONS[role],
      );
    }
  });

  it("exposes each supported role exactly once in deterministic registry order", () => {
    const optionRoles = roleOptions.map((option) => option.role);

    expect(optionRoles).toEqual(PUBLIC_ONBOARDING_ROLES);
    expect(optionRoles).toEqual(Object.keys(PLAYBOOK_ROLES));
    expect(new Set(optionRoles).size).toBe(optionRoles.length);
  });

  it("keeps role-restricted OS authorization fail-closed", () => {
    const identity = { id: "user-1" };

    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(
        authorizeRouteContext({
          identity,
          profile: { id: identity.id, role: "scholar" },
          allowedRoles: [role],
        }).authorized,
      ).toBe(role === "scholar");
    }
  });

  it("keeps canonical Role OS navigation aligned with role destinations", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(hasCanonicalRoleNavigation(role)).toBe(true);
      expect(getRoleNavigation(role).home).toBe(EXPECTED_DESTINATIONS[role]);
    }
  });
});
