import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPlatformOperatorRole } from "@/lib/auth/platformOperator";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Founder and shell authority audit", () => {
  it("uses the same founder/admin operator role contract as the database predicate", () => {
    expect(isPlatformOperatorRole("founder")).toBe(true);
    expect(isPlatformOperatorRole("admin")).toBe(true);
    expect(isPlatformOperatorRole("super_admin")).toBe(false);
    expect(isPlatformOperatorRole("scholar")).toBe(false);
  });

  it("server-gates Founder and the entire Studio route tree", () => {
    expect(read("app/founder/layout.tsx")).toContain("requirePlatformOperator()");
    expect(read("app/studio/layout.tsx")).toContain("requirePlatformOperator()");
  });

  it("does not let the URL impersonate another role navigation", () => {
    const shell = read("components/shell/UnifiedAppShell.tsx");
    expect(shell).not.toContain("ROUTE_ROLE_PREVIEWS");
    expect(shell).not.toContain("previewRole");
    expect(shell).toContain("getRoleNavigation(profile?.profile_mode, profile?.role)");
    expect(shell).toContain("isPlatformOperatorRole(profile?.role)");
  });

  it("does not fabricate Founder or Studio operational health", () => {
    const founder = read("app/founder/page.tsx");
    const studio = read("lib/studio/studioStatus.ts");
    expect(founder).not.toContain('value="Green"');
    expect(founder).not.toContain('value="Active"');
    expect(studio).not.toContain('build: "Green"');
    expect(studio).not.toContain('sentinel: "Healthy"');
    expect(studio).toContain('build: "Not connected"');
  });
});
