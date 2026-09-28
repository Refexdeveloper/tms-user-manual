/** Browser-only preview — used when the Kissflow SDK is not available. */

const ACCOUNT_ID = 'AcPreview'
const USER_ID = 'UserPreview'
const USER_EMAIL = 'priya.nair@refex.com'
const USER_NAME = 'Priya Nair'
const APP_ID = 'Expense_and_Travel_Management_A00'

const PROCESSES = {
  travel: 'Travel_Management_A02',
  advance: 'Advance_Payment_Request_Process_A01',
  expense: 'Expense_Management_A03',
}

const STEPS = [{ _id: 'act-review', StepName: 'Manager Review', Count: 5 }]

const iso = (ms) => new Date(ms).toISOString()
const now = Date.now()

function person(name = USER_NAME) {
  return { _id: USER_ID, Name: name, name, Email: USER_EMAIL }
}

function colsFromRow(row) {
  return Object.keys(row)
    .filter((id) => !id.startsWith('_') || id === '_current_step' || id === '_status')
    .map((Id) => ({
      Id,
      Name: Id.replace(/^Column_/, '').replace(/_/g, ' '),
      Type: /date|deadline|created/i.test(Id) ? 'DateTime' : 'String',
    }))
}

function expenseRow(i, extras = {}) {
  const statuses = ['In Progress', 'Draft', 'Completed', 'Rejected', 'Withdrawn']
  const types = ['Food', 'Local Conveyance', 'Allowance', 'Hotel']
  const status = extras.status || statuses[i % statuses.length]
  const sla =
    extras.sla === 'breached'
      ? now - 36 * 3600000
      : extras.sla === 'nearing'
        ? now + 20 * 3600000
        : now + (3 + i) * 86400000
  const created = now - (i + 4) * 86400000
  return {
    _id: `exp-${100 + i}`,
    _activity_instance_id: `act-inst-exp-${i}`,
    _current_assigned_to: [person()],
    _current_step: extras.step || 'Manager Review',
    _status: status,
    'Column_9Y8-uPPDVi': `EXP-2026-${String(200 + i).padStart(3, '0')}`,
    'Column_gJidmn-kAv': iso(created),
    Column_rCBEwniBuE: person(),
    'Column_XcXTxxA4-C': types[i % types.length],
    Column_Nvns1CPpfI: 8500 + i * 1200,
    Column_UyJCJpXn5Y: 8500 + i * 1200,
    Column_bzLJNkKQZO: extras.step || 'Manager Review',
    'Column_KD_a7365Yi': iso(sla),
    Column_nEtxbnvlrc: status,
    Column_OpIELajxeZ: USER_EMAIL,
    Column_Q3pwSWdDMB: iso(created),
    Column_YurZEJAmpg: 8500 + i * 1200,
    Column__hqtAn5Ntn: extras.exception ? 'Yes' : 'No',
    Expense_ID: `EXP-2026-${String(200 + i).padStart(3, '0')}`,
    Expense_Date: iso(created),
    _created_by: person(),
    Expense_Type: types[i % types.length],
    Total_Claimable_Amount: 8500 + i * 1200,
    SLA_Deadline: iso(sla),
    current_step_status: status,
  }
}

function advanceRow(i, extras = {}) {
  const statuses = ['In Progress', 'Draft', 'Approved', 'Rejected']
  const status = extras.status || statuses[i % statuses.length]
  const sla =
    extras.sla === 'breached'
      ? now - 12 * 3600000
      : extras.sla === 'nearing'
        ? now + 30 * 3600000
        : now + (5 + i) * 86400000
  const created = now - (i + 2) * 86400000
  return {
    _id: `adv-${100 + i}`,
    _activity_instance_id: `act-inst-adv-${i}`,
    _current_assigned_to: [person()],
    _current_step: extras.step || 'Manager Review',
    _status: status,
    Column_gmgjecOFBH: `ADV-2026-${String(300 + i).padStart(3, '0')}`,
    Column_RmtnLwNoFB: iso(created),
    Column_9XVj5RhJI0: person(),
    Column_ctQorHPmAU: `TRV-2026-${String(100 + i).padStart(3, '0')}`,
    'Column_rMCWa-_7NO': 12000 + i * 1500,
    Column_LTs78WRTDp: extras.step || 'Manager Review',
    'Column_Wc-2EfDPkD': iso(sla),
    Column_V1IbWdYHUL: USER_EMAIL,
    Column_p9wbFBO6NA: status,
    Column_PdcYkpz3ei: status,
    Column_ke6yUOIhtC: extras.exception ? 'Yes' : 'No',
    Advance_Request_ID: `ADV-2026-${String(300 + i).padStart(3, '0')}`,
    Requested_Date: iso(created),
    created_by_user_id: person(),
    List_of_Travel_Requests_lookup: `TRV-2026-${String(100 + i).padStart(3, '0')}`,
    Advance_amount_value: 12000 + i * 1500,
    SLA_Deadline: iso(sla),
    Exception_Case: extras.exception ? 'Yes' : 'No',
  }
}

