import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PLAYBOOK_ROLES, PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";

describe("role dashboard guided experience contract", () => {
  const source = readFileSync(resolve(process.cwd(), "components/guided/RoleJourneyDashboard.tsx"), "utf8");
  const shell = readFileSync(resolve(process.cwd(), "components/shell/UnifiedAppShell.tsx"), "utf8");
  const css = readFileSync(resolve(process.cwd(), "styles/playbook-tokens.css"), "utf8");
  it("provides five distinct guided screens to all fifteen public roles", () => {
    expect(PUBLIC_ONBOARDING_ROLES).toHaveLength(15);
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(source).toMatch(new RegExp('(?:^|\\n)\\s*' + (role.includes("-") ? '"' + role + '"' : role) + ':\\s*\\[', "m"));
      expect(PLAYBOOK_ROLES[role].osRoute).toMatch(/^\//);
    }
    expect(source).toContain('aria-label="Your five next plays"');
    expect(source).toContain("STEP {index+1}");
    expect(source).toContain("Exploring steps does not mark tasks complete");
  });
  it("mounts on the canonical role dashboard without repeating the scholar-athlete carousel", () => {
    expect(shell).toContain("pathname === PLAYBOOK_ROLES[journeyRole].osRoute");
    expect(shell).toContain("<RoleJourneyDashboard role={journeyRole} />");
    const athlete = readFileSync(resolve(process.cwd(), "components/scholar-athlete/ScholarAthleteDashboard.tsx"), "utf8");
    expect(athlete).not.toContain("<ScholarJourneyModules />");
  });
  it("puts mobile navigation in normal page flow instead of overlaying forms", () => {
    const nav = css.slice(css.indexOf("  .playbook-mobile-bottom-nav {"), css.indexOf("  .playbook-mobile-bottom-nav a {"));
    expect(nav).toContain("position: relative;");
    expect(nav).not.toContain("position: fixed;");
  });
});
