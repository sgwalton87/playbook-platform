import { describe, expect, it } from "vitest";
import { playbookTheme } from "@/lib/design-system/tokens";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookHero,
  PlaybookMetric,
  PlaybookPage,
} from "@/components/ui";

describe("Playbook Unified Experience", () => {
  it("has design tokens", () => {
    expect(playbookTheme.colors.orange).toBe("#C2410C");
    expect(playbookTheme.colors.orangeOnDark).toBe("#FDBA74");
  });

  it("has shared primitives", () => {
    expect(PlaybookPage).toBeTruthy();
    expect(PlaybookHero).toBeTruthy();
    expect(PlaybookCard).toBeTruthy();
    expect(PlaybookMetric).toBeTruthy();
    expect(PlaybookButton).toBeTruthy();
  });
});
