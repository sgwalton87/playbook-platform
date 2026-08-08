import { defineConfig, devices } from "@playwright/test";
import { release } from "node:os";

const useSystemChrome = process.platform === "darwin" && Number(release().split(".")[0]) <= 21;
const vercelBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./tests/acceptance",
  outputDir: "artifacts/playwright",
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: "line",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    trace: "off",
    ...(vercelBypass ? { extraHTTPHeaders: {
      "x-vercel-protection-bypass": vercelBypass,
      "x-vercel-set-bypass-cookie": "true"
    } } : {})
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], ...(useSystemChrome ? { channel: "chrome" } : {}) } }]
});
