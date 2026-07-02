import fs from "fs";
import { renderSentinelReport, runSentinel } from "../lib/sentinel";

console.log("🩺 Running Playbook Sentinel...");

const report = renderSentinelReport();
fs.mkdirSync("docs/ARCHITECTURE", { recursive: true });
fs.writeFileSync("docs/ARCHITECTURE/SENTINEL_REPORT.md", report);

const health = runSentinel();

console.log(`Health: ${health.healthScore}%`);
console.log(`Status: ${health.status}`);

if (health.status === "needs_attention") {
  console.error("❌ Sentinel found platform health issues.");
  process.exit(1);
}

console.log("✅ Sentinel complete.");
