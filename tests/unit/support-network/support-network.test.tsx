import { describe, expect, it } from "vitest";
import { getSupportNetwork } from "@/lib/support-network";
import LiveSupportRelationships from "@/components/support-network/LiveSupportRelationships";
import SupportNetworkMap from "@/components/support-network/SupportNetworkMap";

describe("Support Network", () => {
  it("preserves the seven-node orientation map", () => {
    expect(getSupportNetwork().nodes.length).toBe(7);
  });

  it("keeps the visual map and canonical live panel as distinct components", () => {
    expect(SupportNetworkMap).toBeTruthy();
    expect(LiveSupportRelationships).toBeTruthy();
  });
});
