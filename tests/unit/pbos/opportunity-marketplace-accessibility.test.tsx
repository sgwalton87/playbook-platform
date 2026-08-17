/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import OpportunityMarketplace from "../../../components/opportunity-marketplace/OpportunityMarketplace";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("opportunity marketplace accessibility", () => {
  it("announces real Marketplace and PBOS readiness state with named controls", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/marketplace/opportunities")) {
        return new Response(JSON.stringify({ opportunities: [] }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ matches: [{ id: "match-1", opportunityId: "stem",
        title: "STEM Scholarship", type: "scholarship", description: "A readiness pathway", score: 88,
        reasons: ["Skill match: research"], nextSteps: ["Add project evidence"], status: "RECOMMENDED", deliveryState: "DELIVERED" }] }),
        { status: 200, headers: { "content-type": "application/json" } });
    }));

    render(<OpportunityMarketplace />);
    expect(await screen.findByRole("heading", { name: "STEM Scholarship" })).toBeTruthy();

    const statuses = screen.getAllByRole("status").map((node) => node.textContent || "");
    expect(statuses.some((value) => value.includes("No published Marketplace opportunities yet"))).toBe(true);
    expect(statuses.some((value) => value.includes("PBOS readiness guidance loaded"))).toBe(true);

    expect(screen.getByRole("button", { name: "Save guidance" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("navigation", { name: "Marketplace listing types" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Readiness guidance views" })).toBeTruthy();
    expect(screen.getByText("Not a real listing.")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Start Application Workspace/i })).toBeNull();
  });
});
