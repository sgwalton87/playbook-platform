import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { id: "login", path: "/login", heading: /Run your Playbook/i },
  { id: "signup", path: "/login?mode=signup", heading: /Choose your path/i },
  { id: "check-email", path: "/check-email?email=scholar%40example.com&role=scholar", heading: /Confirmation sent/i },
  { id: "reset-password", path: "/reset-password", heading: /Choose a new password/i },
  { id: "role-select", path: "/role-select", heading: /One platform/i },
] as const;

for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  for (const route of routes) {
    test(`${route.id} renders PGDS-001 on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route.path);
      await expect(page.locator('[data-visual-canon="PGDS-001"]')).toBeVisible();
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
      await expect(page.getByAltText(/Black male Scholar/i).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      const accessibility = await new AxeBuilder({ page }).analyze();
      expect(accessibility.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
      await page.screenshot({ path: `artifacts/pbos-acceptance/ui-recovery-${route.id}-${viewport.name}.png`, fullPage: true });
    });
  }
}
