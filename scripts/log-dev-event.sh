#!/usr/bin/env bash

set -e

TODAY=$(date +%F)
LOG="docs/HISTORY/DAILY_LOGS/$TODAY.md"

mkdir -p docs/HISTORY/DAILY_LOGS

if [ ! -f "$LOG" ]; then
  cat > "$LOG" <<EOD
# Daily Engineering Log — $TODAY

## Events

EOD
fi

MESSAGE="$*"

if [ -z "$MESSAGE" ]; then
  MESSAGE="Development event logged."
fi

{
  echo ""
  echo "- $(date '+%H:%M') — $MESSAGE"
} >> "$LOG"

echo "✅ Logged event to $LOG"
