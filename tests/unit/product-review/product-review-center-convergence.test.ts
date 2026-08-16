import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("canonical product review center", () => {
  it("keeps the onboarding registry at exactly 15 canonical roles", () => {
    const registry = read("lib/roles/registry.ts");
    const roleEntries = registry.match(/onboarding: true/g) || [];

    expect(roleEntries).toHaveLength(15);
    expect(registry).toContain('other: { label: "Community Partner"');
    expect(registry).toContain('"college-admissions": { label: "College Admissions"');
  });

  it("derives role previews from the canonical roleOptions source", () => {
    const preview = read("app/preview/page.tsx");

    expect(preview).toContain('import { roleOptions } from "@/lib/role-os/roleRoutes"');
    expect(preview).toContain("roleOptions.map");
    expect(preview).toContain("{roleOptions.length} canonical roles");
    expect(preview).not.toContain("Fourteen current onboarding pathways");
  });

  it("does not present the legacy university compatibility route as a separate OS", () => {
    const preview = read("app/preview/page.tsx");
    const compatibility = read("app/university-os/page.tsx");

    expect(preview).not.toContain('["University OS", "/university-os"');
    expect(preview).toContain("College Admissions is reviewed at");
    expect(compatibility).toContain('redirect("/admissions-os")');
  });

  it("provides explicit Community Partner product copy", () => {
    const routes = read("lib/role-os/roleRoutes.ts");

    expect(routes).toContain('other: "Connect community services and trusted support without inheriting Scholar-data authority."');
  });
});