function travelRow(i, extras = {}) {
  const statuses = extras.status || ['In Progress', 'Booked', 'Draft', 'Completed'][i % 4]
  const sla =
    extras.sla === 'breached'
      ? now - 8 * 3600000
      : extras.sla === 'nearing'
        ? now + 18 * 3600000
        : now + (6 + i) * 86400000
  const departure = extras.departure || now + (8 + i * 3) * 86400000
  const created = now - (i + 6) * 86400000
  const types = ['oneWay', 'roundTrip', 'multiCity']
  const cities = [
    ['Chennai', 'Bengaluru'],
    ['Delhi', 'Mumbai'],
    ['Hyderabad', 'Pune'],
    ['Kolkata', 'Chennai'],
  ]
  const [from, to] = cities[i % cities.length]
  return {
    _id: `trv-${100 + i}`,
    _activity_instance_id: `act-inst-trv-${i}`,
    _current_assigned_to: [person()],
    _current_step: extras.step || 'Manager Review',
    _status: statuses,
    'Column_DRz-V78ZHe': `TRV-2026-${String(100 + i).padStart(3, '0')}`,
    Column_HQjIt021s2: iso(departure),
    Column_T7yk_UT6Hk: iso(departure),
    Column_MfwZaTYIE8: person(),
    Column_1qX1HxE34f: from,
    Column_6VWxLVKxdg: to,
    Column_S7qHj2qlIJ: 18500 + i * 2200,
    'Column_z0s-oAG3rN': extras.step || 'Manager Review',
    'Column_3l8DHla3JD': iso(sla),
    Column_WHUJTy6aCd: types[i % types.length],
    Column_emdSnf_50o: 24000 + i * 1800,
    Column_wLODKWpmSS: `${from} → ${to} → Kochi`,
    Column_lc0S2wfw8l: USER_EMAIL,
    Column_iujlmrkz00: statuses,
    'Column_hx4B-_JQjZ': statuses,
    Column_PQUfwzpDbz: 18500 + i * 2200,
    Column_TamP5ek9Lg: 18500 + i * 2200,
    Column_nvRlT5FvRy: 18500 + i * 2200,
    'Column_c-kvPWMFjW': 18500 + i * 2200,
    'Column_nkXmq53c-i': iso(created),
    Exception: extras.exception ? 'Yes' : 'No',
    Travel_Request_ID: `TRV-2026-${String(100 + i).padStart(3, '0')}`,
    Departure_Date: iso(departure),
    FS_Departure_Date: iso(departure),
    Created_By: person(),
    FS_From_City: from,
    FS_To_City: to,
    FS_Booking_Amount_1: 18500 + i * 2200,
    SLA_Deadline: iso(sla),
    Travel_Type: types[i % types.length],
    MC_Total_Booking_Amount: 24000 + i * 1800,
    MC_Route_Summary: `${from} → ${to} → Kochi`,
  }
}

const EXPENSE_ROWS = [
  expenseRow(0, { status: 'In Progress', sla: 'ok' }),
  expenseRow(1, { status: 'In Progress', sla: 'nearing' }),
  expenseRow(2, { status: 'Draft', sla: 'ok' }),
  expenseRow(3, { status: 'Completed', sla: 'ok' }),
  expenseRow(4, { status: 'Rejected', sla: 'breached' }),
  expenseRow(5, { status: 'In Progress', sla: 'breached', exception: true }),
  expenseRow(6, { status: 'Withdrawn', sla: 'ok' }),
]

const ADVANCE_ROWS = [
  advanceRow(0, { status: 'In Progress', sla: 'ok' }),
  advanceRow(1, { status: 'Draft', sla: 'ok' }),
  advanceRow(2, { status: 'Approved', sla: 'ok' }),
  advanceRow(3, { status: 'In Progress', sla: 'nearing' }),
  advanceRow(4, { status: 'Rejected', sla: 'breached' }),
]

const TRAVEL_ROWS = [
  travelRow(0, { status: 'Booked', sla: 'ok', departure: now + 10 * 86400000 }),
  travelRow(1, { status: 'In Progress', sla: 'nearing' }),
  travelRow(2, { status: 'Draft', sla: 'ok' }),
  travelRow(3, { status: 'Completed', sla: 'ok', departure: now + 20 * 86400000 }),
  travelRow(4, { status: 'Booked', sla: 'ok', departure: now + 16 * 86400000 }),
  travelRow(5, { status: 'In Progress', sla: 'breached', exception: true }),
]

