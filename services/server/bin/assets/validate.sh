#!/usr/bin/env bash
# Give the Express container one minute to pass its local health check.
set -euo pipefail

for attempt in {1..12}; do
  if curl --fail --silent http://127.0.0.1:4000/health >/dev/null; then
    exit 0
  fi
  sleep 5
done

exit 1
