import { defineConfig, devices } from "@playwright/test";
import { release } from "node:os";

const useSystemChrome = process.platform === "darwin" && Number(release().split(".")[0]) <= 21;
const chromiumBase = { ...devices["Desktop Chrome"], ...(useSystemChrome ? { channel: "chrome" as const } : {}) };

export default defineConfig({
  testDir: "./tests/acceptance",
  outputDir: "artifacts/playwright",
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: "line",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL, trace: "off" },
  projects: [
    { name: "chromium", use: chromiumBase },
    { name: "tablet", use: { ...chromiumBase, viewport: { width: 834, height: 1194 }, hasTouch: true } },
    { name: "mobile", use: { ...chromiumBase, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
});
