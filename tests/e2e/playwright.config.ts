import { defineConfig } from "@playwright/test";

const chromiumLaunchOptions = { args: ["--no-sandbox", "--disable-dev-shm-usage"] };
const SKIP_WEB_SERVER = process.env.PBOS_SMOKE_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.PBOS_SMOKE_BASE_URL ?? "http://localhost:3000",
    headless: true,
    actionTimeout: 5_000,
    navigationTimeout: 30_000,
  },
  webServer: SKIP_WEB_SERVER
    ? []
    : [
    {
      command: "npm run dev",
      port: 3000,
      reuseExistingServer: true,
      timeout: 120_000,
      stderr: "pipe",
      stdout: "ignore",
    },
  ],
  outputDir: "test-results",
  projects: [
    {
      name: "chromium",
      use: { launchOptions: chromiumLaunchOptions },
    },
    {
      name: "firefox",
    },
    {
      name: "webkit",
    },
  ],
});
