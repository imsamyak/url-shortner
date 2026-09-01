#!/usr/bin/env bash
set -euo pipefail

dnf install -y docker ruby wget jq
systemctl enable --now docker

wget -q \
  "https://aws-codedeploy-{{AWS_REGION}}.s3.{{AWS_REGION}}.amazonaws.com/latest/install" \
  -O /tmp/codedeploy-install
chmod +x /tmp/codedeploy-install
/tmp/codedeploy-install auto
systemctl enable --now codedeploy-agent

mkdir -p /etc/url-shortener

cat > /etc/url-shortener/server.base.env <<'ENVIRONMENT'
NODE_ENV=production
APP_ENV=production
HOST=0.0.0.0
PORT={{PORT}}
AWS_REGION={{AWS_REGION}}
DYNAMODB_TABLE_NAME={{DYNAMODB_TABLE_NAME}}
ENVIRONMENT

cat > /etc/url-shortener/deployment.env <<'DEPLOYMENT'
AWS_REGION={{AWS_REGION}}
RUNTIME_SECRET_ID={{RUNTIME_SECRET_ID}}
REPOSITORY_NAME={{REPOSITORY_NAME}}
REPOSITORY_URI={{REPOSITORY_URI}}
LOG_GROUP_NAME={{LOG_GROUP_NAME}}
DEPLOYMENT

cat > /usr/local/bin/start-current-url-shortener <<'BOOTSTRAP'
#!/usr/bin/env bash
set -euo pipefail

source /etc/url-shortener/deployment.env

IMAGE_URI="$REPOSITORY_URI:current"
aws ecr describe-images \
  --region "$AWS_REGION" \
  --repository-name "$REPOSITORY_NAME" \
  --image-ids imageTag=current \
  >/dev/null

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

REGISTRY_URI="${REPOSITORY_URI%/*}"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY_URI"

docker pull "$IMAGE_URI"
docker rm --force url-shortener-server 2>/dev/null || true
docker run --detach \
  --name url-shortener-server \
  --restart unless-stopped \
  --env-file /etc/url-shortener/server.env \
  --log-driver awslogs \
  --log-opt awslogs-region="$AWS_REGION" \
  --log-opt awslogs-group="$LOG_GROUP_NAME" \
  --log-opt awslogs-stream="server-$(hostname)" \
  --publish {{PORT}}:{{PORT}} \
  "$IMAGE_URI"
BOOTSTRAP

chmod +x /usr/local/bin/start-current-url-shortener
/usr/local/bin/start-current-url-shortener || true
