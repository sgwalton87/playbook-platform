import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RoleProfileEditor } from "@/components/profile/RoleProfileEditor";
const { from, router } = vi.hoisted(() => ({ from: vi.fn(), router: { replace: vi.fn(), push: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: { from, auth: { getUser: async () => ({ data: { user: { id: "fixture-owner" } } }) } } }));
let role = "athlete-abroad";
beforeEach(() => {
  vi.clearAllMocks();
  role = "athlete-abroad";
  from.mockImplementation(() => {
    const chain = { select: () => chain, eq: () => chain, single: async () => ({ data: {
      id: "fixture-owner", role, profile_mode: role, first_name: "Fixture", last_name: "Owner",
      onboarding_data: { first_name: "Fixture", primary_sport: "Basketball", position: "Point Guard", current_team: "Saved Club", target_major: "Biology" },
    }, error: null }) };
    return chain;
  });
});
afterEach(cleanup);
it("shows Athlete Abroad athletic and recruiting answers in its standard editor", async () => {
  render(<RoleProfileEditor />);
  expect(await screen.findByLabelText("Primary sport", { exact: true })).toHaveProperty("value", "Basketball");
  expect(screen.getByRole("combobox", { name: "Position" })).toHaveProperty("value", "Point Guard");
  expect(screen.getByLabelText("Current team / club", { exact: true })).toHaveProperty("value", "Saved Club");
  expect(screen.getByLabelText("Target major", { exact: true })).toHaveProperty("value", "Biology");
});
it("keeps Scholar-Athlete athletic fields in the dedicated editor", async () => {
  role = "scholar-athlete";
  render(<RoleProfileEditor mode="athlete" />);
  expect(await screen.findByLabelText("Primary sport", { exact: true })).toHaveProperty("value", "Basketball");
});
it("keeps Scholar-Athlete standard profile focused on its non-athlete steps", async () => {
  role = "scholar-athlete";
  render(<RoleProfileEditor />);
  await screen.findByLabelText("First name", { exact: true });
  expect(screen.queryByLabelText("Primary sport", { exact: true })).toBeNull();
});
