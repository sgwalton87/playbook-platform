import fs from "fs";
import { renderDocumentationHealthReport, renderDocumentationIndex } from "../lib/doc-governor";

console.log("📚 Running Playbook Doc Governor...");

fs.mkdirSync("docs/DOCUMENTATION", { recursive: true });

fs.writeFileSync("docs/DOCUMENTATION/DOCUMENTATION_INDEX.md", renderDocumentationIndex());
fs.writeFileSync("docs/DOCUMENTATION/DOCUMENTATION_HEALTH.md", renderDocumentationHealthReport());

console.log("✅ Doc Governor complete.");
