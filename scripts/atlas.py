#!/usr/bin/env python3

from pathlib import Path

docs = {
    "docs/PROJECT_ATLAS.md": """# Project Atlas

## Vision

Playbook is the Student Operating System.

Every product in Playbook revolves around one living, verified student portfolio.

Core Products

1. Portfolio
2. Academy
3. Compass (AI)
4. Opportunities
5. Community
6. Insights

Status: Draft v0.1
""",

    "docs/PRODUCT_ROADMAP.md": "# Product Roadmap\n\n## Coming Soon\n\n",

    "docs/DATABASE_BLUEPRINT.md": "# Database Blueprint\n\n",

    "docs/AI_ARCHITECTURE.md": "# AI Architecture\n\n",

    "docs/USER_JOURNEYS.md": "# User Journeys\n\n",

    "docs/REVENUE_MODEL.md": "# Revenue Model\n\n",

    "docs/DESIGN_SYSTEM.md": "# Design System\n\n",
}

for filename, content in docs.items():
    path = Path(filename)
    path.write_text(content)

print("")
print("🚀 PROJECT ATLAS")
print("==============================")
print("Generated", len(docs), "documents.")
print("==============================")
