#!/usr/bin/env bash
# Deploy Refex TMS UI+BFF to Cloud Run (Option B → Kissflow Travel_Management_A02)
set -euo pipefail

PROJECT="${GCP_PROJECT:-master-diorama-489103-u2}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE="${SERVICE_NAME:-refex-tms}"
REPO="${ARTIFACT_REPO:-cloud-run-source-deploy}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${SERVICE}:$(date +%Y%m%d-%H%M%S)"
IMAGE_LATEST="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${SERVICE}:latest"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Project: $PROJECT  Region: $REGION"
echo "==> Image:   $IMAGE"

load_env() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      export "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}"
    fi
  done < "$file"
}

load_env .env

# Ensure Kissflow secrets exist (create from local .env if missing)
ensure_secret() {
  local name="$1" value="$2"
  if gcloud secrets describe "$name" --project="$PROJECT" >/dev/null 2>&1; then
    echo "Secret $name exists"
  else
    printf '%s' "$value" | gcloud secrets create "$name" --project="$PROJECT" --data-file=-
    echo "Created secret $name"
  fi
}

: "${KISSFLOW_ACCESS_KEY_ID:?Set KISSFLOW_ACCESS_KEY_ID in .env}"
: "${KISSFLOW_ACCESS_KEY_SECRET:?Set KISSFLOW_ACCESS_KEY_SECRET in .env}"

ensure_secret "refex-tms-kissflow-key-id" "$KISSFLOW_ACCESS_KEY_ID"
ensure_secret "refex-tms-kissflow-key-secret" "$KISSFLOW_ACCESS_KEY_SECRET"
ensure_secret "refex-tms-jwt-secret" "${JWT_SECRET:-refex-tms-prod-$(openssl rand -hex 16)}"

echo "==> Building & pushing image"
gcloud builds submit --project="$PROJECT" --tag="$IMAGE" .
gcloud container images add-tag "$IMAGE" "$IMAGE_LATEST" --quiet

echo "==> Deploying Cloud Run service $SERVICE"
gcloud run deploy "$SERVICE" \
  --project="$PROJECT" \
  --region="$REGION" \
  --image="$IMAGE" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=300 \
  --set-env-vars="NODE_ENV=production,DATABASE_URL=file:/tmp/tms.sqlite,STORAGE_DRIVER=local,LOCAL_UPLOAD_DIR=/tmp/uploads,FLIGHT_API_BASE=https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app,KISSFLOW_DOMAIN=https://refexgroup.kissflow.com,KISSFLOW_ACCOUNT_ID=AcCMptlq60zH,KISSFLOW_APP_ID=Expense_and_Travel_Management_A00,KISSFLOW_TRAVEL_PROCESS_ID=Travel_Management_A02" \
  --set-secrets="KISSFLOW_ACCESS_KEY_ID=refex-tms-kissflow-key-id:latest,KISSFLOW_ACCESS_KEY_SECRET=refex-tms-kissflow-key-secret:latest,JWT_SECRET=refex-tms-jwt-secret:latest"

URL="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
echo ""
echo "==> Deployed: $URL"
echo "==> Health:   $URL/api/health"
curl -sS "$URL/api/health" || true
echo ""
