#!/usr/bin/env bash
set -e

EVENT="$1"
DETAIL="$2"
TODAY=$(date +%F)
TIME=$(date '+%H:%M')

append () {
  FILE="$1"
  TEXT="$2"
  mkdir -p "$(dirname "$FILE")"
  echo "" >> "$FILE"
  echo "## $TODAY $TIME" >> "$FILE"
  echo "$TEXT" >> "$FILE"
}

append "docs/HISTORY/DAILY_LOGS/$TODAY.md" "- $EVENT: $DETAIL"

case "$EVENT" in
  commit)
    append "docs/LEDGER/ENGINEERING_LOG.md" "- Commit: $DETAIL"
    append "docs/LEDGER/MILESTONES.md" "- Engineering milestone recorded: $DETAIL"
    ;;
  build-pass)
    append "docs/LEDGER/ENGINEERING_LOG.md" "- Build passed: $DETAIL"
    append "docs/LEDGER/RELEASE_HISTORY.md" "- Build validation passed."
    ;;
  sprint)
    append "docs/LEDGER/PRODUCT_LOG.md" "- Sprint milestone: $DETAIL"
    append "docs/LEDGER/ROADMAP.md" "- Roadmap progress: $DETAIL"
    append "docs/LEDGER/MILESTONES.md" "- Sprint milestone completed: $DETAIL"
    ;;
  decision)
    append "docs/LEDGER/DECISION_LOG.md" "- Decision: $DETAIL"
    append "docs/LEDGER/ARCHITECTURE_HISTORY.md" "- Architecture decision: $DETAIL"
    ;;
  vision)
    append "docs/LEDGER/VISION.md" "- Vision note: $DETAIL"
    append "docs/LEDGER/FOUNDER_JOURNAL.md" "- Founder reflection: $DETAIL"
    ;;
  ip)
    append "docs/LEDGER/INTELLECTUAL_PROPERTY.md" "- IP / original concept: $DETAIL"
    ;;
esac

echo "✅ Ledger updated: $EVENT — $DETAIL"
