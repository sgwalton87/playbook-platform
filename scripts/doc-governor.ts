import fs from "fs";
import {
  renderDocLifecycle,
  renderDocRegistry,
  renderDocumentationHealthReport,
  renderDocumentationIndex,
  renderMergeRecommendations,
} from "../lib/doc-governor/DocRenderer";

console.log("📚 Running Playbook Doc Governor v2...");

fs.mkdirSync("docs/DOCUMENTATION", { recursive: true });

fs.writeFileSync("docs/DOCUMENTATION/DOCUMENTATION_INDEX.md", renderDocumentationIndex());
fs.writeFileSync("docs/DOCUMENTATION/DOCUMENTATION_HEALTH.md", renderDocumentationHealthReport());
fs.writeFileSync("docs/DOCUMENTATION/DOC_REGISTRY.md", renderDocRegistry());
fs.writeFileSync("docs/DOCUMENTATION/MERGE_RECOMMENDATIONS.md", renderMergeRecommendations());
fs.writeFileSync("docs/DOCUMENTATION/DOC_LIFECYCLE.md", renderDocLifecycle());

console.log("✅ Doc Governor v2 complete.");
