import { expect, test } from "@playwright/test";

const scholarEmail = process.env.TEST_SCHOLAR_EMAIL;
const scholarPassword = process.env.TEST_SCHOLAR_PASSWORD;
test.skip(!scholarEmail || !scholarPassword, "Seeded Supabase Scholar credentials are required.");

test("authenticated direct Role OS access is denied for the wrong canonical role", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(scholarEmail!);
  await page.getByLabel("Password").fill(scholarPassword!);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(/dashboard/);
  await page.goto("/educator-os");
  await expect(page.getByRole("heading", { name: "Permission required" })).toBeVisible();
});

test("authenticated Scholar can open the Evidence Center directly", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(scholarEmail!);
  await page.getByLabel("Password").fill(scholarPassword!);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(/dashboard/);
  await page.goto("/evidence");
  await expect(page.getByRole("heading", { name: "Trusted evidence, with its history attached." })).toBeVisible();
});
