#!/usr/bin/env bash
set -e

EVENT="$1"
shift || true
DETAIL="$*"

TODAY=$(date +%F)
TIME=$(date '+%H:%M')

[ -z "$EVENT" ] && EVENT="note"
[ -z "$DETAIL" ] && DETAIL="Playbook development event logged."

append_entry () {
  FILE="$1"
  TITLE="$2"
  TEXT="$3"

  mkdir -p "$(dirname "$FILE")"

  if [ ! -f "$FILE" ]; then
    echo "# $TITLE" > "$FILE"
    echo "" >> "$FILE"
  fi

  echo "" >> "$FILE"
  echo "## $TODAY $TIME" >> "$FILE"
  echo "$TEXT" >> "$FILE"
}

# Always update core memory
append_entry "docs/HISTORY/DAILY_LOGS/$TODAY.md" "Daily Engineering Log — $TODAY" "- **$EVENT**: $DETAIL"
append_entry "docs/LEDGER/ENGINEERING_LOG.md" "Engineering Log" "- **$EVENT**: $DETAIL"
append_entry "docs/LEDGER/MILESTONES.md" "Milestones" "- **$EVENT**: $DETAIL"

case "$EVENT" in
  commit)
    append_entry "docs/LEDGER/PRODUCT_LOG.md" "Product Log" "- Commit recorded: $DETAIL"
    append_entry "docs/LEDGER/RELEASE_HISTORY.md" "Release History" "- Commit recorded: $DETAIL"
    ;;

  build-pass)
    append_entry "docs/releases/RELEASE_LOG.md" "Release Log" "- Build passed: $DETAIL"
    append_entry "docs/LEDGER/RELEASE_HISTORY.md" "Release History" "- Build validation passed: $DETAIL"
    append_entry "VERSION.md" "Playbook Platform Version" "- Build passed: $DETAIL"
    ;;

  release)
    append_entry "docs/releases/RELEASE_LOG.md" "Release Log" "- Release milestone: $DETAIL"
    append_entry "docs/LEDGER/RELEASE_HISTORY.md" "Release History" "- Release milestone: $DETAIL"
    append_entry "CHANGELOG.md" "Playbook Platform Changelog" "- Release: $DETAIL"
    append_entry "VERSION.md" "Playbook Platform Version" "- Release update: $DETAIL"
    ;;

  decision)
    append_entry "docs/LEDGER/DECISION_LOG.md" "Decision Log" "- Decision: $DETAIL"
    append_entry "docs/LEDGER/ARCHITECTURE_HISTORY.md" "Architecture History" "- Architecture decision: $DETAIL"
    append_entry "docs/ADR/ADR_LOG.md" "Architecture Decision Record Log" "- Decision: $DETAIL"
    ;;

  innovation)
    append_entry "docs/INNOVATIONS/README.md" "Playbook Innovations" "- Innovation: $DETAIL"
    append_entry "docs/LEDGER/INTELLECTUAL_PROPERTY.md" "Intellectual Property Ledger" "- Original concept / innovation: $DETAIL"
    ;;

  why-not)
    append_entry "docs/WHY_NOTS/README.md" "Why Nots" "- Why not / rejected path: $DETAIL"
    append_entry "docs/LEDGER/DECISION_LOG.md" "Decision Log" "- Rejected path: $DETAIL"
    ;;

  sprint)
    append_entry "docs/LEDGER/ROADMAP.md" "Roadmap Ledger" "- Sprint progress: $DETAIL"
    append_entry "docs/sprints/SPRINT_LOG.md" "Sprint Log" "- Sprint update: $DETAIL"
    append_entry "docs/LEDGER/PRODUCT_LOG.md" "Product Log" "- Sprint update: $DETAIL"
    ;;

  vision)
    append_entry "docs/LEDGER/VISION.md" "Vision Ledger" "- Vision note: $DETAIL"
    append_entry "docs/LEDGER/FOUNDER_JOURNAL.md" "Founder Journal Ledger" "- Founder reflection: $DETAIL"
    append_entry "docs/HISTORY/FOUNDERS_JOURNAL/Volume_1_The_Birth_of_Playbook.md" "Founder’s Journal — Volume I" "- Reflection: $DETAIL"
    ;;

  architecture)
    append_entry "docs/LEDGER/ARCHITECTURE_HISTORY.md" "Architecture History" "- Architecture update: $DETAIL"
    append_entry "ARCHITECTURE.md" "Playbook Platform Architecture" "- Architecture update: $DETAIL"
    ;;

  product)
    append_entry "docs/LEDGER/PRODUCT_LOG.md" "Product Log" "- Product update: $DETAIL"
    append_entry "docs/PRODUCT/PRODUCT_STRATEGY.md" "Product Strategy" "- Product update: $DETAIL"
    ;;

  ip)
    append_entry "docs/LEDGER/INTELLECTUAL_PROPERTY.md" "Intellectual Property Ledger" "- IP note: $DETAIL"
    append_entry "docs/INNOVATIONS/README.md" "Playbook Innovations" "- IP / innovation note: $DETAIL"
    ;;
esac

echo "✅ Playbook ledger updated: $EVENT — $DETAIL"
