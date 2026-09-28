/** Browser-only preview data — used when the Kissflow SDK is not available. */

const PAGE_SIZE = 10;

const COLUMN_IDS = [
  '_id',
  '_subject',
  '_status',
  '_current_assigned_to',
  'Amount',
  'Deadline',
  '_created_at',
];

const COLUMN_RENAMES = {
  _id: 'Request ID',
  _subject: 'Subject',
  _status: 'Status',
  _current_assigned_to: 'Assignee',
  Amount: 'Amount',
  Deadline: 'Deadline',
  _created_at: 'Created',
  kf_custom_timer: 'SLA',
};

const PREVIEW_COLUMNS = COLUMN_IDS.map((id) => ({
  Id: id,
  Name: COLUMN_RENAMES[id],
  Type: id === 'Deadline' || id === '_created_at' ? 'DateTime' : 'String',
}));

const iso = (ms) => new Date(ms).toISOString();

const person = (name, extra = {}) => ({ Name: name, ...extra });

const PREVIEW_STEPS = [
  { _id: 'act-review', StepName: 'Manager Review', Count: 6 },
  { _id: 'act-finance', StepName: 'Finance Approval', Count: 4 },
  { _id: 'act-booked', StepName: 'Booked', Count: 3 },
];

function makeRow(index, status, sla = 'ok') {
  const now = Date.now();
  const deadline =
    sla === 'breached'
      ? now - 90 * 60 * 1000
      : sla === 'warning'
        ? now + 18 * 1000
        : now + (4 + (index % 8)) * 60 * 60 * 1000;

  const assignees = [
    [person('Priya Nair')],
    [person('Arun Kumar')],
    [person('Finance Approver', { Type: 'Role' })],
    [person('Meera Shah'), person('Vikram Rao')],
  ][index % 4];

  return {
    _id: `EXP-2026-${String(100 + index).padStart(3, '0')}`,
    _subject: [
      'Client visit — Bengaluru',
      'Team offsite travel',
      'Vendor workshop flights',
      'Customer kickoff stay',
      'Conference — Hyderabad',
    ][index % 5],
    _status: status,
    _current_assigned_to: assignees,
    _current_step: index % 3 === 0 ? 'Manager Review' : 'Finance Approval',
    Amount: `₹${(12 + index * 3).toLocaleString('en-IN')},000`,
    Deadline: iso(deadline),
    _created_at: iso(now - index * 86400000),
    _activity_instance_id: `act-inst-${index}`,
    _sla_preview: sla,
  };
}

const STATUS_ROWS = {
  Draft: Array.from({ length: 4 }, (_, i) => makeRow(i, 'Draft', 'ok')),
  InProgress: [
    makeRow(10, 'InProgress', 'ok'),
    makeRow(11, 'InProgress', 'warning'),
    makeRow(12, 'InProgress', 'breached'),
    makeRow(13, 'InProgress', 'ok'),
    makeRow(14, 'InProgress', 'ok'),
    makeRow(15, 'InProgress', 'warning'),
    makeRow(16, 'InProgress', 'ok'),
    makeRow(17, 'InProgress', 'ok'),
  ],
  Completed: Array.from({ length: 12 }, (_, i) => makeRow(20 + i, 'Completed', 'ok')),
  Withdrawn: Array.from({ length: 2 }, (_, i) => makeRow(40 + i, 'Withdrawn', 'ok')),
  Rejected: [makeRow(50, 'Rejected', 'breached')],
};

const TASK_ROWS = [
  makeRow(60, 'InProgress', 'ok'),
  makeRow(61, 'InProgress', 'warning'),
  makeRow(62, 'InProgress', 'breached'),
  makeRow(63, 'Assigned', 'ok'),
  makeRow(64, 'InProgress', 'ok'),
  makeRow(65, 'On Hold', 'warning'),
];

const PARTICIPATED_ROWS = [
  makeRow(70, 'Completed', 'ok'),
  makeRow(71, 'Rejected', 'breached'),
  makeRow(72, 'InProgress', 'warning'),
  makeRow(73, 'Withdrawn', 'ok'),
  makeRow(74, 'Completed', 'ok'),
  makeRow(75, 'InProgress', 'ok'),
];

