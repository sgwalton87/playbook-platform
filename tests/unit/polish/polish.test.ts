import { describe, expect, it } from "vitest";
import { getPolishChecklist } from "@/lib/polish/polishStatus";
import PlaybookEmptyState from "@/components/system/PlaybookEmptyState";
import PlaybookLoading from "@/components/system/PlaybookLoading";
import PlaybookErrorState from "@/components/system/PlaybookErrorState";

describe("Beta 2.5 Polish", () => {
  it("returns polish checklist", () => {
    expect(getPolishChecklist().length).toBeGreaterThan(0);
  });

  it("system components are defined", () => {
    expect(PlaybookEmptyState).toBeTruthy();
    expect(PlaybookLoading).toBeTruthy();
    expect(PlaybookErrorState).toBeTruthy();
  });
});
