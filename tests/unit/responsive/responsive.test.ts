import { describe, expect, it } from "vitest";
import {
  getMobileStackStyle,
  getResponsiveGrid,
  getResponsiveShell,
  responsiveBreakpoints,
} from "@/lib/responsive";

describe("Responsive utilities", () => {
  it("has breakpoints", () => {
    expect(responsiveBreakpoints.mobile).toBe(640);
  });

  it("builds responsive grid", () => {
    expect(getResponsiveGrid(300).display).toBe("grid");
  });

  it("builds shell", () => {
    expect(getResponsiveShell().maxWidth).toBe(1180);
  });

  it("builds mobile stack", () => {
    expect(getMobileStackStyle().display).toBe("flex");
  });
});
