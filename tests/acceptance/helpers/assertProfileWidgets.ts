import { expect, type Page } from "@playwright/test";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import type { OnboardingData } from "@/lib/onboarding/types";
import type { PlaybookRole } from "@/lib/roles/registry";

/** Verify rendered owner controls, separately from durable database assertions. */
export async function assertProfileWidgets(page: Page, role: PlaybookRole, answers: OnboardingData) {
  const athleteSteps = new Set(["athlete-profile", "athlete-recruiting"]);
  let checked = 0;
  for (const mode of role === "scholar-athlete" ? ["standard", "athlete"] : ["standard"]) {
    await page.goto(mode === "athlete" ? "/profile/athlete" : "/profile");
    await page.reload();
    for (const step of getOnboardingSteps(role)) {
      if (role === "scholar-athlete" && athleteSteps.has(step.id) !== (mode === "athlete")) continue;
      for (const field of step.fields) {
        if (field.type === "safety-agreement" || answers[field.key] === undefined) continue;
        const value = answers[field.key];
        const section = page.getByRole("heading", { name: step.title, exact: true }).locator("..");
        if (field.type === "multi-select") {
          const group = section.getByText(field.label, { exact: true }).locator("..");
          for (const option of field.options ?? []) {
            await expect(group.getByRole("checkbox", { name: option, exact: true })).toBeChecked({ checked: Array.isArray(value) && value.includes(option) });
          }
        } else if (field.type === "college-list" || field.type === "invite-list") {
          if (!Array.isArray(value)) throw Error("List fixture is not an array");
          for (const [index, entry] of value.entries()) {
            await expect(section.getByLabel(`${index + 1}. ${field.type === "college-list" ? "College" : "Contact email"}`, { exact: true })).toHaveValue(String(entry));
          }
        } else if (field.type === "activity-list") {
          if (!Array.isArray(value)) throw Error("Activity fixture is not an array");
          for (const [index, entry] of value.entries()) {
            if (!entry || typeof entry !== "object") throw Error("Expected structured activity fixture");
            const row = section.getByRole("group", { name: `Activity ${index + 1} · saved with your profile`, exact: true });
            for (const [key, label] of Object.entries({ activity: "Activity", category: "Category", hours: "Hours", supervisor: "Mentor / Supervisor", description: "Description" })) {
              await expect(row.getByLabel(label, { exact: true })).toHaveValue(String(entry[key as keyof typeof entry]));
            }
          }
        } else if (field.type === "sport-position") {
          await expect(section.getByRole("combobox", { name: "Position", exact: true })).toHaveValue(String(value));
        } else {
          await expect(section.locator(`[id="${field.key}"]`)).toHaveValue(String(value));
        }
        checked++;
      }
    }
  }
  console.log(`[profile-widget-confirmation] Verified ${role}: ${checked} rendered fields after return login and reload`);
}
