import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("Playbook UI recovery foundation", () => {
  it("uses the approved local Scholar visual for public authentication states", () => {
    const manifest = source("lib/brand-story/visualManifest.ts");
    expect(manifest).toContain('/brand/scholar-dashboard/scholar-future-hero-v1.png');
    expect(manifest.match(/scholar-future-hero-v1\.png/g)).toHaveLength(3);
    expect(manifest.match(/login:\s*\{[^}]+\}/)?.[0]).not.toMatch(/images\.unsplash\.com/);
    expect(manifest.match(/signup:\s*\{[^}]+\}/)?.[0]).not.toMatch(/images\.unsplash\.com/);
  });

  it("binds every active authentication and onboarding entry surface to PGDS-001", () => {
    ["app/login/page.tsx", "app/check-email/page.tsx", "app/reset-password/page.tsx",
      "app/pending/page.tsx", "app/start/page.tsx", "components/role-os/RoleSelect.tsx"].forEach((path) => {
      expect(source(path), path).toMatch(/PGDS-001|CanonicalAuthShell/);
    });
  });

  it("keeps the legacy landing copy prohibited", () => {
    const landing = source("app/page.tsx");
    expect(landing).not.toMatch(/Build your next play|Track school, sports, goals/i);
  });
});
