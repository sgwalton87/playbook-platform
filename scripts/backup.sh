#!/bin/bash

FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: bash scripts/backup.sh <file>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "❌ File not found:"
  echo "$FILE"
  exit 1
fi

mkdir -p scripts/backups

STAMP=$(date +"%Y%m%d_%H%M%S")

DEST="scripts/backups/${STAMP}_$(basename "$FILE")"

cp "$FILE" "$DEST"

echo ""
echo "✅ Backup created"
echo "$DEST"
echo ""
