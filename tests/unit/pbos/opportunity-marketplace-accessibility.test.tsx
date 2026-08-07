/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import OpportunityMarketplace from "../../../components/opportunity-marketplace/OpportunityMarketplace";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("opportunity marketplace accessibility", () => {
  it("announces state and exposes named opportunity controls", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ matches: [{ id: "match-1", opportunityId: "stem",
      title: "STEM Scholarship", type: "scholarship", description: "A verified pathway", score: 88,
      reasons: ["Skill match: research"], nextSteps: ["Add project evidence"], status: "RECOMMENDED", deliveryState: "DELIVERED" }] }),
      { status: 200, headers: { "content-type": "application/json" } })));
    render(<OpportunityMarketplace />);
    expect(await screen.findByRole("heading", { name: "STEM Scholarship" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Opportunity matches loaded");
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("navigation", { name: "Opportunity views" })).toBeTruthy();
  });
});
