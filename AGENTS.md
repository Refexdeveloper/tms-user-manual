# Agent instructions — Refex TMS (tms-user-manual)

This folder is the Refex / Venwind **Travel Management System** monorepo (Travel Booking, Travel Advance, Travel Expense).

Local unzip path on Mohamed’s Mac:

`/Users/mohamedaasik/Desktop/Cursor/Travel_Management/tms-user-manual-main`

GitHub: `https://github.com/Refexdeveloper/tms-user-manual` (private).

There is **no root package.json**. Each app is its own project. Only change the package that matches the task.

## Which folder to edit

| Task | Folder |
|------|--------|
| Standalone TMS UI/API (GCP Cloud Run) | `refex-tms/` |
| Employee home in Kissflow | `employee-dashboard-v2/` |
| Approver home in Kissflow | `approvers-dashboard-v2/` |
| Full Travel Request form in Kissflow | `refex-tms-new-booking-kf-form/` |
| One-screen booking form field | `refex-tms-travel-booking-kf-component/` |
| Live flight search form field | `refex-tms-flightsearch/` |
| Specs / screenshots | root PDFs, DOCX, `TMS/`, `Travel Request Screen shots/` |

Read `PROJECT_ANALYSIS.md` for the full map. Package-specific rules: `refex-tms-flightsearch/AGENTS.md` and `refex-tms-travel-booking-kf-component/AGENTS.md`.

## Product facts

- Kissflow is the workflow system of record. App: `Expense_and_Travel_Management_A00`.
- Travel process: `Travel_Management_A02`. Advance: `Advance_Payment_Request_Process_A01`. Expense: `Expense_Management_A03`.
- Live TMS: `https://refex-tms-dhwffeu7pq-el.a.run.app`
- Flight search: `https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app`
- Never put Kissflow access keys in the browser, Vite env, or committed files.

## Kissflow form-field rules

In `refex-tms-flightsearch` and `refex-tms-travel-booking-kf-component`:

- Write values with `actions.updateValue(...)` only.
- Do **not** call `kf.context.updateField` from the iframe.
- Do not use `window`, `document`, or bare `fetch` — use `globalThis.fetch`.

Dashboards and `refex-tms-new-booking-kf-form` **may** use the Kissflow SDK (`kf.api`, `kf.context.updateField`, `openPopup`).

## Run the standalone app

```bash
cd refex-tms
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

- UI: http://localhost:5173
- API health: http://localhost:8080/api/health

Mock logins: `gowtham@refex.com` (employee), `srivaths@refex.com` (L1), `praveen@refex.com` (travel desk), `tapas@refex.com` (finance).

Kissflow keys in `.env` are optional. Empty keys = local SQLite workflow only.

## Kissflow ZIP uploads

In `employee-dashboard-v2`, `approvers-dashboard-v2`, and `refex-tms-new-booking-kf-form`: `npm install && npm run zip`.

In the two form-field packages: `npm install && npm run build && npm run zip`.

Do not deploy, publish, or upload to Kissflow/GCP unless the user explicitly asks.

## Design

`refex-tms/DESIGN.md`: Inter, Remix Icon, primary `#1E88E5`, page background `#F3F6FB`, white cards.
