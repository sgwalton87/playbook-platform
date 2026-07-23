import { describe, expect, it } from "vitest";
import { getAllRoleOS, getRoleOS } from "@/lib/role-os";
import RoleOSDashboard from "@/components/role-os/RoleOSDashboard";

describe("Multi-Role Playbook OS", () => {
  it("returns all role operating systems", () => {
    expect(getAllRoleOS()).toHaveLength(14);
    expect(new Set(getAllRoleOS().map((os) => os.role)).size).toBe(14);
  });

  it("returns Family OS", () => {
    const family = getRoleOS("family");
    expect(family.title).toBe("Family OS");
  });

  it("component is defined", () => {
    expect(RoleOSDashboard).toBeTruthy();
  });
});
