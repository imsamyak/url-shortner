#!/usr/bin/env bash
set -euo pipefail

source /opt/url-shortener/server-deploy/image.env
source /etc/url-shortener/deployment.env

docker run --detach \
  --name url-shortener-server \
  --restart unless-stopped \
  --env-file /etc/url-shortener/server.env \
  --log-driver awslogs \
  --log-opt awslogs-region="$AWS_REGION" \
  --log-opt awslogs-group="$LOG_GROUP_NAME" \
  --log-opt awslogs-stream="server-$(hostname)" \
  --publish 4000:4000 \
  "$IMAGE_URI"
