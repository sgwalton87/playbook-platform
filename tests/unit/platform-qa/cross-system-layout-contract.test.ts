import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("shared Playbook mobile layout contracts", () => {
  const source = readFileSync(resolve(process.cwd(), "components/ui/PlaybookPage.tsx"), "utf8");
  it("allows long role and marketplace titles to wrap inside the viewport", () => {
    expect(source).toContain('overflowWrap: "anywhere"');
    expect(source).toContain('maxWidth: "100%"');
  });
  it("reserves mobile bottom-navigation and device safe-area clearance", () => {
    expect(source).toContain("calc(180px + env(safe-area-inset-bottom))");
  });
});
