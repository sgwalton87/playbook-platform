import { describe, expect, it } from "vitest";
import { getRoleNavigation, normalizeNavigationRole } from "@/lib/navigation/roleNavigation";

describe("Canonical role navigation", () => {
  it.each(["admin", "founder"])("keeps %s verification review in desktop and mobile primary navigation", role => {
    const nav = getRoleNavigation("brand-partner", role);
    expect(nav.home).toBe(role === "founder" ? "/founder" : "/admin");
    expect(nav.items[0]).toMatchObject({ href: "/admin", label: "Verification Review" });
    expect(nav.items.some(item => item.href === "/profile")).toBe(true);
  });
  it("does not treat a user-selected profile mode as reviewer authority", () => {
    expect(getRoleNavigation("admin", "brand-partner").items.some(item => item.href === "/admin")).toBe(false);
    expect(getRoleNavigation("founder", "scholar").items.some(item => item.href === "/admin")).toBe(false);
  });
  it("routes stored underscore role aliases to their correct OS", () => {
    expect(getRoleNavigation(null, "scholar_athlete").home).toBe("/scholar-athlete-os");
    expect(getRoleNavigation(null, "athlete-abroad").home).toBe("/athlete-abroad-os");
    expect(getRoleNavigation(null, "college-coach").home).toBe("/recruiting-os");
  });
  it("never exposes Scholar or other role navigation for unknown identities", () => {
    expect(normalizeNavigationRole("unknown_role")).toBeNull();
    expect(getRoleNavigation("unknown_role").home).toBe("/start");
    expect(getRoleNavigation("unknown_role").items.some((item) => item.href === "/dashboard")).toBe(false);
    expect(getRoleNavigation().home).toBe("/start");
  });
});
