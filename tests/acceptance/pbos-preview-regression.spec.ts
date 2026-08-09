import { expect, test } from "@playwright/test";

test("role preview authority and Compass evidence are honest", async ({ page }) => {
  await page.goto("/scholar-athlete-os");
  await expect(page.locator('[data-testid="scholar-athlete-os"][data-visual-canon="PGSA-001"]')).toBeVisible();
  await expect(page.getByText("Scholar-Athlete OS", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Scholar OS", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/maya/i)).toHaveCount(0);

  await page.goto("/compass");
  await expect(page.getByText(/No verified course evidence is connected yet|No sample record has been substituted/i)).toBeVisible();
  await expect(page.getByText("60%", { exact: true })).toHaveCount(0);
});

test("public newsfeed opens without authentication", async ({ page }) => {
  await page.goto("/news");
  await expect(page).toHaveURL(/\/news$/);
  await expect(page.locator('[data-testid="public-newsfeed"][data-visual-canon="PGNF-001"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: /Real progress. Public stories/i })).toBeVisible();
  await expect(page.getByText(/Loading published|No community stories|From the Playbook community/i).first()).toBeVisible();
  await expect(page.getByText(/public feed is temporarily unavailable/i)).toHaveCount(0);
});
