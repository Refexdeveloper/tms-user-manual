/**
 * dev-mock-kf.js
 * Simulates the Kissflow SDK (window.kf) for local development.
 * Only active when import.meta.env.DEV === true.
 * Provides realistic mock data for the expense-management-og dashboard.
 */

import { expenseList } from './landing/mocks/expenses.js'

// ─── Mock API responses ──────────────────────────────────────────────────────

const MOCK_USER = {
    _id: 'usr_dev_001',
    Name: 'Raghul JE',
    Email: 'raghul@refex.co.in',
    Company: 'Refex Group',
    AppRoles: ['Employee'],
    roles: ['Employee'],
}

const MOCK_ACCOUNT = {
    _id: 'acc_refex_001',
}

// Build myitems rows from the mock expense list
function buildMockWorkflowRows() {
    return expenseList.map((exp, i) => ({
        _id: `inst_${i + 1}_${exp.id}`,
        _activity_instance_id: `act_${i + 1}_${exp.id}`,
        _status: exp.status,
        _current_step: exp.status === 'pending' ? 'Manager Approval' : exp.status === 'approved' ? 'Completed' : 'Rejected',
        _created_at: new Date(Date.now() - i * 86400000).toISOString(),
        _modified_at: new Date(Date.now() - i * 43200000).toISOString(),
        _created_by: { Name: exp.employee, Email: `${exp.employee.toLowerCase().replace(' ', '.')}@refex.co.in` },
        Column_FHro_zXoJL: `${exp.employee.toLowerCase().replace(' ', '.')}@refex.co.in`,
        // Expense ID
        Column_IgkVjlJE4v: exp.id,
        // Expense Date
        Column_fayFfVp5jb: exp.date,
        // Expense Type
        Column_QvkPQesvWe: exp.category,
        // Status columns
        Column_nw_IoZqtdq: exp.status,
        // Total amount (Final_Total_Amount)
        Column_K0V2X95byW: exp.amount,
        // Per-type amounts
        Column__TAcTPEAKs: exp.category === 'Food Claim' ? exp.amount : 0,
        Column_xZXMgYqgvI: exp.category === 'Local Conveyance' ? exp.amount : 0,
        Column_133Ac5B7_c: exp.category === 'Daily Allowance' ? exp.amount : 0,
        // Requestor name
        Column_96nwf9g2dv: exp.employee,
        // Receipt flag
        Column_POeXx74WyO: exp.receipt ? 'Yes' : '',
        // SLA Deadline (some random future dates)
        Column_rHZ784lMPG: new Date(Date.now() + (i % 3 === 0 ? -86400000 : (i + 2) * 86400000)).toISOString(),
        // Description
        Column_rn7J4m2w3z: exp.description,
        current_step_status: exp.status,
    }))
}

// ─── Mock kf.api ─────────────────────────────────────────────────────────────

const mockRows = buildMockWorkflowRows()

async function mockApi(url, _options) {
    await new Promise((r) => setTimeout(r, 60)) // Simulate realistic network delay

    // myitems endpoint — return rows for Me scope
    if (url.includes('/myitems/')) {
        const statusMatch = url.match(/\/myitems\/(\w+)/)
        const status = statusMatch?.[1]?.toLowerCase()
        let rows = mockRows
        if (status === 'inprogress' || status === 'draft') {
            rows = mockRows.filter((r) => r._status === 'pending')
        } else if (status === 'completed') {
            rows = mockRows.filter((r) => r._status === 'approved')
        } else if (status === 'rejected') {
            rows = mockRows.filter((r) => r._status === 'rejected')
        } else if (status === 'withdrawn') {
            rows = []
        }
        return { Data: rows, data: rows }
    }

    // pending/activity/count — My Team scope
    if (url.includes('/pending/activity/count')) {
        return [{ _id: 'step_manager_approval', Name: 'Manager Approval', Count: 5 }]
    }

    // pending/stepId — return all pending rows
    if (url.includes('/pending/')) {
        return { Data: mockRows.filter((r) => r._status === 'pending'), data: [] }
    }

    // process-report — enrichment map
    if (url.includes('/process-report/')) {
        return { Data: mockRows, data: mockRows }
    }

    // preference endpoint — silently succeed
    if (url.includes('/preference/')) {
        return { success: true }
    }

    // user profile
    if (url.includes('/user/2/')) {
        return { ...MOCK_USER }
    }

    return { Data: [], data: [] }
}

// ─── Mock kf.app ─────────────────────────────────────────────────────────────

const mockVariables = {}

const mockApp = {
    setVariable: async (name, value) => {
        mockVariables[name] = value
    },
    getVariable: async (name) => mockVariables[name],
    openPage: (pageId) => {
        console.log('[DEV MOCK] openPage:', pageId)
    },
    page: {
        openPopup: (popupId, params) => {
            console.log('[DEV MOCK] openPopup:', popupId, params)
            return Promise.resolve()
        },
    },
}

// ─── Mock kf.client ───────────────────────────────────────────────────────────

const mockClient = {
    showInfo: (msg) => console.info('[DEV MOCK] showInfo:', msg),
    showError: (msg) => console.error('[DEV MOCK] showError:', msg),
}

// ─── Mock kf.events ──────────────────────────────────────────────────────────

const mockEventHandlers = {}
const mockEvents = {
    on: (event, handler) => {
        if (!mockEventHandlers[event]) mockEventHandlers[event] = []
        mockEventHandlers[event].push(handler)
    },
    off: (event, handler) => {
        if (mockEventHandlers[event]) {
            mockEventHandlers[event] = mockEventHandlers[event].filter((h) => h !== handler)
        }
    },
    emit: (event, ...args) => {
        ;(mockEventHandlers[event] || []).forEach((h) => h(...args))
    },
}

// ─── Compose mock kf ─────────────────────────────────────────────────────────

export const mockKf = {
    user: MOCK_USER,
    account: MOCK_ACCOUNT,
    api: mockApi,
    app: mockApp,
    client: mockClient,
    events: mockEvents,
    event: mockEvents,
}
