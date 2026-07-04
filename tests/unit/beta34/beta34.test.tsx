import { describe, expect, it } from "vitest";
import { getBeta34Pillars, getBeta34Status } from "@/lib/beta34";
import Beta34Dashboard from "@/components/beta34/Beta34Dashboard";

describe("Beta 3.4 Guided Experience + Gamification Economy", () => {
  it("returns pillars", () => {
    expect(getBeta34Pillars()).toContain("Persistent coin ledger");
  });

  it("returns phase status", () => {
    expect(getBeta34Status().phase).toBe("Playbook OS Beta 3.4");
  });

  it("component is defined", () => {
    expect(Beta34Dashboard).toBeTruthy();
  });
});
