#!/usr/bin/env bash
set -e

echo "========================================="
echo "PLAYBOOK ROLE SYSTEM TEST"
echo "========================================="

echo ""
echo "1. Build health"
echo "-----------------------------------------"
rm -rf .next
npx tsc --noEmit
npm test
bash scripts/build.sh

echo ""
echo "2. Confirm required OS routes exist"
echo "-----------------------------------------"
REQUIRED_ROUTES=(
  "app/dashboard/page.tsx"
  "app/scholar-athlete-os/page.tsx"
  "app/brand-partner-os/page.tsx"
  "app/family-os/page.tsx"
  "app/mentor-os/page.tsx"
  "app/educator-os/page.tsx"
  "app/university-os/page.tsx"
  "app/employer-os/page.tsx"
  "app/district-os/page.tsx"
  "app/pending/page.tsx"
)

for route in "${REQUIRED_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    echo "✅ $route"
  else
    echo "❌ Missing $route"
  fi
done

echo ""
echo "3. Confirm signup pathways exist"
echo "-----------------------------------------"
grep -nE 'role: "(scholar|scholar-athlete|brand-partner|family|mentor|educator|coach|college-coach|college-admissions|transition-youth|employer|other)"' lib/auth/userPathways.ts

echo ""
echo "4. Confirm route map"
echo "-----------------------------------------"
grep -nE 'role: "|osRoute:' lib/onboarding/pathwayMap.ts

echo ""
echo "5. Confirm onboarding pathways"
echo "-----------------------------------------"
grep -nE '"scholar"|"scholar-athlete"|"brand-partner"|family:|mentor:|educator:|coach:|"college-coach"|"college-admissions"|"transition-youth"|employer:|other:' lib/onboarding/roleOnboarding.ts

echo ""
echo "6. Manual browser tests to open"
echo "-----------------------------------------"
echo 'open "http://localhost:3000/login?mode=signup"'
echo 'open "http://localhost:3000/start?first=1&role=scholar"'
echo 'open "http://localhost:3000/start?first=1&role=scholar-athlete"'
echo 'open "http://localhost:3000/start?first=1&role=brand-partner"'
echo 'open "http://localhost:3000/start?first=1&role=family"'
echo 'open "http://localhost:3000/start?first=1&role=mentor"'
echo 'open "http://localhost:3000/start?first=1&role=educator"'
echo 'open "http://localhost:3000/start?first=1&role=coach"'
echo 'open "http://localhost:3000/start?first=1&role=college-coach"'
echo 'open "http://localhost:3000/start?first=1&role=college-admissions"'
echo 'open "http://localhost:3000/start?first=1&role=transition-youth"'
echo 'open "http://localhost:3000/start?first=1&role=employer"'

echo ""
echo "DONE"
