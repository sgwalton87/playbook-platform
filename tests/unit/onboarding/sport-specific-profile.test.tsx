import React, { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SportPositionField from "@/components/profile/SportPositionField";
import { SPORT_CONFIG, SPORT_OPTIONS } from "@/lib/onboarding/sports";
import { createInitialOnboardingData, getOnboardingSteps, mapOnboardingToProfilePayload } from "@/lib/onboarding";

afterEach(cleanup);
function Field({ sport, initial = "" }: { sport: string; initial?: string }) {
  const [value, setValue] = useState(initial);
  return <SportPositionField sport={sport} value={value} onChange={setValue} />;
}
it.each([
  ["Basketball", "Position", "Point Guard", "Quarterback"],
  ["Football", "Position", "Quarterback", "Libero"],
  ["Volleyball", "Position", "Libero", "Point Guard"],
  ["Swimming", "Event", "100m Butterfly", "Quarterback"],
  ["Track & Field", "Event", "Long Jump", "Libero"],
  ["Wrestling", "Weight class", "106 lbs", "Quarterback"],
  ["Dance", "Style", "Ballet", "Quarterback"],
])("restores the %s menu with its own label and choices", (sport, label, expected, unrelated) => {
  render(<Field sport={sport} />);
  expect(screen.getByRole("combobox", { name: label })).toBeTruthy();
  expect(screen.getByRole("option", { name: expected })).toBeTruthy();
  expect(screen.queryByRole("option", { name: unrelated })).toBeNull();
});
it("retains a saved custom position and lets the Scholar select a standard position", () => {
  render(<Field sport="Basketball" initial="Combo guard" />);
  expect(screen.getByRole("textbox", { name: "Your position" })).toHaveProperty("value", "Combo guard");
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "Point Guard" } });
  expect(screen.getByRole("combobox")).toHaveProperty("value", "Point Guard");
  expect(screen.queryByRole("textbox")).toBeNull();
});
it("supports a custom entry without persisting a UI sentinel", () => {
  render(<Field sport="Football" />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "__custom__" } });
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Long Snapper" } });
  expect(screen.getByRole("textbox")).toHaveProperty("value", "Long Snapper");
});
it("preserves legacy athlete answers through hydration and the governed payload mapping", () => {
  const form = createInitialOnboardingData({ sport: "Volleyball", position: "Libero", onboarding_data: { key_stats_honors: "Team captain" } });
  expect(form.primary_sport).toBe("Volleyball"); expect(form.position).toBe("Libero");
  const payload = mapOnboardingToProfilePayload({ userId: "owner", role: "scholar-athlete", data: form, stepIndex: 3, complete: false });
  expect(payload.onboarding_data).toMatchObject({ primary_sport: "Volleyball", position: "Libero", key_stats_honors: "Team captain" });
  expect(createInitialOnboardingData({ sport: "Football", position: "Quarterback", onboarding_data: { primary_sport: "Basketball", position: "Combo guard" } })).toMatchObject({ primary_sport: "Basketball", position: "Combo guard" });
});
it("keeps all 17 recovered sports in the canonical athlete flow", () => {
  expect(SPORT_OPTIONS).toHaveLength(17);
  const fields = getOnboardingSteps("scholar-athlete").find(step => step.id === "athlete-profile")!.fields;
  expect(fields.find(field => field.key === "primary_sport")!.options).toEqual(SPORT_OPTIONS);
  expect(fields.find(field => field.key === "position")!.type).toBe("sport-position");
  for (const sport of SPORT_OPTIONS.filter(sport => sport !== "Other")) expect(SPORT_CONFIG[sport].options.length).toBeGreaterThan(0);
});
it("keeps Other open to custom sports and positions", () => {
  render(<Field sport="Other" initial="Adaptive event" />);
  expect(screen.getByRole("textbox")).toHaveProperty("value", "Adaptive event");
});
