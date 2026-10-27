import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VerifiedRoleActivationBridge from "@/components/role-os/VerifiedRoleActivationBridge";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), getUser: vi.fn(), maybeSingle: vi.fn(), fetch: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: {
  auth: { getUser: mocks.getUser },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) }),
} }));
vi.mock("@/components/role-os/dashboards/RoleDashboardExperience", () => ({ default: () => <p>Approved dashboard</p> }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "synthetic" } }, error: null });
  mocks.fetch.mockResolvedValue(Response.json({ request: null }));
  vi.stubGlobal("fetch", mocks.fetch);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const show = () => render(<VerifiedRoleActivationBridge role="educator" roleOS="educator"
  verificationEndpoint="/api/educator-verification"><p>Private educator verification</p></VerifiedRoleActivationBridge>);

describe("verification dashboard role entry boundary", () => {
  it("redirects another role without rendering or fetching educator verification", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { role: "family", profile_mode: "family", onboarding_completed: true }, error: null });
    show();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/family-os"));
    expect(screen.queryByText("Private educator verification")).toBeNull();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("requires completed onboarding before mounting role verification", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { role: "educator", profile_mode: "educator", onboarding_completed: false }, error: null });
    show();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/start?first=1&role=educator"));
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("preserves the matching role's unapproved verification experience", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { role: "educator", profile_mode: "educator", onboarding_completed: true }, error: null });
    show();
    expect(await screen.findByText("Private educator verification")).toBeTruthy();
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledWith("/api/educator-verification", { cache: "no-store" }));
    expect(screen.queryByText("Approved dashboard")).toBeNull();
  });
});
