import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/acceptance",
  outputDir: "artifacts/playwright",
  workers: 1,
  retries: 0,
  reporter: "line",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
