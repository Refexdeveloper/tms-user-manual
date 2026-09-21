# Kissflow Integration — Option B (GCP UI + Kissflow backend)

Custom UI runs in GCP (or local `refex-tms`). Kissflow `Travel_Management_A02` remains the workflow and data authority. The browser never holds Kissflow access keys.

## Architecture

```
Custom UI (React)
  → HTTPS → BFF (refex-tms API / Cloud Run)
  → Kissflow REST (X-Access-Key-Id / X-Access-Key-Secret)
  → Travel_Management_A02 CREATE → SUBMIT → existing workflow
```

## Env (server only)

```
KISSFLOW_DOMAIN=https://refexgroup.kissflow.com
KISSFLOW_ACCOUNT_ID=AcCMptlq60zH
KISSFLOW_APP_ID=Expense_and_Travel_Management_A00
KISSFLOW_TRAVEL_PROCESS_ID=Travel_Management_A02
KISSFLOW_ACCESS_KEY_ID=...
KISSFLOW_ACCESS_KEY_SECRET=...
```

Store secrets in GCP Secret Manager in production. Rotate any key that was pasted into chat.

## BFF endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/kissflow/status` | Is Kissflow configured? |
| POST | `/api/kissflow/travel` | CREATE (+ SUBMIT by default) |
| POST | `/api/kissflow/travel/:instanceId/submit` | Submit existing draft |
| POST | `/api/kissflow/travel/:instanceId/actions` | `submit` / `approve` / `reject` / `sendback` |
| GET | `/api/kissflow/travel` | Admin list (server-scoped) |
| GET | `/api/kissflow/travel/:instanceId` | Detail |

### Create + submit body

Send the same travel request shape used by `POST /api/requests`, or `{ fields: { FieldId: value }, submit: true }`.

BFF maps to FieldIds (`Purpose_of_Travel`, `FS_*`, etc.) then:

1. `POST /process/2/{account}/{Travel_Management_A02}`
2. Captures `instance_id` + `activity_instance_id`
3. `POST .../{instance}/{activity}/submit`

### Action body

```json
{
  "action": "reject",
  "activityInstanceId": "...",
  "comment": "Policy breach — needs revision"
}
```

## UI behaviour

`NewRequestPage` Submit:

1. Saves local draft (optional cache)
2. If Kissflow is enabled, calls `POST /api/kissflow/travel` with `submit: true`
3. Kissflow workflow continues unchanged

## Deploy on GCP

1. Build web + run API as one Cloud Run service (`npm start` serves `web/dist`)
2. Mount secrets as env vars
3. Point `CORS_ORIGIN` / load balancer at the UI host
4. Smoke test: `GET /api/health` → `kissflow.enabled: true`, then one Domestic Air create+submit

## Source of truth IDs

- App: `Expense_and_Travel_Management_A00`
- Process: `Travel_Management_A02`
- Report: `All_Items_A00`
- Create popup (legacy Kissflow UI): `Popup_rCILSrY8KF`
