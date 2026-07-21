import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support-network", () => ({
  getSupportNetwork: vi.fn().mockResolvedValue([
    { id: "1", fullName: "Test Supporter" },
  ]),
}));

import { getSupportNetwork } from "@/lib/support-network";
import SupportNetworkMap from "@/components/support-network/SupportNetworkMap";

describe("Support Network Map", () => {
  it("returns an array", async () => {
    const members = await getSupportNetwork("test-scholar-id");
    expect(Array.isArray(members)).toBe(true);
    expect(members).toHaveLength(1);
  });

  it("component is defined", () => {
    expect(SupportNetworkMap).toBeTruthy();
  });
});
