#!/usr/bin/env bash
set -e

write_if_empty () {
  file="$1"
  title="$2"
  body="$3"

  mkdir -p "$(dirname "$file")"

  if [ ! -s "$file" ]; then
    cat > "$file" <<EOD
# $title

$body

---

## Status

Draft foundation created during Playbook platform build.

## Purpose

This document exists to preserve Playbook's architecture, product thinking, company history, and engineering decisions as the platform grows.

## Current Direction

Playbook is evolving into Playbook OS™: a lifelong achievement operating system powered by the Playbook Record™, Trust Layer™, Living Evidence™, Intelligence Engines, Opportunity Engine™, and Compass AI™.

## Last Updated

$(date +%F)
EOD
    echo "✅ Filled $file"
  else
    echo "↪️  Skipped $file — already has content"
  fi
}

write_if_empty "docs/AI_ARCHITECTURE.md" "AI Architecture" "Defines how Compass AI™ and future agents consume the Playbook Record™."
write_if_empty "docs/DATABASE_BLUEPRINT.md" "Database Blueprint" "Documents Supabase schema, Playbook Graph™, records, achievements, evidence, trust, and opportunities."
write_if_empty "docs/DESIGN_SYSTEM.md" "Design System" "Defines Playbook visual language, UI primitives, typography, spacing, and component standards."
write_if_empty "docs/ENGINE_ARCHITECTURE.md" "Engine Architecture" "Defines Event → Handler → Engine → Repository → Database architecture."
write_if_empty "docs/EVENT_ENGINE.md" "Event Engine" "Documents the Playbook Event Bus™ and meaningful platform events."
write_if_empty "docs/FUTURE_HISTORY.md" "Future History" "Captures the long-term vision of what Playbook is becoming."
write_if_empty "docs/LEGACY.md" "Legacy" "Preserves why Playbook exists and what must never be lost."
write_if_empty "docs/PLAYBOOK_BIBLE.md" "Playbook Bible" "The central philosophy, architecture, and operating principles of Playbook."
write_if_empty "docs/PLAYBOOK_CONSTITUTION.md" "Playbook Constitution" "Defines the permanent rules that guide product, engineering, and mission."
write_if_empty "docs/PLAYBOOK_HISTORY.md" "Playbook History" "Chronicles the evolution from social platform to Playbook OS™."
write_if_empty "docs/PLAYBOOK_MANIFESTO.md" "Playbook Manifesto" "States what Playbook believes about learners, evidence, ownership, and opportunity."
write_if_empty "docs/PLAYBOOK_MASTER_LEDGER.md" "Playbook Master Ledger" "Tracks major accomplishments, milestones, and platform progress."
write_if_empty "docs/PLAYBOOK_NORTH_STAR.md" "Playbook North Star" "Defines the mission and long-term destination of Playbook."
write_if_empty "docs/PLAYBOOK_PHILOSOPHY.md" "Playbook Philosophy" "Explains the values behind the platform."
write_if_empty "docs/PLAYBOOK_PRINCIPLES.md" "Playbook Principles" "Defines recurring product and engineering principles."
write_if_empty "docs/PLAYBOOK_PORTFOLIO.md" "Playbook Portfolio" "Documents the Portfolio Engine™ and Scholar-facing portfolio experience."
write_if_empty "docs/PORTFOLIO_ENGINE.md" "Portfolio Engine" "Explains portfolio completion, DNA, stats, opportunity signals, and profile integration."
write_if_empty "docs/PRODUCT_ROADMAP.md" "Product Roadmap" "Tracks Alpha milestones and future releases."
write_if_empty "docs/PROFILE_ENGINE_ROADMAP.md" "Profile Engine Roadmap" "Documents public profile architecture and future extraction work."
write_if_empty "docs/PROJECT_ATLAS.md" "Project Atlas" "The master architectural map of Playbook."
write_if_empty "docs/REVENUE_MODEL.md" "Revenue Model" "Explores future sustainability models aligned with learner ownership and trust."
write_if_empty "docs/ROADMAP.md" "Roadmap" "High-level roadmap for Playbook OS™."
write_if_empty "docs/TIMELINE.md" "Timeline" "Chronological record of major development and company milestones."
write_if_empty "docs/USER_JOURNEYS.md" "User Journeys" "Maps Scholar, parent, educator, mentor, coach, and organization experiences."

write_if_empty "docs/LEDGER/ENGINEERING_LOG.md" "Engineering Log" "Tracks meaningful engineering milestones."
write_if_empty "docs/LEDGER/PRODUCT_LOG.md" "Product Log" "Tracks major product decisions and shipped user-facing capabilities."
write_if_empty "docs/LEDGER/DECISION_LOG.md" "Decision Log" "Tracks key strategic and architectural decisions."
write_if_empty "docs/LEDGER/MILESTONES.md" "Milestones" "Tracks major Playbook build milestones."
write_if_empty "docs/LEDGER/RELEASE_HISTORY.md" "Release History" "Tracks versioned releases and sprint completions."
write_if_empty "docs/LEDGER/ROADMAP.md" "Ledger Roadmap" "Tracks roadmap evolution."
write_if_empty "docs/LEDGER/VISION.md" "Vision Ledger" "Preserves vision decisions and founder-level strategy."
write_if_empty "docs/LEDGER/FOUNDER_JOURNAL.md" "Founder Journal Ledger" "Captures founder reflections and platform meaning."
write_if_empty "docs/LEDGER/ARCHITECTURE_HISTORY.md" "Architecture History" "Tracks how Playbook architecture evolved."
write_if_empty "docs/LEDGER/INTELLECTUAL_PROPERTY.md" "Intellectual Property Ledger" "Tracks original concepts, terminology, and strategic moats."

./scripts/log-dev-event.sh "Filled placeholder documentation files with foundation content."

npm test
bash scripts/build.sh
git add .
git commit -m "Fill placeholder documentation foundations"
