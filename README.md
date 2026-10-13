# TMS Kissflow dashboards

## Latest source

Use these folders. Do not use `Raghul/` or `murugesh's code/` copies.

| App | Latest source | Kissflow page type |
|-----|---------------|--------------------|
| Approvers | `approvers-dashboard-v2/` | Page |
| Employee | `employee-dashboard-v2/` | Page |
| Expense | `expense-management-og/` | Page |

## Latest Kissflow zips

Dated folders hold `npm run zip` builds. **Latest: `13102026/`** (13 Oct 2026).

| App | Zip in `13102026/` |
|-----|--------------------|
| Approvers | `approvers-dashboard-v2.zip` |
| Employee | `employee-dashboard-v2.zip` |
| Expense | `expense-management-og.zip` |

Older zip folders: `06102026/`, `30092026/`. `*.zip` is gitignored — rebuild locally.

```bash
cd approvers-dashboard-v2 && npm install && npm run zip
cd ../employee-dashboard-v2 && npm install && npm run zip
cd ../expense-management-og && npm install && npm run zip
```
