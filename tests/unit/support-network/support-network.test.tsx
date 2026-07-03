import { describe, expect, it } from "vitest";
import { getSupportNetwork } from "@/lib/support-network";
import SupportNetworkMap from "@/components/support-network/SupportNetworkMap";

describe("Support Network Map", () => {
  it("returns seven support nodes", () => {
    expect(getSupportNetwork().nodes.length).toBe(7);
  });

  it("component is defined", () => {
    expect(SupportNetworkMap).toBeTruthy();
  });
});
