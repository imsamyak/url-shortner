#!/usr/bin/env bash
# Start the selected Express image with the generated runtime environment.
set -euo pipefail

source /opt/url-shortener/server-deploy/image.env

docker run --detach \
  --name url-shortener-server \
  --restart unless-stopped \
  --env-file /etc/url-shortener/server.env \
  --publish 4000:4000 \
  "$IMAGE_URI"
