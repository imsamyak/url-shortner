#!/usr/bin/env bash
# Authenticate with ECR and pull the exact Nuxt image selected by the pipeline.
set -euo pipefail
DEPLOY_DIR=/opt/url-shortener/client-deploy

# Remove the previous non-container service during the first Docker deployment.
systemctl disable --now url-shortener-client.service 2>/dev/null || true
rm -f /etc/systemd/system/url-shortener-client.service
systemctl daemon-reload

source "$DEPLOY_DIR/image.env"
source /etc/url-shortener/client.env
REGISTRY_URI="${IMAGE_URI%%/*}"
DOCKER_CONFIG="$(mktemp -d)"
export DOCKER_CONFIG
trap 'rm -rf "$DOCKER_CONFIG"' EXIT

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY_URI"
docker pull "$IMAGE_URI"
