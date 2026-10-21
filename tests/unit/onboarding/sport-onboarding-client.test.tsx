import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import StartPage from "@/app/start/page";
const { from, replace, upsert } = vi.hoisted(() => ({ from: vi.fn(), replace: vi.fn(), upsert: vi.fn() }));
vi.mock("next/navigation", () => { const router = { replace }; return { useRouter: () => router, useSearchParams: () => ({ get: (key: string) => key === "role" ? "scholar-athlete" : key === "first" ? "1" : null }) }; });
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@/components/brand/PlaybookLogo", () => ({ default: () => null }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: { from, auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) } } }));
vi.mock("@/lib/onboarding", async importOriginal => {
 const actual = await importOriginal<typeof import("@/lib/onboarding")>();
 return { ...actual, getOnboardingSteps: (role: string) => actual.getOnboardingSteps(role).filter(step => step.id === "athlete-profile") };
});
let profile: Record<string, unknown>;
beforeEach(() => {
 vi.clearAllMocks();
 profile = { id: "owner", role: "scholar-athlete", profile_mode: "scholar-athlete", full_name: "Fixture Scholar", sport: "Basketball", position: "Point Guard", onboarding_data: {} };
 from.mockImplementation((table: string) => {
  const chain = { select: () => chain, eq: () => chain, in: async () => ({ data: [], error: null }), maybeSingle: async () => ({ data: profile, error: null }), upsert: async (value: Record<string, unknown>) => { upsert(table, value); if (table === "profiles") profile = { ...profile, ...value }; return { error: null }; } };
  return chain;
 });
 vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Missing protected server configuration: PBOS_API_URL" }) }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("clears an incompatible position only on an explicit sport change", async () => {
 render(<StartPage />);
 const sport = await screen.findByRole("combobox", { name: "Primary sport" });
 expect(screen.getByRole("combobox", { name: "Position" })).toHaveProperty("value", "Point Guard");
 fireEvent.change(sport, { target: { value: "Volleyball" } });
 expect(screen.getByRole("combobox", { name: "Position" })).toHaveProperty("value", "");
 expect(screen.getByRole("option", { name: "Libero" })).toBeTruthy();
 expect(screen.queryByRole("option", { name: "Point Guard" })).toBeNull();
});
it("keeps saved athlete answers after blocked activation and restores them on reload", async () => {
 const first = render(<StartPage />);
 fireEvent.change(await screen.findByRole("combobox", { name: "Primary sport" }), { target: { value: "Volleyball" } });
 fireEvent.change(screen.getByRole("combobox", { name: "Position" }), { target: { value: "Libero" } });
 fireEvent.click(screen.getByRole("button", { name: "Finish + Create Profile" }));
 expect(await screen.findByRole("alert")).toHaveProperty("textContent", expect.stringContaining("Your profile answers are saved, but profile activation could not finish."));
 expect(screen.getByRole("status").textContent).toContain("Progress saved");
 expect(replace).not.toHaveBeenCalled();
 expect(upsert).toHaveBeenCalledWith("profiles", expect.objectContaining({ onboarding_data: expect.objectContaining({ primary_sport: "Volleyball", position: "Libero" }) }));
 expect(upsert).toHaveBeenCalledWith("athlete_profiles", expect.objectContaining({ sport: "Volleyball", position: "Libero" }));
 first.unmount(); render(<StartPage />);
 expect(await screen.findByRole("combobox", { name: "Primary sport" })).toHaveProperty("value", "Volleyball");
 expect(screen.getByRole("combobox", { name: "Position" })).toHaveProperty("value", "Libero");
});
