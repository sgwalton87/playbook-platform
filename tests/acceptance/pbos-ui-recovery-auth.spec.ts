import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { id: "login", path: "/login", heading: /Run your Playbook/i },
  { id: "signup", path: "/login?mode=signup", heading: /Choose your path/i },
  { id: "check-email", path: "/check-email?email=scholar%40example.com&role=scholar", heading: /Confirmation sent/i },
  { id: "reset-password", path: "/reset-password", heading: /Choose a new password/i },
  { id: "role-select", path: "/role-select", heading: /One platform/i },
] as const;

const roleOperatingSystems = [
  { id: "family-os", path: "/family-os", heading: "Family OS" },
  { id: "mentor-os", path: "/mentor-os", heading: "Mentor OS" },
  { id: "educator-os", path: "/educator-os", heading: "Educator OS" },
  { id: "employer-os", path: "/employer-os", heading: "Employer OS" },
  { id: "university-os", path: "/university-os", heading: "University OS" },
  { id: "district-os", path: "/district-os", heading: "District OS" },
] as const;

for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  for (const route of routes) {
    test(`${route.id} renders PGDS-001 on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route.path);
      await expect(page.locator('[data-visual-canon="PGDS-001"]')).toBeVisible();
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
      await expect(page.getByAltText(/Black male Scholar/i).first()).toBeVisible();
      if (route.id === "signup") {
        await expect(page.getByRole("button", { name: /Athlete Abroad/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /District \/ School Administrator/i })).toBeVisible();
      }
      if (route.id === "role-select") {
        await expect(page.getByText("14 pathways", { exact: true })).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      const accessibility = await new AxeBuilder({ page }).analyze();
      expect(accessibility.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
      await page.screenshot({ path: `artifacts/pbos-acceptance/ui-recovery-${route.id}-${viewport.name}.png`, fullPage: true });
    });
  }

  test(`authenticated product shell uses PGDS-001 on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/dashboard");
    await expect(page.locator('[data-playbook-surface="authenticated-product-shell"]')).toBeVisible();
    await expect(page.locator('[data-visual-canon="PGDS-001"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/pbos-acceptance/ui-recovery-product-shell-${viewport.name}.png`, fullPage: true });
  });

  test(`public landing keeps About and Explore visible on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Explore" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your future should not live/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/pbos-acceptance/ui-recovery-landing-${viewport.name}.png`, fullPage: true });
  });

  test(`About renders the canonical public experience on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/about");
    await expect(page.locator('[data-visual-canon="PGDS-001"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: /One record/i })).toBeVisible();
    await expect(page.getByAltText(/Black male Scholar/i)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: `artifacts/pbos-acceptance/ui-recovery-about-${viewport.name}.png`, fullPage: true });
  });

  for (const roleOS of roleOperatingSystems) {
    test(`${roleOS.id} inherits the canonical role OS foundation on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(roleOS.path);
      await expect(page.locator('[data-playbook-surface="role-os-dashboard"]')).toBeVisible();
      await expect(page.getByRole("heading", { name: roleOS.heading, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await page.screenshot({ path: `artifacts/pbos-acceptance/ui-recovery-${roleOS.id}-${viewport.name}.png`, fullPage: true });
    });
  }
}

test("Studio Oracle owns one navigation shell", async ({ page }) => {
  await page.goto("/studio/oracle");
  await expect(page.locator('[data-playbook-surface="authenticated-product-shell"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Studio", exact: true })).toHaveCount(1);
  await expect(page.getByRole("navigation")).toHaveCount(1);
});
