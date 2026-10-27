import { expect, type Page } from "@playwright/test";
import type { OnboardingField, OnboardingValue } from "@/lib/onboarding/types";

/** Enter disposable values through real widgets; never send supporter invitations. */
export async function fillOnboardingField(page: Page, field: OnboardingField, unique: string): Promise<OnboardingValue> {
  if (field.type === "safety-agreement") {
    await page.getByRole("checkbox", { name: field.label, exact: true }).check();
    return true;
  }
  if (field.type === "multi-select") {
    const selected = (field.options ?? []).slice(0, 2);
    expect(selected.length).toBeGreaterThan(0);
    const group = page.getByText(field.label, { exact: true }).locator("..");
    for (const option of selected) await group.getByRole("button", { name: option, exact: true }).click();
    return selected;
  }
  if (field.type === "select") {
    const value = field.options?.[0];
    if (!value) throw Error(`Missing options: ${field.key}`);
    await page.getByRole("combobox", { name: field.label, exact: true }).selectOption(value);
    return value;
  }
  if (field.type === "sport-position") {
    // The configured primary-sport fixture chooses Basketball.
    await page.getByLabel("Position", { exact: true }).selectOption("Point Guard");
    return "Point Guard";
  }
  if (field.type === "college-list" || field.type === "invite-list") {
    const values = field.type === "college-list"
      ? ["Stanford University", "Princeton University"]
      : ["planning-one@example.com", "planning-two@example.com"];
    for (const [index, value] of values.entries()) {
      await page.getByPlaceholder(`${index + 1}. ${field.placeholder}`, { exact: true }).fill(value);
    }
    return values;
  }
  if (field.type === "activity-list") {
    const entry = { activity: "Service learning", category: "Service", hours: "15", supervisor: "QA Advisor", description: "Disposable community tutoring record" };
    await page.getByLabel("Activity", { exact: true }).fill(entry.activity);
    await page.getByLabel("Category", { exact: true }).selectOption(entry.category);
    await page.getByLabel("Hours", { exact: true }).fill(entry.hours);
    await page.getByLabel("Mentor / Supervisor", { exact: true }).fill(entry.supervisor);
    await page.getByLabel("Description", { exact: true }).fill(entry.description);
    await page.getByRole("button", { name: "Add Entry", exact: true }).click();
    return [entry];
  }
  const values: Record<string, string> = {
    first_name: "Journey", last_name: "Example", date_of_birth: "2000-01-15",
    username: `qa${unique}`, gpa: "3.4", graduation_year: "2027", height: "6 ft", weight: "160",
    school: "Disposable QA Academy", school_district: "Oakland Unified School District",
    dream_school: "Stanford University", college_name: "Stanford University",
    ideal_profession: "Software Engineer", direct_phone: "202-555-0100",
    organization_website: "https://example.com", highlight_link: "https://example.com/highlights",
    child_invite_code: "", // No relationship or authority is requested by this fixture.
  };
  const value = values[field.key] ?? (field.key.includes("email")
    ? "disposable@example.com" : `QA ${field.key.replaceAll("_", " ")}`);
  await page.getByLabel(field.label, { exact: true }).fill(value);
  return value;
}
