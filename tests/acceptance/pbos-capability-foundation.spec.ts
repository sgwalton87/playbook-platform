import { expect, test } from "@playwright/test";

/**
 * First guarded PBOS V2 certification slice: public auth entry and private
 * feature-map gate. These checks DO NOT certify end-to-end auth or all 107
 * capabilities; those require isolated synthetic sign-in and persistence.
 */
test("Explore requires an authenticated user instead of exposing a protected catalog", async ({ page }) => {
  await page.goto("/explore");
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page).toHaveURL(/next=%2Fexplore|next=\/explore/);
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
});

test("Login and recovery entrypoints remain navigable and usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log In", exact: true })).toBeVisible();
  const reset = page.getByRole("link", { name: "Forgot your password?" });
  await expect(reset).toHaveAttribute("href", "/reset-password");
  await reset.click();
  await expect(page).toHaveURL(/\/reset-password(?:\?|$)/);
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  )).toBe(false);
});
