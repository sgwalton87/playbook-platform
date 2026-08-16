import { describe, expect, it } from "vitest";
import { getRoleDestination, roleOptions } from "@/lib/role-os/roleRoutes";

describe("Role OS routing", () => {
  it("routes family users to Family OS", () => {
    expect(getRoleDestination("family")).toBe("/family-os");
  });

  it("does not collapse distinct role operating systems onto shared fallbacks", () => {
    const destinations = roleOptions.map((option) => option.href);
    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("exposes every completed public onboarding pathway", () => {
    expect(roleOptions.length).toBe(15);
    expect(roleOptions.map((option) => option.role)).toContain("scholar-athlete");
    expect(roleOptions.map((option) => option.role)).toContain("college-admissions");
    expect(roleOptions.map((option) => option.role)).toContain("high-school-counselor");
    expect(roleOptions.map((option) => option.role)).toContain("district");
    expect(roleOptions.map((option) => option.role)).toContain("employer");
    expect(roleOptions.map((option) => option.role)).toContain("athlete-abroad");
    expect(roleOptions.map((option) => option.role)).toContain("other");
    expect(getRoleDestination("other")).toBe("/community-partner-os");
  });
});
