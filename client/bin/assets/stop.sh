#!/usr/bin/env bash
set -euo pipefail

if docker container inspect url-shortener-client >/dev/null 2>&1; then
  docker stop --time 30 url-shortener-client
  docker rm url-shortener-client
fi
