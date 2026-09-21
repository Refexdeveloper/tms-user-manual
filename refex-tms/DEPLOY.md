# Refex TMS — Local & GCP Deployment (Option B)

Custom UI + BFF on **Cloud Run**. Kissflow `Travel_Management_A02` remains the workflow backend.

## Live URL

**https://refex-tms-dhwffeu7pq-el.a.run.app**

- Health: `/api/health` → `kissflow.enabled: true`
- UI + API share this one URL

## Architecture

```text
Browser → Cloud Run refex-tms (React + Express BFF)
                ↓ Kissflow REST (secrets in Secret Manager)
         Travel_Management_A02 CREATE → SUBMIT → existing workflow
                ↓
         Flight search Cloud Run (unchanged)
```

## Raise a travel request

1. Open https://refex-tms-dhwffeu7pq-el.a.run.app
2. Login (mock user, e.g. Gowtham)
3. New Travel Request → Air → search → select → **Submit**
4. Confirm item in Kissflow All Items — workflow continues as before

## Redeploy

```bash
cd refex-tms
# Ensure .env has KISSFLOW_ACCESS_KEY_ID / SECRET
bash scripts/deploy-gcp.sh
```

Creates/uses secrets:

- `refex-tms-kissflow-key-id`
- `refex-tms-kissflow-key-secret`
- `refex-tms-jwt-secret`

Project: `master-diorama-489103-u2` · Region: `asia-south1`

## Local development

```bash
cp .env.example .env   # fill Kissflow keys
npm install
npm run db:seed
npm run dev
```

## Notes

- SQLite on Cloud Run is ephemeral (`/tmp`) — Kissflow is the system of record.
- Never put Kissflow keys in the browser or Vite env.
- Rotate any key that was shared in chat; update Secret Manager versions.
