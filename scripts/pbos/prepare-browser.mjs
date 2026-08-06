import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { release } from "node:os";

const systemChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const useSystemChrome = process.platform === "darwin" && Number(release().split(".")[0]) <= 21;
if (useSystemChrome) {
  if (!existsSync(systemChrome)) {
    throw new Error("Playwright bundled Chromium is unsupported on this macOS release and Google Chrome is not installed.");
  }
  process.stdout.write("PBOS browser preparation: using installed Google Chrome.\n");
} else {
  execFileSync(process.execPath, ["node_modules/playwright/cli.js", "install", "chromium"], { stdio: "inherit" });
}
