import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AthleteAbroadOSLayout from "@/app/athlete-abroad-os/layout";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), getUser: vi.fn(), maybeSingle: vi.fn(), fetch: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }), usePathname: () => "/athlete-abroad-os" }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: {
  auth: { getUser: mocks.getUser },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) }),
} }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "synthetic" } }, error: null });
  vi.stubGlobal("fetch", mocks.fetch);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const show = () => render(<AthleteAbroadOSLayout><p>Approved global workspace</p></AthleteAbroadOSLayout>);
const ownProfile = () => mocks.maybeSingle.mockResolvedValue({ data: {
  role: "athlete-abroad", profile_mode: "athlete-abroad", onboarding_completed: true,
}, error: null });
const review = (readiness: string, jurisdiction: string) => Response.json({ onboardingCompleted: true, review: {
  review_status: readiness, jurisdiction_scope_status: jurisdiction,
  destination_regions: ["Europe"], passport_readiness: "ready", eligibility_context: "reviewed",
} });

describe("Athlete Abroad route layout sequencing", () => {
  it("reproduces District wrong-route entry and redirects before readiness can hide identity checks", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { role: "district", profile_mode: "district", onboarding_completed: true }, error: null });
    show();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/district-os"));
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(screen.queryByText("Approved global workspace")).toBeNull();
  });
  it.each([["pending", "approved"], ["approved", "pending"], ["rejected", "approved"]])(
    "keeps workspace locked for readiness=%s and jurisdiction=%s", async (readiness, jurisdiction) => {
      ownProfile(); mocks.fetch.mockResolvedValue(review(readiness, jurisdiction)); show();
      await screen.findByText(readiness === "rejected" ? "Global readiness needs attention" : "Global readiness is pending");
      expect(screen.queryByText("Approved global workspace")).toBeNull();
    });
  it("preserves access only after both independent readiness approvals", async () => {
    ownProfile(); mocks.fetch.mockResolvedValue(review("approved", "approved")); show();
    expect(await screen.findByText("Approved global workspace")).toBeTruthy();
  });
});
