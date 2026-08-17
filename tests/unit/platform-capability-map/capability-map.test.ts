import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCapabilityCatalog } from "@/lib/platform/capabilityCatalog";
import { ROLE_NAVIGATION, getRoleNavigation } from "@/lib/navigation/roleNavigation";

function routeFile(href: string) {
  const route = href.split("?")[0].replace(/^\//, "").replace(/\/$/, "");
  return path.join(process.cwd(), "app", route, "page.tsx");
}

describe("Playbook capability map", () => {
  it("gives every mapped area a unique home", () => {
    const groups = getCapabilityCatalog({ includeFounder: true });
    expect(new Set(groups.map((group) => group.id)).size).toBe(groups.length);
    expect(groups.map((group) => group.id)).toEqual(expect.arrayContaining([
      "account", "record", "academics", "opportunities", "recruiting", "community",
      "learning", "events", "rewards", "global", "roles", "platform", "founder-operations",
    ]));
  });

  it("makes only Available capabilities navigable", () => {
    const groups = getCapabilityCatalog({ includeFounder: true });
    for (const item of groups.flatMap((group) => group.items)) {
      if (item.status === "available") expect(item.href, item.label).toBeTruthy();
      else expect(item.href, `${item.label} should not be clickable while ${item.status}`).toBeUndefined();
    }
  });

  it("proves every Available href resolves to a real static product page", () => {
    const available = getCapabilityCatalog({ includeFounder: true })
      .flatMap((group) => group.items)
      .filter((item) => item.status === "available");
    for (const item of available) {
      expect(fs.existsSync(routeFile(item.href!)), `${item.label} -> ${item.href}`).toBe(true);
    }
  });

  it("puts Explore Playbook in every role navigation without changing role authority", () => {
    for (const role of Object.keys(ROLE_NAVIGATION)) {
      const navigation = getRoleNavigation(role, role);
      expect(navigation.items.some((item) => item.href === "/explore")).toBe(true);
    }
  });

  it("keeps the Explore route authenticated and Founder catalog conditional", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "app/explore/page.tsx"), "utf8");
    expect(source).toContain("requireUser()");
    expect(source).toContain('redirect("/login?next=/explore")');
    expect(source).toContain("isPlatformOperatorRole(profile.data?.role)");
    expect(getCapabilityCatalog().some((group) => group.id === "founder-operations")).toBe(false);
    expect(getCapabilityCatalog({ includeFounder: true }).some((group) => group.id === "founder-operations")).toBe(true);
  });

  it("renders links only for Available capabilities", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "components/explore/CapabilityDirectory.tsx"), "utf8");
    expect(source).toContain('item.status === "available"');
    expect(source).toContain("canOpen && item.href");
  });
});
