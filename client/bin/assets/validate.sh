#!/usr/bin/env bash
# Give the new Nuxt container up to one minute before CodeDeploy rolls back.
set -euo pipefail
for attempt in {1..12}; do
  if curl --fail --silent http://127.0.0.1:3000/ >/dev/null; then
    exit 0
  fi
  sleep 5
done
exit 1
