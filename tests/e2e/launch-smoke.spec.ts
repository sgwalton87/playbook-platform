import { test, expect } from "@playwright/test";

test.describe("Playbook Launch Smoke", () => {

  test("public landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Playbook/i);
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("role selection route loads", async ({ page }) => {
    await page.goto("/role-select");

    await expect(page).toHaveURL(/role-select/);
  });

});
