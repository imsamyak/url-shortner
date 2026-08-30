#!/usr/bin/env bash
# Start the selected Nuxt image with runtime configuration supplied by EC2.
set -euo pipefail
source /opt/url-shortener/client-deploy/image.env

docker run --detach \
  --name url-shortener-client \
  --restart unless-stopped \
  --env-file /etc/url-shortener/client.env \
  --publish 3000:3000 \
  "$IMAGE_URI"
