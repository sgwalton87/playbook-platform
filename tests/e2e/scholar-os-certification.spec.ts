import { expect, test } from "@playwright/test";

const routes = ["/goals", "/athletic-path"] as const;

const workflowNames = {
  "/goals": "Goal workflow",
  "/athletic-path": "Athletic path workflow",
} as const;

for (const route of routes) {
  test(`${route} exposes accessible Scholar states on desktop`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("navigation", { name: workflowNames[route] })).toBeVisible();

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
    await expect(focused).toHaveCSS("outline-style", "solid");

    const timing = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return navigation.duration;
    });
    expect(timing).toBeLessThan(5_000);
  });

  test(`${route} remains usable on mobile with reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const links = page
      .getByRole("navigation", { name: workflowNames[route] })
      .getByRole("link");
    expect(await links.count()).toBeGreaterThanOrEqual(3);
    const firstBox = await links.first().boundingBox();
    expect(firstBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    const transitionDuration = await links.first().evaluate((link) =>
      Number.parseFloat(getComputedStyle(link).transitionDuration),
    );
    expect(transitionDuration).toBeLessThanOrEqual(0.001);
  });
}

test("Scholar core workflow preserves navigable human choice", async ({ page }) => {
  await page.goto("/goals");
  await page.getByRole("link", { name: "Review journey" }).click();
  await expect(page).toHaveURL(/\/journey$/);
  await expect(page.getByText("Human confirmation required.")).toBeVisible();

  await page.goto("/athletic-path");
  await page.getByRole("link", { name: "Evaluate opportunities" }).click();
  await expect(page).toHaveURL(/\/opportunities$/);
  await expect(page.getByRole("main")).toBeVisible();
});
