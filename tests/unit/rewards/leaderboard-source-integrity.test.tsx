import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  replace: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: { auth: { getUser: mocks.getUser } } }));
import LeaderboardPage from "@/app/leaderboard/page";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "fixture-owner" } }, error: null });
  mocks.fetch.mockResolvedValue(Response.json({ ok: true, xp: 125, balance: 35, items: [], redemptions: [] }));
  vi.stubGlobal("fetch", mocks.fetch);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("DYN-001 genuine rewards instead of invented leaderboard", () => {
  it("loads owner-scoped ledger totals and never invents a rank or other students", async () => {
    render(<LeaderboardPage />);
    await screen.findByText("125");
    expect(screen.getByText("35")).toBeTruthy();
    expect(screen.getByText("Rankings aren't published yet")).toBeTruthy();
    expect(screen.getByText("Not available")).toBeTruthy();
    expect(mocks.fetch).toHaveBeenCalledWith("/api/rewards/store", { cache: "no-store" });
    expect(screen.queryByText(/Jordan Miles|Aisha Thompson|Coach Taylor/)).toBeNull();
  });
  it("does not claim earned rewards when the service fails and supports retry", async () => {
    mocks.fetch.mockResolvedValueOnce(Response.json({ error: "Ledger offline" }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ ok: true, xp: 4, balance: 1 }));
    render(<LeaderboardPage />);
    await screen.findByText("Ledger offline");
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThanOrEqual(2);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByText("4");
    expect(screen.getByText("1")).toBeTruthy();
  });
  it("denies an unauthenticated user before requesting private rewards", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    render(<LeaderboardPage />);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
