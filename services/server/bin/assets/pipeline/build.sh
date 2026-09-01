#!/usr/bin/env bash
set -euo pipefail

REGISTRY_URI="${REPOSITORY_URI%/*}"
IMAGE_TAG="${CODEBUILD_RESOLVED_SOURCE_VERSION:-manual}-${CODEBUILD_BUILD_NUMBER}"
IMAGE_URI="${REPOSITORY_URI}:${IMAGE_TAG}"

aws ecr get-login-password --region "$AWS_DEFAULT_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY_URI"

docker build \
  --pull \
  --file services/server/Dockerfile \
  --tag "$IMAGE_URI" \
  .

docker push "$IMAGE_URI"
docker tag "$IMAGE_URI" "${REPOSITORY_URI}:current"
docker push "${REPOSITORY_URI}:current"

mkdir -p server-deploy/deploy
cp services/server/bin/assets/appspec.yml server-deploy/appspec.yml
cp services/server/bin/assets/*.sh server-deploy/deploy/
chmod +x server-deploy/deploy/*.sh
printf 'IMAGE_URI=%s\n' "$IMAGE_URI" > server-deploy/image.env
