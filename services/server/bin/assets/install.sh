#!/usr/bin/env bash
# Pull the exact image and materialize its runtime secrets for Docker.
set -euo pipefail

DEPLOY_DIR=/opt/url-shortener/server-deploy
source "$DEPLOY_DIR/image.env"
source /etc/url-shortener/deployment.env

aws secretsmanager get-secret-value \
  --region "$AWS_REGION" \
  --secret-id "$RUNTIME_SECRET_ID" \
  --query SecretString \
  --output text \
  | jq -r 'to_entries[] | "\(.key)=\(.value | tostring)"' \
  > /etc/url-shortener/server.secret.env

cat \
  /etc/url-shortener/server.base.env \
  /etc/url-shortener/server.secret.env \
  > /etc/url-shortener/server.env

REGISTRY_URI="${IMAGE_URI%%/*}"
DOCKER_CONFIG="$(mktemp -d)"
export DOCKER_CONFIG
trap 'rm -rf "$DOCKER_CONFIG"' EXIT

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY_URI"
docker pull "$IMAGE_URI"
