import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/founder/page.tsx", "utf8");
const layout = readFileSync("app/founder/layout.tsx", "utf8");

const capabilities = [
  "Project Intelligence",
  "Analytics",
  "User Management",
  "Verification",
  "Moderation",
  "Feature Flags",
  "Bug Tracking",
  "Release Management",
  "Architecture Viewer",
  "Documentation Center",
  "Content Review",
  "System Health",
] as const;

describe("Phase 14 Founder Dashboard convergence", () => {
  it("exposes all canonical Founder Dashboard capabilities", () => {
    for (const capability of capabilities) expect(page).toContain(`label: \"${capability}\"`);
    expect(page).toContain("data-phase-14-capabilities={founderCapabilities.length}");
  });

  it("keeps Founder access behind server-enforced platform-operator authority", () => {
    expect(layout).toContain("requirePlatformOperator");
    expect(layout).toContain('redirect("/login?next=/founder")');
    expect(layout).toContain('redirect("/")');
  });

  it("composes canonical operator surfaces instead of shadow data stores", () => {
    for (const route of ["/studio", "/studio/beta-34-audit", "/analytics", "/admin", "/admin/moderation"]) {
      expect(page).toContain(`href: \"${route}\"`);
    }
    expect(page).toContain("Founder visibility does not create founder-owned copies of platform data.");
    expect(page).not.toContain('value="Not connected"');
    expect(page).not.toContain("founder_users");
    expect(page).not.toContain("founder_analytics");
  });
});
