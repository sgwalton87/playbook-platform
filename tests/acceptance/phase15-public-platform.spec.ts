import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicSurfaces = [
  { route: "/", marker: /Playbook/i },
  { route: "/login", marker: /Log In|Sign Up/i },
  { route: "/about", marker: /Playbook/i },
] as const;

for (const surface of publicSurfaces) {
  test(`${surface.route} renders without blocking accessibility defects`, async ({ page }) => {
    const response = await page.goto(surface.route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${surface.route} should return a successful response`).toBe(true);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(surface.marker);

    const accessibility = await new AxeBuilder({ page }).analyze();
    const blocking = accessibility.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(blocking, `${surface.route} has serious or critical accessibility violations`).toEqual([]);
  });
}

test("public navigation does not overflow the viewport", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
