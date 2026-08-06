import { defineConfig, devices } from "@playwright/test";
import { release } from "node:os";

const useSystemChrome = process.platform === "darwin" && Number(release().split(".")[0]) <= 21;

export default defineConfig({
  testDir: "./tests/acceptance",
  outputDir: "artifacts/playwright",
  workers: 1,
  retries: 0,
  reporter: "line",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], ...(useSystemChrome ? { channel: "chrome" } : {}) } }]
});
