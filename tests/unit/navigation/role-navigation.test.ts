import { describe, expect, it } from "vitest";
import { ROLE_NAVIGATION, getRoleNavigation } from "@/lib/navigation";
import { PLAYBOOK_ROLES } from "@/lib/roles/registry";

describe("role-aware navigation", () => {
  it("keeps every signed-in home aligned with the canonical OS registry", () => {
    for (const [role, definition] of Object.entries(PLAYBOOK_ROLES)) {
      expect(
        getRoleNavigation(role).home,
        `${role} navigation must use its canonical OS`,
      ).toBe(definition.osRoute);
    }
  });

  it("gives every canonical role an explicit navigation definition", () => {
    expect(Object.keys(ROLE_NAVIGATION).sort()).toEqual(
      Object.keys(PLAYBOOK_ROLES).sort(),
    );
  });
});
