#!/usr/bin/env bash
set -e
npm test
bash scripts/build.sh
bash scripts/log-ledger-event.sh build-pass "Tests and production build passed."
