import { describe, expect, it } from "vitest";
import { isPublicRoute, shouldUseAppShell } from "@/lib/app-shell";

describe("Unified App Shell", () => {
  it("keeps public pages outside shell", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/about")).toBe(true);
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/reset-password")).toBe(true);
    expect(isPublicRoute("/auth/callback")).toBe(true);
    expect(isPublicRoute("/invite/example-token")).toBe(true);
  });

  it("wraps internal pages with shell", () => {
    expect(shouldUseAppShell("/dashboard")).toBe(true);
    expect(shouldUseAppShell("/messages")).toBe(true);
    expect(shouldUseAppShell("/scholar-athlete-os")).toBe(true);
    expect(shouldUseAppShell("/opportunity-toolkit")).toBe(true);
    expect(shouldUseAppShell("/store-v2")).toBe(true);
  });

  it("does not nest the product shell around the dedicated Studio shell", () => {
    expect(shouldUseAppShell("/studio")).toBe(false);
    expect(shouldUseAppShell("/studio/oracle")).toBe(false);
  });
});
