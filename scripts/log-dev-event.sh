#!/usr/bin/env bash
set -e

TODAY=$(date +%F)
TIME=$(date '+%H:%M')
LOG="docs/HISTORY/DAILY_LOGS/$TODAY.md"

mkdir -p docs/HISTORY/DAILY_LOGS

if [ ! -f "$LOG" ]; then
cat > "$LOG" <<EOD
# Daily Engineering Log — $TODAY

## Events
EOD
fi

MESSAGE="$*"
[ -z "$MESSAGE" ] && MESSAGE="Development event logged."

echo "- $TIME — $MESSAGE" >> "$LOG"
echo "✅ Logged: $MESSAGE"
