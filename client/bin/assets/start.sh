#!/usr/bin/env bash
set -euo pipefail

source /opt/url-shortener/client-deploy/image.env
source /etc/url-shortener/client-deployment.env

docker run --detach \
  --name url-shortener-client \
  --restart unless-stopped \
  --env-file /etc/url-shortener/client.env \
  --log-driver awslogs \
  --log-opt awslogs-region="$AWS_REGION" \
  --log-opt awslogs-group="$LOG_GROUP_NAME" \
  --log-opt awslogs-stream="client-$(hostname)" \
  --publish 3000:3000 \
  "$IMAGE_URI"
