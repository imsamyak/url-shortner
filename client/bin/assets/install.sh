#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR=/opt/url-shortener/client-deploy
source "$DEPLOY_DIR/image.env"
source /etc/url-shortener/client-deployment.env

REGISTRY_URI="${IMAGE_URI%%/*}"
DOCKER_CONFIG="$(mktemp -d)"
export DOCKER_CONFIG
trap 'rm -rf "$DOCKER_CONFIG"' EXIT

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY_URI"
docker pull "$IMAGE_URI"
