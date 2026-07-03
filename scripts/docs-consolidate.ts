import fs from "fs";
import path from "path";

const deprecatedDir = "docs/DEPRECATED";

const moves = [
  ["docs/DESIGN_SYSTEM.md", "docs/DEPRECATED/DESIGN_SYSTEM.md"],
  ["docs/ENGINEERING/ARCHITECTURE.md", "docs/DEPRECATED/ENGINEERING_ARCHITECTURE.md"],
  ["docs/architecture/DATA_MODEL.md", "docs/DEPRECATED/OLD_DATA_MODEL.md"],
  ["docs/architecture/EVENT_CATALOG.md", "docs/DEPRECATED/OLD_EVENT_CATALOG.md"],
  ["docs/architecture/REPOSITORY_CATALOG.md", "docs/DEPRECATED/OLD_REPOSITORY_CATALOG.md"],
  ["docs/releases/README.md", "docs/DEPRECATED/RELEASES_README.md"],
  ["docs/sprints/README.md", "docs/DEPRECATED/SPRINTS_README.md"],
];

fs.mkdirSync(deprecatedDir, { recursive: true });

for (const [from, to] of moves) {
  if (fs.existsSync(from)) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
    console.log(`Moved ${from} → ${to}`);
  }
}

fs.appendFileSync(
  "docs/DOCUMENTATION/CLEANUP_PLAN.md",
  `

---

# Cleanup Pass

Moved duplicate or superseded documentation into docs/DEPRECATED.

Canonical docs remain:

- docs/PLAYBOOK_OS.md
- docs/PRODUCT_ROADMAP.md
- docs/VISION/VISION.md
- docs/DESIGN/PLAYBOOK_DESIGN_SYSTEM.md
- docs/ARCHITECTURE/CURRENT_ARCHITECTURE.md
- docs/ARCHITECTURE/PLAYBOOK_OS_ALPHA_1.md
`
);

console.log("Documentation consolidation complete.");
