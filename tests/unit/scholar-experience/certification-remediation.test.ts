import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function source(route: string): string {
  return readFileSync(path.join(process.cwd(), "app", route, "page.tsx"), "utf8");
}

describe("Scholar OS certification remediation", () => {
  it.each(["goals", "athletic-path"])("implements the %s route contract", (route) => {
    const value = source(route);
    for (const required of [
      "Loading", "Empty", "Success", "Error", "Permission", "Offline",
      "Stale evidence", "Recovery", "role=\"status\"",
    ]) {
      expect(value).toContain(required);
    }
  });

  it("preserves Scholar confirmation and non-fabrication boundaries", () => {
    expect(source("goals")).toMatch(/yours to define, revise, or reject/i);
    expect(source("athletic-path")).toMatch(/only the Scholar can confirm/i);
    expect(source("athletic-path")).toMatch(/no\s+recruiting or eligibility conclusion will be fabricated/i);
  });
});
