import { expect, test } from "@playwright/test";

test("public landing page is reachable", async ({ page }) => {
  const response = await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  expect(response).not.toBeNull();
  expect(response?.status()).toBeGreaterThanOrEqual(200);
  expect(response?.status()).toBeLessThan(500);

  await expect(page).toHaveTitle(/./);
});
