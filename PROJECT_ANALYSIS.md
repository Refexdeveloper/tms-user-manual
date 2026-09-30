# Refex Travel Management System (TMS) — Full Project Analysis

**Repository:** [github.com/Refexdeveloper/tms-user-manual](https://github.com/Refexdeveloper/tms-user-manual)  
**Kissflow app:** `Expense_and_Travel_Management_A00` (`refexgroup.kissflow.com`)  
**Live custom app:** https://refex-tms-dhwffeu7pq-el.a.run.app  
**Flight search API:** https://refex-tms-flightsearch-dhwffeu7pq-el.a.run.app

---

## How to get a full local copy on your Mac

This analysis was produced on a cloud machine, so files cannot be written directly to
`/Users/mohamedaasik/Desktop/Cursor/Travel_Management`.

Run this once on your Mac:

```bash
mkdir -p "/Users/mohamedaasik/Desktop/Cursor"
cd "/Users/mohamedaasik/Desktop/Cursor"
git clone https://github.com/Refexdeveloper/tms-user-manual.git Travel_Management
cd Travel_Management
```

That folder will contain **every file in this repository** (code, BRDs, user manual, screenshots).

To refresh later:

```bash
cd "/Users/mohamedaasik/Desktop/Cursor/Travel_Management"
git pull origin main
```

---

## What this project is

This is the **Refex / Venwind Expense & Travel Management System** (TMS), also branded **RefexOne Travel Management**.

It is a **monorepo of documentation + working software**, not a single app. Together the pieces cover:

1. **Travel Booking / Travel Request** — raise a business trip (Air, Train, Bus, Cab, Hotel).
2. **Travel Advance** — request funds against an approved trip.
3. **Travel Expense** — claim bills after the trip (OCR in Kissflow; simplified in the custom app).

**Kissflow is the system of record** for workflow, approvals, and business data. Custom React UIs sit on top of it (either as Kissflow custom pages/components, or as a GCP Cloud Run app that talks to Kissflow through a server BFF).

Two companies share the same product pattern: **Refex** and **Venwind**. There are two V1.3 BRD PDFs (one per company). Kissflow forms even have a “This is Venwind Travel Request form” flag.

---

## Inventory at a glance

| Item | What it is | Size / scale |
|------|------------|----------------|
| Whole repo | ~245 files, ~31k lines of JS/JSX/CSS | ~40 MB without `.git` |
| `refex-tms/` | Standalone React + Node TMS (GCP Cloud Run) | 68 files |
| `employee-dashboard-v2/` | Kissflow **Page** — employee home | 34 files |
| `approvers-dashboard-v2/` | Kissflow **Page** — approver home | 29 files |
| `refex-tms-new-booking-kf-form/` | Kissflow **Form** — full travel request UI | 18 files |
| `refex-tms-travel-booking-kf-component/` | Kissflow **Form Field** — one-screen booking | 19 files |
| `refex-tms-flightsearch/` | Kissflow **Form Field** — live flight search | 19 files (~6k-line FormField) |
| Root PDFs / DOCX | BRDs, Phase-1 BRD, user manual, Kissflow guide | 5 documents |
| `TMS/` | Product screenshots (Aug 2026) | 17 images |
| `Travel Request Screen shots/` | Live Kissflow form designer shots (Sep 2026) | 35 images |

There is **no root `package.json`**. Each app is installed and built separately.

---

## How the pieces fit together

```text
                         ┌─────────────────────────────────────┐
                         │  Kissflow (authoritative workflow)  │
                         │  App: Expense_and_Travel_Management │
                         │                                     │
                         │  Travel_Management_A02              │
                         │  Advance_Payment_Request_Process    │
                         │  Expense_Management_A03             │
                         └──────────────▲──────────────────────┘
                                        │ REST / kf.api / SDK
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
 ┌────────┴────────┐          ┌─────────┴─────────┐         ┌────────┴────────┐
 │ Kissflow Pages  │          │ Kissflow Forms /  │         │ GCP Cloud Run   │
 │ employee-       │          │ Form Fields       │         │ refex-tms       │
 │ dashboard-v2    │          │ new-booking form  │         │ React + Express │
 │ approvers-      │          │ travel-booking    │         │ BFF + SQLite    │
 │ dashboard-v2    │          │ flightsearch      │         │ live: Cloud Run │
 └────────┬────────┘          └─────────┬─────────┘         └────────┬────────┘
          │                             │                            │
          │ openPopup(Travel / Advance / Expense)                    │
          │                             │                            │
          └─────────────────────────────┴────────────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │ Travolution via Cloud Run   │
                         │ refex-tms-flightsearch      │
                         │ /api/flights/search         │
                         │ /api/airports               │
                         └─────────────────────────────┘
```

**Two UI strategies exist in parallel:**

| Strategy | Where | When used |
|----------|--------|-----------|
| **A — Kissflow-hosted custom UI** | Dashboards + form/field ZIPs uploaded into Kissflow | Production employee/approver experience inside RefexOne |
| **B — External GCP app** | `refex-tms` on Cloud Run | Standalone TMS with mock login; BFF creates/submits Kissflow items. Documented as “Option B” |

---

## 1. Business modules (what users actually do)

### Module 1 — Travel Booking

Employee raises a trip.

Typical path:

1. Open **Travel Booking** (dashboard card, Kissflow popup, or GCP `/new`).
2. Requester details auto-fill (name, employee ID, email, department, manager, cost centre).
3. Choose **purpose** (Business trip, Event, Conference, Customer visit, Sales meet, Exhibition).
4. Choose **mode**: Flight, Train, Bus, Cab, Hotel, Flight+Hotel.
5. Domestic / International, One Way / Round Trip / Multi-city.
6. For Air: live search (Travolution) → select flight(s). Policy: book **15 days** before departure.
7. Save draft or Submit.
8. Kissflow workflow continues (see workflow below).
9. After booking: upload boarding pass; modifications allowed until **8 hours** before boarding (Air, in `refex-tms`).

**Live Kissflow Travel Request form** (from Sep 2026 screenshots) includes:

- Travel Request ID, modify-existing-request lookup
- Purpose, multi-city, travel mode, eligible mode
- Trip type, Domestic/International, visa, exceptional case, Venwind flag
- Flight-search analytics fields (`FS_Departure_Date`, `FS_From_City`, `FS_Booking_Amount_1`, policy fields, etc.)

### Module 2 — Travel Advance

Request money **before** the trip against an already-approved Travel Request.

- Link to travel → amount (INR) → remarks → Submit
- Kissflow path (from product screenshots):  
  Start → L1 Manager → **Venwind Validation** → Management → Finance Approver → Advance Settlement → Treasury Execution → Completed
- Simplified `refex-tms` path: Employee → L1 → Finance → Release

Settlement rule from the user manual:

- Advance ₹10,000 vs expenses ₹8,000 → employee returns ₹2,000
- Advance ₹10,000 vs expenses ₹12,000 → Finance pays ₹2,000 extra

### Module 3 — Travel Expense

Claim after the trip.

- Types: Food, Accommodation, Travel Ticket, Local Conveyance
- Upload bills; Kissflow OCR fills a table (user must verify — OCR is not 100%)
- Bulk PDF for same-category bills
- Path: Employee → Manager → Finance validation → Final settlement

---

## 2. Kissflow processes and IDs

| Domain | Process ID | All-items report | Employee create popup |
|--------|------------|------------------|------------------------|
| Travel | `Travel_Management_A02` | `All_Items_A00` | `Popup_rCILSrY8KF` |
| Advance | `Advance_Payment_Request_Process_A01` | `ALL_ITEMS_WITH_TABLE_A00` | `Popup_J0C5lIdWCL` |
| Expense | `Expense_Management_A03` | `All_Items_MK_A00` | `Popup_E4xarw8lLE` |

| Page | Kissflow page ID |
|------|------------------|
| Employee dashboard | `Employee_Dashboard_V2_A00` |
| Approver dashboard | `Approver_Dashboard_V2_A00` |

Account ID used in code: `AcCMptlq60zH`.

---

## 3. Workflows

### Travel request (Kissflow live status, from `TMS/travel request.png`)

1. Start (Draft)
2. Travel Desk — Shares Booking Options (Praveen V, Sujitha Nagarajan)
3. Employee — Confirmation of Booking Option
4. Manager — Cost Approval (Srivaths Varadharajan)
5. Management Approval (Archit Khemka, Anirudh Khemka)
6. Travel Desk — Booking Confirmation
7. Boarding Pass

### Travel request (simplified engine inside `refex-tms`)

**Air:** Draft → L1 → Travel Desk (book / suggest) → Boarding Pass → Booked → Closed  
(+ modification loop: Travel Desk → L1, cutoff 8 hours before boarding)

**Non-Air (Train/Bus/Cab/Stay):** Draft → L1 → Travel Desk shares options → Employee selects → Booked → Closed

The standalone app **does not model** Kissflow’s extra Management / Venwind Validation steps. Those exist only in Kissflow.

### Advance (Kissflow, from `TMS/advance.png`)

Start → L1 Manager → Venwind Validation (Vinod Kumar) → Management → Finance Approver → Advance Settlement → Treasury Execution (Tapas Das) → Completed

---

## 4. Folder-by-folder analysis

### `refex-tms/` — standalone TMS (the largest code product)

**Stack:** Node 20+, npm workspaces, React 18 + Vite 6 + React Router 7, Express, JWT, `node:sqlite` (local) or Postgres (Cloud SQL), GCS for attachments, Docker → Cloud Run.

**Run locally:**

```bash
cd refex-tms
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

- UI: http://localhost:5173  
- API: http://localhost:8080/api/health  

**Mock users (no SSO yet):**

| Role | Email | Name |
|------|--------|------|
| Employee | gowtham@refex.com | Gowtham S |
| L1 Manager | srivaths@refex.com | Srivaths Varadharajan |
| Travel Desk | praveen@refex.com | Praveen V |
| Travel Desk | sujitha@refex.com | Sujitha Nagarajan |
| Finance | tapas@refex.com | Tapas Das |

**Web routes:**

| Path | Screen |
|------|--------|
| `/login` | Mock-user picker |
| `/` | My Trip (mode cards: Flight, Train, Bus, Flight+Hotel, Hotel, Cab; Visa coming soon) |
| `/dashboard` | Unified Me / My Team KPIs |
| `/new` | New travel request (search + review + submit to Kissflow if enabled) |
| `/requests/:id` | Request detail + timeline |
| `/inbox` | Approver / Travel Desk queue |
| `/advances`, `/advances/new`, `/advances/:id` | Advance module |
| `/expenses`, `/expenses/new`, `/expenses/:id` | Expense module |

**API (high level):** auth, requests + workflow actions, travel-desk options, attachments/boarding pass, flight search proxy, places search, dashboard, advances, expenses, Kissflow BFF (`/api/kissflow/travel`).

**SQLite tables:** `users`, `travel_requests`, `workflow_events`, `travel_desk_options`, `attachments`, `advances`, `expenses`, `activity_log`.

**Deploy:** `scripts/deploy-gcp.sh` → project `master-diorama-489103-u2`, region `asia-south1`. Secrets: Kissflow key id/secret, JWT secret. SQLite on Cloud Run is ephemeral (`/tmp`); Kissflow remains source of truth.

**Design tokens (`DESIGN.md`):** Inter + Plus Jakarta Sans, Remix Icon, primary `#1E88E5`, background `#F3F6FB`. Aligned with Refex Project Management Kissflow components.

---

### `employee-dashboard-v2/` — Kissflow employee page

Uploaded as a Kissflow **Page** custom component (`npm run zip`).

Uses `@kissflow/lowcode-client-sdk`. Reads process reports via `kf.api(...)` (Kissflow session; **no API keys in the browser**).

**What the live dashboard shows** (matches `TMS/` Aug 2026 screenshots):

- Greeting, **Me / My Team** toggle
- KPI cards: Travel Booking, Travel Advance, Travel Expense
- Monthly trends chart
- Upcoming trips
- Quick actions: Create Travel Request, Request Advance, Submit Expense, View Pending Approvals
- Opens Kissflow popups (`Popup_rCILSrY8KF`, `Popup_J0C5lIdWCL`, `Popup_E4xarw8lLE`)
- Link to Approver dashboard page for L1 users

**Note:** `package.json` also lists Stripe, Supabase, Firebase, i18next. Those are leftover template deps; the landing page does not implement those products.

---

### `approvers-dashboard-v2/` — Kissflow approver page

Same zip-and-upload pattern. Focused on **My Tasks**:

- Pending counts for Travel / Advance / Expense
- Exception flags
- SLA deadlines (nearing = 48 hours)
- Preference POST to force approver table columns
- Opens the assigned instance popup for approve / reject

---

### `refex-tms-new-booking-kf-form/` — Kissflow Form (full request UI)

Priority-1 replacement for native Kissflow Travel Request fields.

- Type **Form** (not Form Field)
- Writes via `kf.context.updateField` using FieldIds such as `Purpose_of_Travel`, `FS_From_City`, `Mode_of_Transport`
- Includes flight search against Travolution Cloud Run
- Hotel / Cab / Train / Bus request details
- Business lines: Refex, Venwind, Refex Green Mobility

---

### `refex-tms-travel-booking-kf-component/` — one-form booking field

Kissflow **Form Field**. One screen: mode + requester + purpose + trip + optional live flight search.

- **Must not** call `kf.context.updateField` from the iframe
- Writes JSON with `actions.updateValue(...)`
- Parent form **onChange** maps `formFieldMap` into process fields (`docs/FIELD_MAPPING.md`, `docs/kissflow-onchange.js`)
- Modes: Flight, Train, Bus, Flight+Hotel, Hotel, Cab

---

### `refex-tms-flightsearch/` — dedicated flight search field

The deepest Air UX (FormField.jsx is several thousand lines).

- One Way / Round Trip / Multi-city
- Languages: English, Hindi, Tamil, Telugu, Kannada, Odia, Bengali, Marathi, Gujarati
- 15-day advance booking policy banner
- Round trip: must select **exactly one onward and one return** (sectorIndex 0 vs 1)
- Writes selected-flight JSON; Kissflow onChange fills hidden `FS_*` analytics fields
- Demo screenshots under `docs/demo-screenshots/`

---

### Documents at repo root

| File | Role |
|------|------|
| `RefexOne_Travel_Request_BR_D_Phase_1.docx` | Phase 1 BRD: Travel Request only; MMT-inspired UX; keep Kissflow workflow |
| `BRD_Implementation of Refex Expense & Travel management system_V1.3.pdf` | Full Refex BRD v1.3 |
| `BRD_Implementation of Expense & Travel management system - Venwind_V1.3.pdf` | Same product for Venwind |
| `Travel Request and Expense Management System - User Manual.docx` | End-user guide for Booking, Advance, Expense |
| `Kissflow_Custom_UI_Integration_Guide_v1.2_Generic.docx` | Architecture rule: custom UI + BFF; Kissflow stays backend; no keys in the browser |

---

### Screenshot folders

**`TMS/`** — product UI (26 Aug 2026): dashboard, travel request form, flight search, status timelines for travel and advance.

**`Travel Request Screen shots/`** — Kissflow form designer (21 Sep 2026): Travel Request-Refex fields, FS_* flight analytics, policy fields, workflow/permission tabs.

---

## 5. Tech stack summary

| Layer | Technology |
|-------|------------|
| Kissflow pages / forms | React 18, Vite 5, Tailwind (dashboards), `@kissflow/lowcode-client-sdk` |
| Kissflow form fields | `@kissflow/form-field-scripts`, React, no `window`/`document`/`fetch` (use `globalThis.fetch`) |
| Standalone TMS web | React 18, Vite 6, React Router 7, Inter / Remix Icon |
| Standalone TMS API | Express, JWT, nanoid, multer, node:sqlite, pg, @google-cloud/storage |
| Flight inventory | Travolution, proxied by existing Cloud Run |
| Hosting | Kissflow (pages/components) + GCP Cloud Run `asia-south1` |
| Local DB | SQLite file |
| Prod DB (intended) | Cloud SQL Postgres (not required while Kissflow is SoR) |
| Files | Local `./uploads` or GCS bucket |

---

## 6. What is implemented vs Phase 1 BRD

Phase 1 BRD (`RefexOne_Travel_Request_BR_D_Phase_1.docx`) **intentionally excludes** Advance, Expense, OCR, full Travel Desk ops, boarding pass, finance settlement.

The **codebase already goes beyond Phase 1**:

| Capability | Kissflow product | `refex-tms` | KF form/field components |
|------------|------------------|-------------|---------------------------|
| My Trip / mode cards | Yes (dashboard) | Yes | Yes |
| Air search One Way / RT / Multi-city | Yes (flightsearch field) | Yes (simpler) | Yes |
| Train / Bus / Cab / Hotel capture | Yes | Yes | Partial (booking component) |
| Draft + Submit | Yes | Yes | Yes |
| L1 approve / reject / modify | Yes | Yes | N/A (workflow in Kissflow) |
| Travel Desk options + employee select | Yes | Yes | N/A |
| Boarding pass upload | Yes (Kissflow step) | Yes | No |
| Travel Advance | Yes | Yes (simpler stages) | Dashboard popup only |
| Travel Expense + OCR | Yes (Kissflow OCR) | Yes (manual lines, no OCR) | Dashboard popup only |
| SSO | Kissflow session | Mock users only | Kissflow session |
| iPad / mobile-specific shells | Responsive CSS | Responsive CSS | Form-field web + pwa folders |

---

## 7. Security notes (from the repo’s own docs)

- Kissflow access keys belong **only** on the server / GCP Secret Manager.
- Dashboards use `kf.api` with the logged-in Kissflow session.
- Form-field iframes must not call `kf.context.updateField`.
- `.gitignore` already excludes `.env`, credentials, sqlite, uploads.
- `DEPLOY.md` says: rotate any key that was pasted into chat.

---

## 8. Suggested mental model for local work

If you open `/Users/mohamedaasik/Desktop/Cursor/Travel_Management` after cloning:

1. Read this file and `refex-tms/README.md`.
2. To **run a full app locally**, use `refex-tms` (`npm run dev`).
3. To **change the live RefexOne dashboard**, edit `employee-dashboard-v2` or `approvers-dashboard-v2`, then `npm run zip` and upload in Kissflow.
4. To **change the travel form inside Kissflow**, edit `refex-tms-new-booking-kf-form` (full form) or the two form-field packages.
5. Treat the PDFs/DOCX + screenshot folders as the business spec; treat Kissflow as production workflow; treat `refex-tms` as the external / GCP UI.

---

## 9. Related repos mentioned in code (not in this folder)

| Repo / service | Role |
|----------------|------|
| `services_refex-tms-flightsearch` | Cloud Run Travolution proxy (live URL above) |
| `refex-tms-flightsearch-kf-component` | Same as `refex-tms-flightsearch/` in this monorepo |
| ProjectManagement_KF_Components | Design-system reference for cards/shell |
