import { describe, expect, it } from "vitest";
import {
  buildCompassNetworkRecommendations,
  buildNetworkIntelligence,
  getDemoNetworkIntelligence,
} from "@/lib/network-intelligence";
import NetworkIntelligenceDashboard from "@/components/network-intelligence/NetworkIntelligenceDashboard";

describe("Network Intelligence", () => {
  it("builds network intelligence", () => {
    const result = buildNetworkIntelligence({
      relationships: [{ relationship: "mentor" }],
      actions: [{ title: "Upload docs", assigned_role: "family", status: "open" }],
    });

    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("builds compass network recommendations", () => {
    const intelligence = getDemoNetworkIntelligence();
    const recs = buildCompassNetworkRecommendations({ role: "family", intelligence });

    expect(recs.length).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(NetworkIntelligenceDashboard).toBeTruthy();
  });
});