const BY_PROCESS = {
  [PROCESSES.expense]: EXPENSE_ROWS,
  [PROCESSES.advance]: ADVANCE_ROWS,
  [PROCESSES.travel]: TRAVEL_ROWS,
}

function statusOf(row) {
  return String(row._status || '').toLowerCase()
}

function filterByStatus(rows, status) {
  const s = String(status || '').toLowerCase()
  if (s === 'draft') return rows.filter((r) => statusOf(r).includes('draft'))
  if (s === 'inprogress') return rows.filter((r) => statusOf(r).includes('progress') || statusOf(r).includes('review'))
  if (s === 'completed') return rows.filter((r) => statusOf(r).includes('complet') || statusOf(r).includes('approve') || statusOf(r).includes('booked'))
  if (s === 'withdrawn') return rows.filter((r) => statusOf(r).includes('withdraw'))
  if (s === 'rejected') return rows.filter((r) => statusOf(r).includes('reject'))
  return rows
}

function statusCounts(rows) {
  return {
    Draft: filterByStatus(rows, 'Draft').length,
    InProgress: filterByStatus(rows, 'InProgress').length,
    Completed: filterByStatus(rows, 'Completed').length,
    Withdrawn: filterByStatus(rows, 'Withdrawn').length,
    Rejected: filterByStatus(rows, 'Rejected').length,
  }
}

function processFromUrl(url) {
  if (url.includes(PROCESSES.expense) || url.includes('All_Items_MK') || url.includes('All_Items_Power_BI')) return PROCESSES.expense
  if (url.includes(PROCESSES.advance) || url.includes('ALL_ITEMS_WITH_TABLE')) return PROCESSES.advance
  if (url.includes(PROCESSES.travel) || url.includes('All_Items_A00')) return PROCESSES.travel
  return ''
}

function listPayload(rows) {
  return { Columns: rows[0] ? colsFromRow(rows[0]) : [], Data: rows, data: rows }
}

export function previewApi(url = '') {
  if (url.includes('/preference/')) return {}
  if (url.includes('/user/2/')) {
    return { _id: USER_ID, Name: USER_NAME, Email: USER_EMAIL, Company: 'Refex Group' }
  }
  if (url.includes('/flow/2/') && url.includes('/process')) {
    return [{ _id: PROCESSES.travel, Name: 'Travel Management' }]
  }

  const processId = processFromUrl(url)
  const rows = BY_PROCESS[processId] || []

  if (url.includes('/myitems/status/count')) return statusCounts(rows)

  const myItemsStatus = url.match(/\/myitems\/(Draft|InProgress|Completed|Withdrawn|Rejected)/)
  if (myItemsStatus) return listPayload(filterByStatus(rows, myItemsStatus[1]))

  if (url.includes('/pending/activity/count') || url.includes('/participated/activity/count')) {
    const pending = rows.filter((r) => statusOf(r).includes('progress') || statusOf(r).includes('review')).length || rows.length
    return STEPS.map((s) => ({ ...s, Count: pending }))
  }

  if (url.includes('/pending/') || url.includes('/participated/activity/') || url.includes('/myitems')) {
    return listPayload(rows)
  }

  if (url.includes('/process-report/2/')) return listPayload(rows)

  return { Columns: [], Data: [], data: [] }
}

export function createPreviewKf() {
  const vars = {
    travel_process_id: PROCESSES.travel,
    upcoming_travels_report_id: 'All_Items_A00',
  }
  const events = {
    on() {},
    off() {},
    subscribe() {},
  }
  return {
    __preview: true,
    account: { _id: ACCOUNT_ID },
    user: {
      _id: USER_ID,
      Id: USER_ID,
      Name: USER_NAME,
      name: USER_NAME,
      Email: USER_EMAIL,
      Company: 'Refex Group',
      AppRoles: [{ Name: 'Employee' }, { Name: 'L1 Manager' }],
      Roles: [{ Name: 'Employee' }, { Name: 'L1 Manager' }],
    },
    app: {
      _id: APP_ID,
      getVariable: async (name) => vars[name] ?? null,
      setVariable: async (name, value) => {
        vars[name] = value
      },
      openPage: async (pageId) => {
        console.info('[preview] openPage', pageId)
      },
      page: {
        openPopup: async (popupId, params = {}) => {
          console.info('[preview] openPopup', popupId, params)
        },
      },
    },
    client: {
      showInfo: (msg) => console.info('[preview]', msg),
    },
    events,
    event: events,
    context: {
      watchParams: () => () => {},
    },
    api: async (url) => previewApi(url),
  }
}
