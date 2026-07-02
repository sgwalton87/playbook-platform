#!/usr/bin/env bash
set -e

npm test
bash scripts/build.sh

bash scripts/log-dev-event.sh "Tests and production build passed."

echo "✅ Tests and build passed."
