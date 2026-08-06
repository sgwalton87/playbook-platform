import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("responsive Playbook login composition", () => {
  it("stacks before the form and brand columns can clip the headline", () => {
    const page = readFileSync(join(process.cwd(), "app/login/page.tsx"), "utf8");
    const styles = readFileSync(join(process.cwd(), "app/login/login.css"), "utf8");

    expect(page).toContain('className="playbook-login-card"');
    expect(page).toContain('className="playbook-login-title"');
    expect(styles).toContain("@media (max-width: 900px)");
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(styles).toContain("font-size: clamp(44px, 5vw, 68px)");
  });
});
