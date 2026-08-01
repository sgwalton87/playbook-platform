import { test, expect } from "@playwright/test";

test.describe("role OS surfaces", () => {
  test("notifications route loads", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.locator("h1")).toContainText("Authorized changes");
  });

  test("role selection route loads", async ({ page }) => {
    await page.goto("/role-select");
    await expect(page.locator("h1")).toContainText("One platform");
  });
});
