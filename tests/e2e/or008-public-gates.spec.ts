import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const roleLabels = [
  "Scholar",
  "Scholar-Athlete",
  "Transition-Aged Youth",
  "Parent / Guardian",
  "Mentor",
  "Teacher / Educator",
  "High School Counselor",
  "High School Coach",
  "College Coach / Recruiter",
  "College Admissions",
  "Brand Partner",
  "Employer / Workforce Partner",
  "District / School Administrator",
  "Athlete Abroad",
];

test("role selection exposes all 14 public onboarding pathways", async ({ page }) => {
  await page.goto("/role-select");
  for (const label of roleLabels) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(page.locator('a[href*="/start?first=1&role="]')).toHaveCount(14);
});

test("new-user role links preserve role identity into onboarding", async ({ page }) => {
  await page.goto("/role-select");
  const scholar = page.locator('a[href="/start?first=1&role=scholar"]').first();
  await expect(scholar).toBeVisible();
  await scholar.click();
  await expect(page).toHaveURL(/\/start\?first=1&role=scholar/);
  await expect(page.getByText(/create the secure account/i)).toBeVisible();
});

test("protected OS and live messaging never substitute demo user data", async ({ page }) => {
  for (const route of ["/scholar-athlete-os", "/family-os", "/educator-os", "/university-os", "/messages", "/support-network"]) {
    await page.goto(route);
    await expect(page.getByText(/sign in/i).first()).toBeVisible();
    await expect(page.getByText(/Maya/i)).toHaveCount(0);
  }
});

test("invalid invitation token recovers through authentication", async ({ page }) => {
  await page.goto("/invite/or008-invalid-token");
  await expect(page.getByRole("button", { name: /accept invitation/i })).toBeVisible();
  await page.getByRole("button", { name: /accept invitation/i }).click();
  await expect(page).toHaveURL(/\/login\?invite=or008-invalid-token/);
});

test("role selection has no serious accessibility violations", async ({ page }) => {
  await page.goto("/role-select");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact || ""),
  )).toEqual([]);
});

test("critical public pages do not overflow the viewport", async ({ page }) => {
  for (const route of ["/", "/role-select", "/login?mode=signup&role=scholar"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow, `${route} should not overflow horizontally`).toBe(false);
  }
});
