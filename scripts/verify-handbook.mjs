#!/usr/bin/env node

const required = [
  "CODEX.md",
  "AGENTS.md",
  "docs/MASTER_CHECKLIST.md",
  "docs/ROADMAP.md",
  "docs/ARCHITECTURE.md",
  "docs/DATABASE.md",
  "docs/UI_DESIGN_SYSTEM.md",
  "docs/DECISIONS.md",
  "docs/RELEASE_PROCESS.md",
  "docs/auto_sprint.md",
];

import fs from "node:fs";

const missing = required.filter((file) => !fs.existsSync(file));

if (missing.length > 0) {
  console.error(`Missing handbook files: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Verified ${required.length} canonical handbook documents.`);
