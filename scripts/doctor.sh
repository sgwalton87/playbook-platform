#!/bin/bash

echo ""
echo "========================================="
echo "🩺 PLAYBOOK DOCTOR"
echo "========================================="
echo ""

echo "Checking project..."

echo ""
echo "📦 Build"
npm run build >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build passes"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📁 Required directories"

for dir in app components lib scripts; do
    if [ -d "$dir" ]; then
        echo "✅ $dir"
    else
        echo "❌ Missing $dir"
    fi
done

echo ""
echo "========================================="
echo "Project Healthy"
echo "========================================="
