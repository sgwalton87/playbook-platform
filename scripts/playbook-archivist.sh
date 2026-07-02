#!/usr/bin/env bash
set -e

TODAY=$(date +%F)
TIME=$(date '+%H:%M')
SUMMARY_FILE="docs/ARCHIVIST/SHIP_$TODAY.md"

echo "====================================="
echo "🚀 PLAYBOOK SHIP"
echo "====================================="

npm test
bash scripts/build.sh

CHANGED_FILES=$(git diff --name-only)
LAST_COMMIT=$(git log -1 --pretty=%B 2>/dev/null || echo "No commits yet")

mkdir -p docs/ARCHIVIST docs/HISTORY/DAILY_LOGS docs/LEDGER docs/releases

cat > "$SUMMARY_FILE" <<EOD
# Playbook Archivist Ship Report — $TODAY

## Time

$TIME

## Status

✅ Tests passed  
✅ Production build passed  

## Last Commit

$LAST_COMMIT

## Changed Files Before Commit

$CHANGED_FILES

## Archivist Summary

The Playbook Archivist recorded a successful ship cycle.

## Documentation Updates Triggered

- Daily Engineering Log
- Engineering Ledger
- Milestones Ledger
- Release History
- Version Log
- Archivist Ship Report

## Next Review

Founder should review whether this ship cycle included:

- Product milestone
- Architecture decision
- Innovation
- Why-not / rejected path
- Founder reflection
- Company history update
EOD

bash scripts/playbook-ledger.sh build-pass "Archivist ship cycle passed tests and production build."

git add .

if git diff --cached --quiet; then
  echo "No changes staged. Ship checks passed."
else
  git commit -m "Archivist ship update"
fi

git status

echo "====================================="
echo "✅ SHIP COMPLETE"
echo "Report: $SUMMARY_FILE"
echo "====================================="
