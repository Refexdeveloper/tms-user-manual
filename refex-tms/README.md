# Refex Travel Management System (TMS)

External Travel Request app for Refex — React + Node, mock users now, SSO later.

## Quick start (local)

```bash
cd refex-tms
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

- App UI: http://localhost:5173  
- API: http://localhost:8080/api/health  

### Mock users
| Role | Email |
|---|---|
| Employee | gowtham@refex.com |
| L1 Manager | srivaths@refex.com |
| Travel Desk | praveen@refex.com |

## Single URL (prod-like)

```bash
npm run build
npm run start
# http://localhost:8080
```

## GCP

See [DEPLOY.md](./DEPLOY.md):

- **One Cloud Run service** → frontend + `/api` on same URL  
- **Separate Cloud SQL** PostgreSQL  
- **Separate GCS bucket** for boarding passes / attachments  
- Existing **Flight Cloud Run** for Air search only  

## Modules (Phase 1+)

- **Dashboard** — unified Me / My Team view (from Kissflow employee + approver dashboards)
- **Travel Booking** — Air live search + Train/Bus/Cab/Stay · workflow to boarding pass
- **Travel Advance** — link travel → L1 → Finance → Release
- **Travel Expense** — types + bill lines → L1 → Finance → Settlement

Mock users: Employee, L1 Manager, Travel Desk, Finance.