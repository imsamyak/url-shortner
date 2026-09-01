#!/usr/bin/env bash
set -euo pipefail

if docker container inspect url-shortener-server >/dev/null 2>&1; then
  docker stop --time 30 url-shortener-server
  docker rm url-shortener-server
fi
