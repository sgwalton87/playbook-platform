import { describe, expect, it } from "vitest";
import { getRoleDestination, roleOptions } from "@/lib/role-os/roleRoutes";

describe("Role OS routing", () => {
  it("routes family users to Family OS", () => {
    expect(getRoleDestination("family")).toBe("/family-os");
  });

  it("exposes every completed public onboarding pathway", () => {
    expect(roleOptions.length).toBe(10);
    expect(roleOptions.map((option) => option.role)).toContain("scholar-athlete");
    expect(roleOptions.map((option) => option.role)).toContain("college-admissions");
  });
});
