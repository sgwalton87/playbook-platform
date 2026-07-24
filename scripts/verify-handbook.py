#!/usr/bin/env python3
from pathlib import Path

required = [
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
]
missing = [path for path in required if not Path(path).exists()]
if missing:
    raise SystemExit("Missing handbook files: " + ", ".join(missing))
print("Verified 10 canonical handbook documents.")
