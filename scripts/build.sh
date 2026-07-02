#!/bin/bash

echo ""
echo "========================================="
echo "🚀 PLAYBOOK BUILD"
echo "========================================="
echo ""

echo "📦 Running Next.js production build..."
npm run build

STATUS=$?

echo ""
if [ $STATUS -eq 0 ]; then
  echo "✅ BUILD PASSED"
else
  echo "❌ BUILD FAILED"
fi

echo ""
echo "========================================="
