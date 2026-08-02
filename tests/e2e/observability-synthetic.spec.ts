import { expect, test } from "@playwright/test";
import { GOVERNED_SCHOLAR_SYNTHETIC } from "../../lib/observability/synthetics";

const scholarEmail = process.env.TEST_SCHOLAR_EMAIL;
const scholarPassword = process.env.TEST_SCHOLAR_PASSWORD;

test("public synthetic health path emits correlation identifiers", async ({ page }) => {
  const response = await page.goto(GOVERNED_SCHOLAR_SYNTHETIC[0].route);
  expect(response?.ok()).toBe(true);
  expect(response?.headers()["x-request-id"]).toBeTruthy();
  expect(response?.headers()["x-correlation-id"]).toBeTruthy();
  await page.goto("/login");
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
});

test("seeded Scholar synthetic traverses dashboard, record, and portfolio", async ({ page }) => {
  test.skip(!scholarEmail || !scholarPassword, "Seeded Scholar credentials are required for operational synthetic certification.");
  await page.goto("/login");
  await page.getByLabel("Email").fill(scholarEmail!);
  await page.getByLabel("Password").fill(scholarPassword!);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(/dashboard/);
  for (const step of GOVERNED_SCHOLAR_SYNTHETIC.filter(({ authentication }) => authentication === "scholar")) {
    const response = await page.goto(step.route);
    expect(response?.ok(), `${step.id} should be available`).toBe(true);
    expect(response?.headers()["x-correlation-id"], `${step.id} should be correlated`).toBeTruthy();
  }
});