export const PREVIEW_CONFIG = {
  app: {
    processId: 'Travel_Expense',
    appId: 'preview-app',
    popupId: 'preview-popup',
    pageSize: PAGE_SIZE,
  },
  ui: {
    enabledTabs: ['myItems', 'myTasks', 'participated'],
    tabLabels: {
      myItems: 'My Items',
      myTasks: 'My Tasks',
      participated: 'Participated',
    },
  },
  global: {
    alwaysHiddenColumns: [],
    protectedColumns: ['_id'],
    columnRenames: COLUMN_RENAMES,
  },
  featureFlags: {
    showBreachFilterRow: true,
  },
  tabs: {
    myItems: {
      subTabs: [
        { id: 'draft', kind: 'status', filter: 'Draft', label: 'Draft', visibleColumns: COLUMN_IDS },
        { id: 'inprogress', kind: 'status', filter: 'InProgress', label: 'In Progress', visibleColumns: COLUMN_IDS },
        { id: 'completed', kind: 'status', filter: 'Completed', label: 'Completed', visibleColumns: COLUMN_IDS },
        { id: 'withdrawn', kind: 'status', filter: 'Withdrawn', label: 'Withdrawn', visibleColumns: COLUMN_IDS },
        { id: 'rejected', kind: 'status', filter: 'Rejected', label: 'Rejected', visibleColumns: COLUMN_IDS },
      ],
    },
    myTasks: {
      visibleColumns: COLUMN_IDS,
      extraCustomColumns: [
        { Id: 'kf_custom_timer', Name: 'SLA', sourceField: 'Deadline', warningThresholdMs: 30000 },
      ],
    },
    participated: {
      visibleColumns: COLUMN_IDS,
      extraCustomColumns: [
        { Id: 'kf_custom_timer', Name: 'SLA', sourceField: 'Deadline', warningThresholdMs: 30000 },
      ],
    },
  },
};

function pageParams(url) {
  try {
    const parsed = new URL(url, 'https://preview.local');
    return {
      page: Number(parsed.searchParams.get('page_number') || 1),
      size: Number(parsed.searchParams.get('page_size') || PAGE_SIZE),
    };
  } catch {
    return { page: 1, size: PAGE_SIZE };
  }
}

function paginate(rows, url) {
  const { page, size } = pageParams(url);
  const start = (Math.max(1, page) - 1) * Math.max(1, size);
  return {
    Columns: PREVIEW_COLUMNS,
    Data: rows.slice(start, start + size),
    Aggregation: { Total: { Count: rows.length } },
  };
}

export function previewApi(url = '') {
  if (url.includes('/preference/')) return {};

  if (url.includes('/myitems/status/count')) {
    return {
      Draft: STATUS_ROWS.Draft.length,
      InProgress: STATUS_ROWS.InProgress.length,
      Completed: STATUS_ROWS.Completed.length,
      Withdrawn: STATUS_ROWS.Withdrawn.length,
      Rejected: STATUS_ROWS.Rejected.length,
    };
  }

  const myItemsMatch = url.match(/\/myitems\/(Draft|InProgress|Completed|Withdrawn|Rejected)/);
  if (myItemsMatch) return paginate(STATUS_ROWS[myItemsMatch[1]] || [], url);

  if (url.includes('/pending/activity/count')) return PREVIEW_STEPS;
  if (url.includes('/participated/activity/count')) return PREVIEW_STEPS;

  if (url.includes('/pending/')) return paginate(TASK_ROWS, url);
  if (url.includes('/participated/activity/')) return paginate(PARTICIPATED_ROWS, url);

  const progressMatch = url.match(/\/([^/?]+)\/progress$/);
  if (progressMatch) {
    const rowId = progressMatch[1];
    const row = [...TASK_ROWS, ...PARTICIPATED_ROWS, ...Object.values(STATUS_ROWS).flat()]
      .find((r) => r._id === rowId);
    const breached = row?._sla_preview === 'breached';
    return {
      Steps: PREVIEW_STEPS.map((step) => ({
        Id: step._id,
        IsSLABreached: breached,
        BreachTime: breached ? iso(Date.now() - 3600000) : null,
      })),
    };
  }

  return { Columns: PREVIEW_COLUMNS, Data: [], Aggregation: { Total: { Count: 0 } } };
}

export function createPreviewKf() {
  return {
    __preview: true,
    account: { _id: 'AcPreview' },
    user: { Name: 'Preview User' },
    app: {
      getVariable: async (name) => (name === 'KF_LANDING_CONFIG' ? PREVIEW_CONFIG : null),
      page: {
        openPopup: async (popupId, params = {}) => {
          console.info('[preview] Popup would open in Kissflow:', popupId, params);
        },
      },
    },
    api: async (url) => previewApi(url),
  };
}
