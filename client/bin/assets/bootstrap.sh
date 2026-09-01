#!/usr/bin/env bash
set -euo pipefail

dnf install -y docker ruby wget
systemctl enable --now docker

wget -q \
  "https://aws-codedeploy-{{AWS_REGION}}.s3.{{AWS_REGION}}.amazonaws.com/latest/install" \
  -O /tmp/codedeploy-install
chmod +x /tmp/codedeploy-install
/tmp/codedeploy-install auto
systemctl enable --now codedeploy-agent

mkdir -p /etc/url-shortener

cat > /etc/url-shortener/client.env <<'ENVIRONMENT'
NODE_ENV=production
HOST=0.0.0.0
PORT={{PORT}}
AWS_REGION={{AWS_REGION}}
NUXT_PUBLIC_API_URL={{API_URL}}
ENVIRONMENT

cat > /etc/url-shortener/client-deployment.env <<'DEPLOYMENT'
AWS_REGION={{AWS_REGION}}
REPOSITORY_NAME={{REPOSITORY_NAME}}
REPOSITORY_URI={{REPOSITORY_URI}}
LOG_GROUP_NAME={{LOG_GROUP_NAME}}
DEPLOYMENT

cat > /usr/local/bin/start-current-url-shortener-client <<'BOOTSTRAP'
#!/usr/bin/env bash
set -euo pipefail

source /etc/url-shortener/client-deployment.env

IMAGE_URI="$REPOSITORY_URI:current"
aws ecr describe-images \
  --region "$AWS_REGION" \
  --repository-name "$REPOSITORY_NAME" \
  --image-ids imageTag=current \
  >/dev/null

REGISTRY_URI="${REPOSITORY_URI%/*}"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY_URI"

docker pull "$IMAGE_URI"
docker rm --force url-shortener-client 2>/dev/null || true
docker run --detach \
  --name url-shortener-client \
  --restart unless-stopped \
  --env-file /etc/url-shortener/client.env \
  --log-driver awslogs \
  --log-opt awslogs-region="$AWS_REGION" \
  --log-opt awslogs-group="$LOG_GROUP_NAME" \
  --log-opt awslogs-stream="client-$(hostname)" \
  --publish {{PORT}}:{{PORT}} \
  "$IMAGE_URI"
BOOTSTRAP

chmod +x /usr/local/bin/start-current-url-shortener-client
/usr/local/bin/start-current-url-shortener-client || true
