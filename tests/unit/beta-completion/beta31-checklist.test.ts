import { describe, expect, it } from "vitest";
import {
  getBeta31CompletionChecklist,
  getBeta31CompletionStatus,
} from "@/lib/beta-completion";

describe("Beta 3.1 Completion Checklist", () => {
  it("returns completion checklist", () => {
    expect(getBeta31CompletionChecklist().length).toBeGreaterThan(0);
  });

  it("returns complete status", () => {
    expect(getBeta31CompletionStatus().percent).toBe(100);
  });
});
