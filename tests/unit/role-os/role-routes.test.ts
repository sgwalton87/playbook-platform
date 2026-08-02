import { describe, expect, it } from "vitest";
import { getRoleDestination, roleOptions } from "@/lib/role-os/roleRoutes";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";

describe("Role OS routing", () => {
  it("routes family users to Family OS", () => {
    expect(getRoleDestination("family")).toBe("/family-os");
  });

  it("exposes every completed public onboarding pathway", () => {
    const optionRoles = roleOptions.map((option) => option.role);

    expect(optionRoles).toEqual(PUBLIC_ONBOARDING_ROLES);
    expect(new Set(optionRoles).size).toBe(optionRoles.length);
  });
});
