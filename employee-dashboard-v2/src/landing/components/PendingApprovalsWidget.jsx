import { useEffect, useMemo, useRef, useState } from 'react'
import { kf } from '../../sdk/index.js'
import CurrentStepBadges from './CurrentStepBadges.jsx'
import SlaCell from './SlaCell.jsx'

const APP_ID = 'Expense_and_Travel_Management_A00'
const PAGE_SIZE = 2000
const MAX_PAGES = 15
const TABS = [
    { key: 'travel', label: 'Travel Booking', short: 'Booking', processId: 'Travel_Management_A02', reportId: 'All_Items_A00', popup: 'Popup_rCILSrY8KF', color: '#2879b6', glow: 'rgba(40,121,182,0.45)' },
    { key: 'advance', label: 'Travel Advance', short: 'Advance', processId: 'Advance_Payment_Request_Process_A01', reportId: 'ALL_ITEMS_WITH_TABLE_A00', popup: 'Popup_J0C5lIdWCL', color: '#7dc244', glow: 'rgba(125,194,68,0.45)' },
    { key: 'expense', label: 'Travel Expense', short: 'Expense', processId: 'Expense_Management_A03', reportId: 'All_Items_MK_A00', popup: 'Popup_E4xarw8lLE', color: '#ee6a31', glow: 'rgba(238,106,49,0.45)' },
]

/** Same parent views as mis-table: Drafts live under My Items → Draft. */
const SCOPE_TABS = [
    { key: 'myItems', label: 'My Items' },
    { key: 'myTasks', label: 'My Tasks' },
    { key: 'participated', label: 'Participated' },
]

const MY_ITEMS_STATUSES = [
    { key: 'Draft', label: 'Drafts' },
    { key: 'InProgress', label: 'In Progress' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Withdrawn', label: 'Withdrawn' },
    { key: 'Rejected', label: 'Rejected' },
]

const HIDDEN_COLUMNS = ['Column_BliavHBah3', 'Column_RzqotquBQV', 'Column_eFd2LUqnSP']

/** Deadline cells: IST wall time (same as expense-management `index.jsx`). */
const EXPENSE_DATETIME_DISPLAY_TZ = 'Asia/Kolkata'

const EXPENSE_TYPE_STYLE = {
    allowance: { icon: 'ri-sun-line', colorFrom: '#EE6A31', colorTo: '#F59E21', text: '#EE6A31' },
    food: { icon: 'ri-restaurant-2-line', colorFrom: '#139B49', colorTo: '#7dc244', text: '#139B49' },
    local: { icon: 'ri-taxi-line', colorFrom: '#2879b6', colorTo: '#1D9AD4', text: '#2879b6' },
    other: { icon: 'ri-file-list-3-line', colorFrom: '#64748b', colorTo: '#94a3b8', text: '#64748b' },
}

const ADVANCE_FIELD_IDS = {
    requestId: 'Column_gmgjecOFBH',
    requestedDate: 'Column_RmtnLwNoFB',
    requestor: 'Column_9XVj5RhJI0',
    linkToTravel: 'Column_ctQorHPmAU',
    advanceAmount: 'Column_rMCWa-_7NO',
    currentStep: 'Column_LTs78WRTDp',
    slaDeadline: 'Column_Wc-2EfDPkD',
}

const TRAVEL_FIELD_IDS = {
    requestId: 'Column_DRz-V78ZHe',
    /** Common Departure_Date for oneWay / roundTrip / multiCity */
    departureDate: 'Column_HQjIt021s2',
    /** Legacy FS departure (fallback) */
    departureDateLegacy: 'Column_T7yk_UT6Hk',
    requestor: 'Column_MfwZaTYIE8',
    from: 'Column_1qX1HxE34f',
    to: 'Column_6VWxLVKxdg',
    bookingAmount: 'Column_S7qHj2qlIJ',
    currentStep: 'Column_z0s-oAG3rN',
    slaDeadline: 'Column_3l8DHla3JD',
    /** Travel_Type — oneWay | roundTrip | multiCity */
    travelType: 'Column_WHUJTy6aCd',
    /** Multi-city total booking amount */
    mcBookingAmount: 'Column_emdSnf_50o',
    /** Multi-city route e.g. MAA → DEL → BOM */
    mcRouteSummary: 'Column_wLODKWpmSS',
}

/** Process FieldIds written by Travel Booking Save Draft / report enrichment */
const TRAVEL_PROCESS_FIELD_IDS = {
    requestId: 'Travel_Request_ID',
    departureDate: 'Departure_Date',
    departureDateLegacy: 'FS_Departure_Date',
    requestor: '_created_by',
    from: 'Boarding_from',
    to: 'Destination_to_1',
    bookingAmount: 'FS_Booking_Amount_1',
    currentStep: '_current_step',
    slaDeadline: 'SLA_Deadline',
    travelType: 'OnewayRound_tripNot_applicable',
    mcBookingAmount: 'MC_Total_Booking_Amount',
    mcRouteSummary: 'MC_Route_Summary',
}

function readTravelRowValue(row, key) {
    const colKey = TRAVEL_FIELD_IDS[key]
    const fieldKey = TRAVEL_PROCESS_FIELD_IDS[key]
    const colVal = colKey ? row?.[colKey] : undefined
    if (colVal !== undefined && colVal !== null && colVal !== '') return colVal
    const fieldVal = fieldKey ? row?.[fieldKey] : undefined
    if (fieldVal !== undefined && fieldVal !== null && fieldVal !== '') return fieldVal
    return undefined
}

function readTravelDeparture(row) {
    return (
        readTravelRowValue(row, 'departureDate') ??
        readTravelRowValue(row, 'departureDateLegacy') ??
        row?.From_Date ??
        row?.FS_Departure_Date ??
        row?.Common_from_date
    )
}

function readTravelFrom(row) {
    return (
        readTravelRowValue(row, 'from') ??
        row?.FS_From_City ??
        row?.Boarding_from ??
        row?.common_From ??
        row?.Boarding
    )
}

function readTravelTo(row) {
    return (
        readTravelRowValue(row, 'to') ??
        row?.FS_To_City ??
        row?.Destination_to_1 ??
        row?.common_To ??
        row?.Destination_1
    )
}

function readTravelAmount(row) {
    return (
        readTravelRowValue(row, 'bookingAmount') ??
        row?.FS_Booking_Amount_1 ??
        row?.FS_Booking_Amount ??
        row?.FS_Total_Fare_1 ??
        row?.FS_Total_Fare ??
        row?.Booking_Amount_1
    )
}

function readTravelTypeRaw(row) {
    return (
        readTravelRowValue(row, 'travelType') ??
        row?.Travel_Type ??
        row?.Trip_Type ??
        row?.OnewayRound_tripNot_applicable ??
        row?.FS_Trip_Type ??
        row?.travel_type ??
        row?.tripType
    )
}

function readTravelRequestor(row) {
    return (
        readTravelRowValue(row, 'requestor') ??
        row?._created_by ??
        row?.Created_By ??
        row?.Employee_Details
    )
}

function readTravelRequestId(row) {
    return (
        readTravelRowValue(row, 'requestId') ??
        row?.Travel_Request_ID ??
        row?.Travel_Request_ID_1 ??
        row?._name ??
        row?.Name ??
        row?._id
    )
}

function normalizeTravelTypeKey(raw) {
    const s = String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '')
    if (s === 'multicity' || s.includes('multi')) return 'multiCity'
    if (s === 'roundtrip' || s.includes('round')) return 'roundTrip'
    if (s === 'oneway' || s.includes('one')) return 'oneWay'
    return ''
}

function travelTypeLabel(key) {
    if (key === 'multiCity') return 'Multi-City'
    if (key === 'roundTrip') return 'Round Trip'
    if (key === 'oneWay') return 'One Way'
    return '—'
}

const TRAVEL_TYPE_STYLE = {
    oneWay: { bg: 'rgba(40,121,182,0.10)', color: '#1e4d72' },
    roundTrip: { bg: 'rgba(125,194,68,0.14)', color: '#3f6212' },
    multiCity: { bg: 'rgba(238,106,49,0.12)', color: '#9a3412' },
}

function toNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    if (typeof value === 'string') {
        const cleaned = value.replace(/,/g, '').trim()
        const match = cleaned.match(/-?\d+(\.\d+)?/)
        if (!match) return 0
        const n = Number(match[0])
        return Number.isFinite(n) ? n : 0
    }
    return 0
}

function extractDateTimeRaw(value) {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'string' || typeof value === 'number') return value
    if (typeof value === 'object') {
        const nested =
            value.Value ??
            value.value ??
            value.DisplayValue ??
            value.displayValue ??
            value.Name ??
            value.name ??
            value._isostring ??
            value._display_value ??
            value.ISOString ??
            value.isoString ??
            value.UTC_ShortDateTime ??
            value.utcShortDateTime ??
            value.ShortDateTime ??
            value.shortDateTime
        if (nested != null && typeof nested !== 'object' && String(nested).trim() !== '') return nested

        // Kissflow DateTime cells often use numeric OR string parts (_year/_month/_date).
        const y = Number(value._year ?? value.Year ?? value.year)
        if (Number.isFinite(y) && y > 0) {
            const mo = Number(value._month ?? value.Month ?? value.month ?? 1)
            const day = Number(value._date ?? value.Day ?? value.day ?? value._day ?? 1)
            const h = Number(value._hour ?? value.Hour ?? value.hour ?? 0)
            const mi = Number(value._minute ?? value.Minute ?? value.minute ?? 0)
            const s = Number(value._second ?? value.Second ?? value.second ?? 0)
            const monthIndex = Number.isFinite(mo) && mo > 0 ? mo - 1 : 0
            const d = new Date(
                y,
                monthIndex,
                Number.isFinite(day) && day > 0 ? day : 1,
                Number.isFinite(h) ? h : 0,
                Number.isFinite(mi) ? mi : 0,
                Number.isFinite(s) ? s : 0,
            )
            if (!Number.isNaN(d.getTime())) return d.toISOString()
        }
    }
    return null
}

function hasUsableDateTimeCell(value) {
    if (value === undefined || value === null || value === '') return false
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim() !== ''
    if (typeof value === 'object') return extractDateTimeRaw(value) != null
    return false
}

let _deadlineDateTimeFormatter
function getDeadlineDisplayFormatter() {
    if (!_deadlineDateTimeFormatter) {
        _deadlineDateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
            timeZone: EXPENSE_DATETIME_DISPLAY_TZ,
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        })
    }
    return _deadlineDateTimeFormatter
}

function formatDeadlineCell(value) {
    const raw = extractDateTimeRaw(value)
    if (raw == null) return ''
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) {
        if (typeof raw === 'string' && raw.trim()) return raw.trim()
        return toText(value).trim()
    }
    let s = getDeadlineDisplayFormatter().format(d)
    s = s.replace(/\b([ap]m)\b/gi, (_, ap) => ap.toUpperCase())
    s = s.replace(/\s+(?:IST|GMT[+-][\d:]+|UTC)\b/gi, '').trim()
    return s
}

function dateRawToMs(raw) {
    if (raw === null || raw === undefined || raw === '') return null
    const extracted = extractDateTimeRaw(raw)
    const candidate = extracted !== null && extracted !== undefined ? extracted : raw
    if (candidate === null || candidate === undefined || candidate === '') return null
    const d = new Date(typeof candidate === 'object' ? toText(candidate) : candidate)
    return Number.isNaN(d.getTime()) ? null : d.getTime()
}

function toDateText(value) {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

/** Departure Date column: "04 Aug, 2026" for all travel trip types. */
function formatDepartureDateDisplay(value) {
    if (value === null || value === undefined || value === '') return ''
    const raw = extractDateTimeRaw(value) ?? value
    const d = new Date(typeof raw === 'object' ? toText(raw) : raw)
    if (Number.isNaN(d.getTime())) {
        const s = String(raw || '').trim()
        // Already ISO date-only → format parts directly to avoid TZ shift
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (m) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const day = m[3]
            const month = months[Number(m[2]) - 1] || m[2]
            return `${day} ${month}, ${m[1]}`
        }
        return s
    }
    // Use calendar parts in local time for Date objects from ISO date-only (UTC midnight)
    // Prefer ISO YYYY-MM-DD slice when available to keep "04 Aug, 2026" stable.
    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw.trim())) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const [y, mo, day] = raw.trim().slice(0, 10).split('-')
        return `${day} ${months[Number(mo) - 1] || mo}, ${y}`
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = String(d.getDate()).padStart(2, '0')
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    return `${day} ${month}, ${year}`
}

const EMPTY_EXPENSE_FIELD_IDS = {
    expenseId: 'Column_9Y8-uPPDVi',
    requestDate: 'Column_gJidmn-kAv',
    requestor: 'Column_rCBEwniBuE',
    // Travel Expense type (provided)
    expenseType: 'Column_XcXTxxA4-C',
    totalAmount: 'Column_Nvns1CPpfI',
    // Travel Expense current step (provided)
    currentStep: 'Column_bzLJNkKQZO',
    slaDeadline: 'Column_KD_a7365Yi',
}

// Travel Expense status (provided)
const EXPENSE_STATUS_COL_ID = 'Column_nEtxbnvlrc'

/** Expense column ids are fixed for All_Items_MK_A00, with FieldId lookup from report Columns. */
function findReportColumnId(cols, fieldIdCandidates, namePattern, fallback) {
    const list = Array.isArray(cols) ? cols : []
    for (const fid of fieldIdCandidates) {
        const byField = list.find((c) => String(c?.FieldId || '') === fid)
        if (byField?.Id) return byField.Id
        const byId = list.find((c) => String(c?.Id || '') === fid)
        if (byId?.Id) return byId.Id
    }
    if (namePattern) {
        const byName = list.find((c) => namePattern.test(String(c?.Name || '')))
        if (byName?.Id) return byName.Id
    }
    return fallback
}

function resolveExpenseFieldIds(rawCols) {
    return {
        expenseId: findReportColumnId(
            rawCols,
            ['Expense_ID', EMPTY_EXPENSE_FIELD_IDS.expenseId],
            /expense\s*id|request\s*id/i,
            EMPTY_EXPENSE_FIELD_IDS.expenseId,
        ),
        requestDate: findReportColumnId(
            rawCols,
            ['Expense_Date', 'Request_Date', EMPTY_EXPENSE_FIELD_IDS.requestDate],
            /request(ed)?\s*date|expense\s*date/i,
            EMPTY_EXPENSE_FIELD_IDS.requestDate,
        ),
        requestor: findReportColumnId(
            rawCols,
            ['_created_by', 'Requestor', EMPTY_EXPENSE_FIELD_IDS.requestor],
            /requestor|created\s*by/i,
            EMPTY_EXPENSE_FIELD_IDS.requestor,
        ),
        expenseType: findReportColumnId(
            rawCols,
            ['Expense_Type', EMPTY_EXPENSE_FIELD_IDS.expenseType],
            /expense\s*type/i,
            EMPTY_EXPENSE_FIELD_IDS.expenseType,
        ),
        totalAmount: findReportColumnId(
            rawCols,
            ['Total_Claimable_Amount', 'Column_Nvns1CPpfI', EMPTY_EXPENSE_FIELD_IDS.totalAmount],
            /total\s*claimable|total\s*amount/i,
            EMPTY_EXPENSE_FIELD_IDS.totalAmount,
        ),
        currentStep: findReportColumnId(
            rawCols,
            ['_current_step', 'Current_step', EMPTY_EXPENSE_FIELD_IDS.currentStep],
            /current\s*step/i,
            EMPTY_EXPENSE_FIELD_IDS.currentStep,
        ),
        slaDeadline: findReportColumnId(
            rawCols,
            ['SLA_Deadline', 'Column_KD_a7365Yi', EMPTY_EXPENSE_FIELD_IDS.slaDeadline],
            /sla\s*deadline|^deadline$/i,
            EMPTY_EXPENSE_FIELD_IDS.slaDeadline,
        ),
    }
}

function extractCurrentStepText(row, colId) {
    const raw =
        colId && row?.[colId] !== undefined && row?.[colId] !== null && row?.[colId] !== ''
            ? row[colId]
            : row?.['Column_6KQUHRHKEZ'] ?? row?._current_step ?? row?.Current_step ?? row?.current_step
    if (raw === null || raw === undefined) return ''
    if (typeof raw === 'string' || typeof raw === 'number') return String(raw).trim()
    if (typeof raw === 'object') {
        const named = raw.Name ?? raw.name ?? raw.Value ?? raw.value ?? raw.Label ?? raw.label
        if (named != null && typeof named !== 'object') return String(named).trim()
    }
    return toText(raw).trim()
}

function extractSlaDeadlineRaw(row, slaColId, fallbackColIds = []) {
    const keys = [
        slaColId,
        ...fallbackColIds,
        'SLA_Deadline',
        'Column_KD_a7365Yi',
        'Deadline',
        'SLA',
    ].filter(Boolean)

    for (const key of keys) {
        const v = row?.[key]
        if (hasUsableDateTimeCell(v)) return v
    }

    // Last resort: scan row keys that look like SLA/deadline columns.
    if (row && typeof row === 'object') {
        for (const [key, v] of Object.entries(row)) {
            if (!/sla|deadline/i.test(key)) continue
            if (hasUsableDateTimeCell(v)) return v
        }
    }

    const ctx = row?._current_context
    if (Array.isArray(ctx) && ctx.length && ctx[0]?.ExpectedAt) return ctx[0].ExpectedAt
    return null
}

function normalizeExpenseTypeKey(name) {
    const t = String(name || '').trim().toLowerCase()
    if (!t) return 'other'
    if (t.includes('daily') || t.includes('allowance')) return 'allowance'
    if (t.includes('food')) return 'food'
    if (t.includes('local') || t.includes('conveyance')) return 'local'
    return 'other'
}

function formatINR(amount) {
    return `₹${Math.round(toNumber(amount)).toLocaleString('en-IN')}`
}

function buildExpenseRowView(row, ids) {
    const expenseId =
        (ids.expenseId ? toText(row[ids.expenseId]).trim() : '') ||
        toText(row?._name || row?.Name) ||
        toText(row?._id).slice(-8) ||
        '—'

    const requestRaw = ids.requestDate ? row?.[ids.requestDate] : null
    const requestDateStr =
        (requestRaw !== undefined && requestRaw !== null && requestRaw !== '' ? toDateText(extractDateTimeRaw(requestRaw) ?? requestRaw) : '') ||
        toDateText(row?._created_at)

    const windowStartAtMs =
        dateRawToMs(requestRaw) ?? dateRawToMs(row?._created_at) ?? dateRawToMs(row?._modified_at) ?? null

    const expenseTypeRaw = ids.expenseType ? toText(row[ids.expenseType]).trim() : ''
    const expenseType = expenseTypeRaw || '—'

    const requestorText = ids.requestor ? toText(row?.[ids.requestor]).trim() : ''

    let totalAmount = 0
    if (ids.totalAmount && row[ids.totalAmount] !== undefined && row[ids.totalAmount] !== null && row[ids.totalAmount] !== '') {
        totalAmount = toNumber(row[ids.totalAmount])
    } else {
        totalAmount = toNumber(
            row?.Total_Claimable_Amount ?? row?.['Column_UyJCJpXn5Y'] ?? row?.Total_Amount ?? 0,
        )
    }

    const currentStep = extractCurrentStepText(row, ids.currentStep)

    const slaRaw = extractSlaDeadlineRaw(row, ids.slaDeadline, ['Column_KD_a7365Yi', 'SLA_Deadline'])
    const deadlineAtMs = dateRawToMs(slaRaw)
    const deadlineText = slaRaw != null && slaRaw !== '' ? formatDeadlineCell(slaRaw) : ''

    // Created-time for tie-break after SLA urgency sort.
    const listSortMs =
        dateRawToMs(row?._created_at) ?? windowStartAtMs ?? dateRawToMs(row?._modified_at) ?? deadlineAtMs ?? 0

    return {
        expenseId,
        requestDateStr,
        requestorText,
        expenseType,
        totalAmount,
        currentStep,
        deadlineText,
        deadlineAtMs,
        windowStartAtMs,
        listSortMs,
    }
}

function formatLinkToTravel(value) {
    if (value === null || value === undefined || value === '') return '—'
    let v = value
    if (typeof v === 'string') {
        const s = v.trim()
        if (!s || s === '{}' || s === '—') return '—'
        try {
            v = JSON.parse(s)
        } catch {
            return s
        }
    }
    if (typeof v !== 'object' || Array.isArray(v)) return toText(v).trim() || '—'

    const from = toText(v.From ?? v.from).trim()
    const to = toText(v.To ?? v.to).trim()
    const fromDate = toText(v['From date'] ?? v.fromDate ?? v.FromDate).trim()
    const toDate = toText(v['To date'] ?? v.toDate ?? v.ToDate).trim()
    const purpose = toText(v['Travel Purpose'] ?? v.travelPurpose).trim()

    const summary = []
    if (from || to) summary.push(`${from || '—'} → ${to || '—'}`)
    if (fromDate || toDate) summary.push(`${fromDate || 'N/A'} to ${toDate || 'N/A'}`)
    if (purpose) summary.push(purpose)
    if (summary.length) return summary.join(' | ')

    const flat = toText(v).trim()
    return flat || '—'
}

function buildAdvanceRowView(row) {
    const requestId =
        toText(row?.[ADVANCE_FIELD_IDS.requestId]).trim() ||
        toText(row?.Advance_Request_ID || row?._name || row?.Name).trim() ||
        '—'
    const requestedRaw = row?.[ADVANCE_FIELD_IDS.requestedDate] ?? row?.Requested_Date ?? row?.requested_date
    const requestedDateStr =
        (requestedRaw !== undefined && requestedRaw !== null && requestedRaw !== ''
            ? toDateText(extractDateTimeRaw(requestedRaw) ?? requestedRaw)
            : '') || toDateText(row?._created_at)
    const linkToTravelText = formatLinkToTravel(
        row?.[ADVANCE_FIELD_IDS.linkToTravel] ?? row?.List_of_Travel_Requests_lookup,
    )
    const requestorText = toText(
        row?.[ADVANCE_FIELD_IDS.requestor] ?? row?.created_by_user_id ?? row?._created_by,
    ).trim()
    const advanceAmount = toNumber(
        row?.[ADVANCE_FIELD_IDS.advanceAmount] ??
            row?.Advance_amount_value ??
            row?.['Column_t1eY-VJcss'] ??
            row?.Advance_Amount,
    )
    const currentStep = extractCurrentStepText(row, ADVANCE_FIELD_IDS.currentStep)

    const slaRaw = extractSlaDeadlineRaw(row, ADVANCE_FIELD_IDS.slaDeadline)
    const deadlineAtMs = dateRawToMs(slaRaw)
    const deadlineText = slaRaw != null && slaRaw !== '' ? formatDeadlineCell(slaRaw) : ''
    const windowStartAtMs = dateRawToMs(requestedRaw) ?? dateRawToMs(row?._created_at) ?? dateRawToMs(row?._modified_at) ?? null
    // Created-time for tie-break after SLA urgency sort.
    const listSortMs =
        dateRawToMs(row?._created_at) ?? windowStartAtMs ?? dateRawToMs(row?._modified_at) ?? deadlineAtMs ?? 0

    return {
        requestId,
        requestedDateStr,
        requestorText,
        linkToTravelText,
        advanceAmount,
        currentStep,
        deadlineText,
        deadlineAtMs,
        windowStartAtMs,
        listSortMs,
    }
}

function buildTravelRowView(row) {
    const requestId = toText(readTravelRequestId(row)).trim() || '—'
    const travelTypeKey = normalizeTravelTypeKey(readTravelTypeRaw(row))
    const isMultiCity = travelTypeKey === 'multiCity'
    const tripTypeLabel = travelTypeLabel(travelTypeKey)

    const departureRaw = readTravelDeparture(row)
    const departureDateStr = formatDepartureDateDisplay(departureRaw) || '—'

    const routeSummary = toText(
        readTravelRowValue(row, 'mcRouteSummary') ?? row?.MC_Route_Summary ?? row?.mc_route_summary,
    ).trim()
    const fromText = isMultiCity
        ? routeSummary || toText(readTravelFrom(row)).trim() || '—'
        : toText(readTravelFrom(row)).trim() || '—'
    const toTextValue = isMultiCity ? '' : toText(readTravelTo(row)).trim() || '—'

    const bookingAmount = isMultiCity
        ? toNumber(
              readTravelRowValue(row, 'mcBookingAmount') ??
                  row?.MC_Total_Booking_Amount ??
                  row?.mc_total_booking_amount ??
                  readTravelAmount(row),
          )
        : toNumber(readTravelAmount(row))

    const requestorText = toText(readTravelRequestor(row)).trim()
    const currentStep = extractCurrentStepText(row, TRAVEL_FIELD_IDS.currentStep)

    const slaRaw = extractSlaDeadlineRaw(row, TRAVEL_FIELD_IDS.slaDeadline)
    const deadlineAtMs = dateRawToMs(slaRaw)
    const deadlineText = slaRaw != null && slaRaw !== '' ? formatDeadlineCell(slaRaw) : ''
    const windowStartAtMs = dateRawToMs(departureRaw) ?? dateRawToMs(row?._created_at) ?? dateRawToMs(row?._modified_at) ?? null
    // Created-time for tie-break after SLA urgency sort.
    const listSortMs =
        dateRawToMs(row?._created_at) ??
        dateRawToMs(row?._modified_at) ??
        windowStartAtMs ??
        deadlineAtMs ??
        0

    return {
        requestId,
        travelTypeKey,
        tripTypeLabel,
        isMultiCity,
        departureDateStr,
        requestorText,
        fromText,
        toTextValue,
        routeSummary: routeSummary || fromText,
        bookingAmount,
        currentStep,
        deadlineText,
        deadlineAtMs,
        windowStartAtMs,
        listSortMs,
    }
}

/** Aligns with SlaCell: red breached · orange/yellow about-to-end (<24h) · green safe. */
const SLA_ABOUT_TO_END_MS = 24 * 60 * 60 * 1000

/**
 * Pending list order:
 * 1. SLA about to end (<24h left) — soonest deadline first
 * 2. Breached SLA — least overrun / most recently breached first
 * 3. Safe SLA (≥24h left) — soonest deadline first
 * 4. No SLA
 * Tie-break within each group: most recently created first.
 */
function comparePendingBySlaThenRecent(a, b) {
    const now = Date.now()
    const rankA = getSlaSortRank(a, now)
    const rankB = getSlaSortRank(b, now)

    if (rankA.bucket !== rankB.bucket) return rankA.bucket - rankB.bucket
    if (rankA.urgencyMs !== rankB.urgencyMs) return rankA.urgencyMs - rankB.urgencyMs
    return (b?.listSortMs || 0) - (a?.listSortMs || 0)
}

function getSlaSortRank(entry, now) {
    const deadline = entry?.deadlineAtMs
    const created = entry?.listSortMs || 0

    if (deadline == null || !Number.isFinite(deadline)) {
        return { bucket: 3, urgencyMs: Number.POSITIVE_INFINITY, created }
    }

    if (now > deadline) {
        // Breached — after about-to-end; least overrun (most recently breached) first
        return { bucket: 1, urgencyMs: now - deadline, created }
    }

    const remaining = deadline - now
    if (remaining < SLA_ABOUT_TO_END_MS) {
        // About to end — TOP of list; least time left first
        return { bucket: 0, urgencyMs: remaining, created }
    }

    // Safe — soonest deadline first
    return { bucket: 2, urgencyMs: remaining, created }
}

function safeJson(v) {
    try {
        return JSON.stringify(v)
    } catch {
        return String(v)
    }
}

function toText(val) {
    if (val === null || val === undefined) return ''
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val)
    if (Array.isArray(val)) {
        if (!val.length) return ''
        const names = val.map((x) => x?.Name || x?.FileName || x?.name || x?.filename || safeJson(x)).filter(Boolean)
        return names.length ? names.join(', ') : `${val.length} items`
    }
    if (typeof val === 'object') return val?.Name || val?.name || val?.Email || val?.email || val?.Value || val?.value || val?.Text || val?.text || safeJson(val)
    return String(val)
}

function extractPopupIds(row) {
    const firstCtx = Array.isArray(row?._current_context) && row._current_context.length ? row._current_context[0] : null
    const instanceId =
        row?.Column_RzqotquBQV ||
        row?._id ||
        row?.InstanceId ||
        row?.instance_id ||
        ''
    const activityId =
        row?.Column_eFd2LUqnSP ||
        row?._activity_instance_id ||
        row?._context_activity_instance_id ||
        row?._activityInstanceId ||
        row?._activity_id ||
        row?._context_activity_id ||
        firstCtx?._context_activity_instance_id ||
        firstCtx?._context_activity_id ||
        ''

    return {
        instanceId: instanceId ? String(instanceId) : '',
        activityId: activityId ? String(activityId) : '',
    }
}

function isPendingStatus(text) {
    const s = String(text || '').toLowerCase()
    if (!s) return true
    if (s.includes('reject') || s.includes('cancel') || s.includes('complete') || s.includes('approve') || s.includes('booked') || s.includes('paid')) return false
    return s.includes('pending') || s.includes('progress') || s.includes('review') || s.includes('approval') || s.includes('desk')
}

export default function PendingApprovalsWidget({ onPopupClosed } = {}) {
    const accountId = useMemo(() => kf?.account?._id, [])
    const [scopeKey, setScopeKey] = useState('myItems')
    const [myItemsStatus, setMyItemsStatus] = useState('Draft')
    const [activeKey, setActiveKey] = useState('travel')
    const activeTab = useMemo(() => TABS.find((t) => t.key === activeKey) || TABS[0], [activeKey])
    const [counts, setCounts] = useState({ expense: 0, advance: 0, travel: 0 })
    const [statusCounts, setStatusCounts] = useState({})
    const [steps, setSteps] = useState([])
    const [activeStepId, setActiveStepId] = useState('')
    const [countsReady, setCountsReady] = useState(false)
    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState([])
    const [cols, setCols] = useState([])
    const [rawCols, setRawCols] = useState([])
    const [tabActivityIds, setTabActivityIds] = useState({ expense: '', advance: '', travel: '' })
    const [tabInstanceActivityMap, setTabInstanceActivityMap] = useState({ expense: {}, advance: {}, travel: {} })
    const [error, setError] = useState('')
    const [searchId, setSearchId] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 8
    const fetchSeqRef = useRef(0)

    const showSkeleton = loading
    const totalPending = (counts?.expense || 0) + (counts?.advance || 0) + (counts?.travel || 0)
    const showGlobalEmpty = countsReady && !loading && rows.length === 0 && !String(searchId || '').trim()

    const markPopupOpened = () => {
        try {
            window.__KF_DASH_POPUP_SEQ__ = Number(window.__KF_DASH_POPUP_SEQ__ || 0) + 1
            window.__KF_DASH_POPUP_OPENED_AT__ = Date.now()
        } catch {
            // ignore
        }
    }

    const paginateProcessApi = async (buildUrl) => {
        let allRows = []
        let allCols = []
        for (let page = 1; page <= MAX_PAGES; page++) {
            const url = buildUrl(page)
            const resp = await kf.api(url)
            const pageRows = Array.isArray(resp?.Data) ? resp.Data : Array.isArray(resp?.data) ? resp.data : []
            if (!allCols.length) allCols = resp?.Columns || resp?.columns || []
            if (!pageRows.length) break
            allRows = allRows.concat(pageRows)
            if (pageRows.length < PAGE_SIZE) break
        }
        return { allRows, allCols }
    }

    const fetchMyItemsStatusCounts = async (tab) => {
        if (!accountId || !tab) return {}
        try {
            const url = `/process/2/${accountId}/${tab.processId}/myitems/status/count?_application_id=${APP_ID}`
            const res = await kf.api(url)
            return {
                Draft: res?.Draft || 0,
                InProgress: res?.InProgress || 0,
                Completed: res?.Completed || 0,
                Withdrawn: res?.Withdrawn || 0,
                Rejected: res?.Rejected || 0,
            }
        } catch (e) {
            console.warn('My Items status count failed', tab.key, e)
            return {}
        }
    }

    const fetchProcessCounts = async () => {
        if (!accountId) return
        setCountsReady(false)
        try {
            if (scopeKey === 'myItems') {
                const results = await Promise.all(
                    TABS.map(async (t) => {
                        const sc = await fetchMyItemsStatusCounts(t)
                        const n = Number(sc?.[myItemsStatus] || 0)
                        return { key: t.key, count: n, statusCounts: sc }
                    }),
                )
                const next = { expense: 0, advance: 0, travel: 0 }
                const byStatus = {}
                for (const r of results) {
                    next[r.key] = r.count
                    byStatus[r.key] = r.statusCounts
                }
                setCounts(next)
                setStatusCounts(byStatus)
            } else if (scopeKey === 'myTasks') {
                const results = await Promise.all(
                    TABS.map(async (t) => {
                        try {
                            const url = `/process/2/${accountId}/${t.processId}/pending/activity/count?_application_id=${APP_ID}`
                            const resp = await kf.api(url)
                            const list = Array.isArray(resp) ? resp : resp?.Data || resp?.data || []
                            const count = Array.isArray(list)
                                ? list.reduce((sum, s) => sum + (Number(s?.Count) || Number(s?.count) || 0), 0)
                                : 0
                            return { key: t.key, count, steps: Array.isArray(list) ? list : [] }
                        } catch {
                            return { key: t.key, count: 0, steps: [] }
                        }
                    }),
                )
                const next = { expense: 0, advance: 0, travel: 0 }
                for (const r of results) next[r.key] = r.count
                setCounts(next)
                const activeSteps = results.find((r) => r.key === activeKey)?.steps || []
                setSteps(activeSteps)
            } else {
                const results = await Promise.all(
                    TABS.map(async (t) => {
                        try {
                            const url = `/process/2/${accountId}/${t.processId}/participated/activity/count?_application_id=${APP_ID}`
                            const resp = await kf.api(url)
                            const list = Array.isArray(resp) ? resp : resp?.Data || resp?.data || []
                            const count = Array.isArray(list)
                                ? list.reduce((sum, s) => sum + (Number(s?.Count) || Number(s?.count) || 0), 0)
                                : 0
                            return { key: t.key, count, steps: Array.isArray(list) ? list : [] }
                        } catch {
                            return { key: t.key, count: 0, steps: [] }
                        }
                    }),
                )
                const next = { expense: 0, advance: 0, travel: 0 }
                for (const r of results) next[r.key] = r.count
                setCounts(next)
                const activeSteps = results.find((r) => r.key === activeKey)?.steps || []
                setSteps(activeSteps)
            }
        } catch (e) {
            console.error('Counts fetch failed:', e)
        } finally {
            setCountsReady(true)
        }
    }

    const fetchTabActivityIds = async () => {
        if (!accountId) return
        try {
            const next = { expense: '', advance: '', travel: '' }
            const maps = { expense: {}, advance: {}, travel: {} }
            await Promise.all(
                TABS.map(async (t) => {
                    try {
                        const url = `/process/2/${accountId}/${t.processId}/pending/activity/count?_application_id=${APP_ID}`
                        const resp = await kf.api(url)
                        const list = Array.isArray(resp) ? resp : resp?.Data ?? resp?.data ?? []
                        const first = Array.isArray(list) ? list.find((x) => x?._id) : null
                        next[t.key] = first?._id ? String(first._id) : ''

                        if (Array.isArray(list)) {
                            await Promise.all(
                                list.slice(0, 5).map(async (act) => {
                                    const activityId = act?._id
                                    if (!activityId) return
                                    const pendingUrl = `/process/2/${accountId}/${t.processId}/pending/${activityId}?_application_id=${APP_ID}&page_number=1&page_size=${PAGE_SIZE}`
                                    try {
                                        const pendingResp = await kf.api(pendingUrl)
                                        const pendingRows = pendingResp?.Data || pendingResp?.data || []
                                        if (!Array.isArray(pendingRows)) return
                                        for (const r of pendingRows) {
                                            const iId = r?._id ? String(r._id) : ''
                                            const aId = r?._activity_instance_id ? String(r._activity_instance_id) : ''
                                            if (iId && aId) maps[t.key][iId] = aId
                                        }
                                    } catch {
                                        // ignore
                                    }
                                }),
                            )
                        }

                        for (let page = 1; page <= 3; page++) {
                            const myItemsUrl = `/process/2/${accountId}/${t.processId}/myitems?apply_preference=true&skip_aggregation=true&_application_id=${APP_ID}&page_number=${page}&page_size=${PAGE_SIZE}`
                            let myItemsResp
                            try {
                                myItemsResp = await kf.api(myItemsUrl)
                            } catch {
                                break
                            }
                            const myItemsRows = myItemsResp?.Data || myItemsResp?.data || []
                            if (!Array.isArray(myItemsRows) || !myItemsRows.length) break
                            for (const item of myItemsRows) {
                                const iId = item?._id ? String(item._id) : ''
                                const aId = item?._activity_instance_id ? String(item._activity_instance_id) : ''
                                if (iId && aId && !maps[t.key][iId]) maps[t.key][iId] = aId
                            }
                            if (myItemsRows.length < PAGE_SIZE) break
                        }
                    } catch (e) {
                        console.warn('Activity id map failed for', t.key, e)
                    }
                }),
            )
            setTabActivityIds(next)
            setTabInstanceActivityMap(maps)
        } catch (e) {
            console.warn('Pending activity id fetch failed:', e)
        }
    }

    const fetchList = async (tab) => {
        if (!accountId || !tab) return
        const seq = ++fetchSeqRef.current
        setLoading(true)
        setError('')
        try {
            let allRows = []
            let allCols = []

            if (scopeKey === 'myItems') {
                const status = myItemsStatus || 'Draft'
                const result = await paginateProcessApi(
                    (page) =>
                        `/process/2/${accountId}/${tab.processId}/myitems/${status}?page_number=${page}&page_size=${PAGE_SIZE}&_application_id=${APP_ID}`,
                )
                allRows = result.allRows
                allCols = result.allCols
            } else if (scopeKey === 'myTasks') {
                let stepId = activeStepId
                if (!stepId) {
                    const countUrl = `/process/2/${accountId}/${tab.processId}/pending/activity/count?_application_id=${APP_ID}`
                    const resp = await kf.api(countUrl)
                    const list = Array.isArray(resp) ? resp : resp?.Data || resp?.data || []
                    const stepsList = Array.isArray(list) ? list : []
                    if (seq === fetchSeqRef.current) setSteps(stepsList)
                    stepId = stepsList[0]?._id ? String(stepsList[0]._id) : ''
                    if (seq === fetchSeqRef.current) setActiveStepId(stepId)
                }
                if (stepId) {
                    const result = await paginateProcessApi(
                        (page) =>
                            `/process/2/${accountId}/${tab.processId}/pending/${stepId}?page_number=${page}&page_size=${PAGE_SIZE}&skip_aggregation=true&_application_id=${APP_ID}`,
                    )
                    allRows = result.allRows
                    allCols = result.allCols
                }
            } else {
                let stepId = activeStepId
                if (!stepId) {
                    const countUrl = `/process/2/${accountId}/${tab.processId}/participated/activity/count?_application_id=${APP_ID}`
                    const resp = await kf.api(countUrl)
                    const list = Array.isArray(resp) ? resp : resp?.Data || resp?.data || []
                    const stepsList = Array.isArray(list) ? list : []
                    if (seq === fetchSeqRef.current) setSteps(stepsList)
                    stepId = stepsList[0]?._id ? String(stepsList[0]._id) : ''
                    if (seq === fetchSeqRef.current) setActiveStepId(stepId)
                }
                if (stepId) {
                    const result = await paginateProcessApi(
                        (page) =>
                            `/process/2/${accountId}/${tab.processId}/participated/activity/${stepId}?page_number=${page}&page_size=${PAGE_SIZE}&skip_aggregation=true&_application_id=${APP_ID}`,
                    )
                    allRows = result.allRows
                    allCols = result.allCols
                }
            }

            if (seq !== fetchSeqRef.current) return
            const visibleCols = (allCols || []).filter((col) => !HIDDEN_COLUMNS.includes(col.Id))
            setCols(visibleCols)
            setRawCols(allCols)
            setRows(allRows)
            setCounts((prev) => ({ ...prev, [tab.key]: allRows.length }))
        } catch (e) {
            if (seq !== fetchSeqRef.current) return
            setError(e?.message || `Unable to fetch ${tab.label} items.`)
            setRows([])
            setCols([])
            setRawCols([])
        } finally {
            if (seq === fetchSeqRef.current) setLoading(false)
        }
    }

    useEffect(() => {
        if (!accountId) return
        fetchTabActivityIds()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId])

    useEffect(() => {
        if (!accountId) return
        setActiveStepId('')
        setSteps([])
        setCurrentPage(1)
        setSearchId('')
        fetchProcessCounts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId, scopeKey, myItemsStatus])

    useEffect(() => {
        if (!accountId || !countsReady) return
        setCurrentPage(1)
        setSearchId('')
        fetchList(activeTab)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId, countsReady, activeTab.key, scopeKey, myItemsStatus, activeStepId])

    useEffect(() => {
        if (!accountId || scopeKey === 'myItems') return
        let cancelled = false
        ;(async () => {
            try {
                const url =
                    scopeKey === 'myTasks'
                        ? `/process/2/${accountId}/${activeTab.processId}/pending/activity/count?_application_id=${APP_ID}`
                        : `/process/2/${accountId}/${activeTab.processId}/participated/activity/count?_application_id=${APP_ID}`
                const resp = await kf.api(url)
                const list = Array.isArray(resp) ? resp : resp?.Data || resp?.data || []
                if (cancelled) return
                const stepsList = Array.isArray(list) ? list : []
                setSteps(stepsList)
                setActiveStepId((prev) => {
                    if (prev && stepsList.some((s) => String(s?._id) === String(prev))) return prev
                    return stepsList[0]?._id ? String(stepsList[0]._id) : ''
                })
            } catch (e) {
                if (!cancelled) {
                    setSteps([])
                    setActiveStepId('')
                }
            }
        })()
        return () => {
            cancelled = true
        }
    }, [accountId, scopeKey, activeTab.processId, activeTab.key])

    const resolveIdsFromListPayload = (row) => {
        const ids = extractPopupIds(row)
        if (ids.instanceId && ids.activityId) return ids

        const colsByPattern = (pattern) =>
            (rawCols || []).filter((c) => pattern.test(String(c?.Name || ''))).map((c) => c.Id)

        const instanceCandidates = [
            ...colsByPattern(/instance.*id|request.*id|item.*id|record.*id|^id$/i),
            'Column_RzqotquBQV',
        ]
        const activityCandidates = [
            ...colsByPattern(/activity.*instance.*id|activity.*id|task.*id|workflow.*id|work item.*id/i),
            'Column_eFd2LUqnSP',
        ]

        const getFirstValue = (candidateIds) => {
            for (const colId of candidateIds) {
                const value = row?.[colId]
                if (value !== null && value !== undefined && String(value).trim() !== '') {
                    return String(value)
                }
            }
            return ''
        }

        const resolvedInstanceId = ids.instanceId || getFirstValue(instanceCandidates)
        const mappedActivityId =
            resolvedInstanceId && tabInstanceActivityMap?.[activeTab.key]?.[resolvedInstanceId]
                ? String(tabInstanceActivityMap[activeTab.key][resolvedInstanceId])
                : ''

        return {
            instanceId: resolvedInstanceId,
            activityId: ids.activityId || getFirstValue(activityCandidates) || mappedActivityId,
        }
    }

    const getRowId = (row, idx) => row?._id || row?.Column_RzqotquBQV || `${activeTab.key}-${idx}`
    const filteredRows = useMemo(() => {
        const q = String(searchId || '').trim().toLowerCase()
        if (!q) return rows
        return rows.filter((row, idx) => String(getRowId(row, idx)).toLowerCase().includes(q))
    }, [rows, searchId, activeTab.key])

    const expenseFieldIds = useMemo(() => resolveExpenseFieldIds(rawCols), [rawCols])

    const expenseViewRows = useMemo(() => {
        if (activeTab.key !== 'expense') return null
        const ids = expenseFieldIds || EMPTY_EXPENSE_FIELD_IDS
        const built = filteredRows.map((row) => {
            const view = buildExpenseRowView(row, ids)
            return { row, ...view }
        })
        built.sort(comparePendingBySlaThenRecent)
        return built
    }, [filteredRows, activeTab.key, expenseFieldIds])

    const advanceViewRows = useMemo(() => {
        if (activeTab.key !== 'advance') return null
        const built = filteredRows.map((row) => ({ row, ...buildAdvanceRowView(row) }))
        built.sort(comparePendingBySlaThenRecent)
        return built
    }, [filteredRows, activeTab.key])

    const travelViewRows = useMemo(() => {
        if (activeTab.key !== 'travel') return null
        const built = filteredRows.map((row) => ({ row, ...buildTravelRowView(row) }))
        built.sort(comparePendingBySlaThenRecent)
        return built
    }, [filteredRows, activeTab.key])

    const paginationLength =
        activeTab.key === 'expense' && expenseViewRows != null
            ? expenseViewRows.length
            : activeTab.key === 'advance' && advanceViewRows != null
              ? advanceViewRows.length
              : activeTab.key === 'travel' && travelViewRows != null
                ? travelViewRows.length
              : filteredRows.length
    const totalPages = Math.max(1, Math.ceil(paginationLength / pageSize))
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        if (activeTab.key === 'expense' && expenseViewRows) {
            return expenseViewRows.slice(start, start + pageSize)
        }
        if (activeTab.key === 'advance' && advanceViewRows) {
            return advanceViewRows.slice(start, start + pageSize)
        }
        if (activeTab.key === 'travel' && travelViewRows) {
            return travelViewRows.slice(start, start + pageSize)
        }
        return filteredRows.slice(start, start + pageSize)
    }, [filteredRows, activeTab.key, expenseViewRows, advanceViewRows, travelViewRows, currentPage, pageSize])

    useEffect(() => {
        setCurrentPage(1)
        setSearchId('')
        if (scopeKey !== 'myItems') setActiveStepId('')
        setLoading(true)
    }, [activeKey, scopeKey])

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages)
    }, [currentPage, totalPages])

    const handleRowClick = async (row) => {
        const { instanceId, activityId } = resolveIdsFromListPayload(row)
        if (!instanceId) {
            console.warn('Pending Approvals: missing popup ids', {
                tab: activeTab.key,
                instanceId,
                activityId,
                row,
            })
            kf?.client?.showInfo?.('Unable to open details for this record.')
            return
        }
        // Same strategy as LeadsManagementPage: prioritize activity-instance context
        // and keep broad aliases for popup compatibility.
        const activityInstanceId = activityId || ''
        const fallbackActivityId = tabActivityIds[activeTab.key] || ''
        const resolvedActivityId = activityInstanceId || fallbackActivityId
        if (!resolvedActivityId) {
            console.warn('Pending Approvals: missing activity instance id', {
                tab: activeTab.key,
                instanceId,
                row,
            })
            kf?.client?.showInfo?.('Unable to open this record: missing workflow activity context.')
            return
        }

        try {
            markPopupOpened()
            kf.app.page.openPopup(activeTab.popup, {
                ActivityID: resolvedActivityId,
                InstanceId: instanceId,
                ActivityInstanceId: activityInstanceId || resolvedActivityId,
                ActivityId: resolvedActivityId,
                activityId: resolvedActivityId,
                // Compatibility aliases
                InstanceID: instanceId,
                instance_id: instanceId,
                activity_instance_id: activityInstanceId || resolvedActivityId,
                width: 960,
                height: 720,
                popupWidth: '960px',
                popupHeight: '720px',
            })
            // Parent dashboard refreshes on focus/visibility regain.
            if (typeof onPopupClosed === 'function') {
                // still call after a short delay (covers cases where platform doesn't change focus)
                setTimeout(() => onPopupClosed(), 1500)
            }
        } catch (e) {
            console.error('Pending Approvals popup open failed', e)
            kf?.client?.showInfo?.('Unable to open details popup.')
        }
    }

    return (
        <div className="overflow-hidden rounded-xl border border-white/80 bg-white/95 shadow-lg shadow-slate-200/40 backdrop-blur-sm sm:rounded-2xl lg:rounded-3xl">
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/40 px-3 py-3 sm:px-5 sm:py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2879b6]/10 text-[#2879b6] sm:h-9 sm:w-9 sm:rounded-xl">
                            <i className="ri-folder-user-line text-lg" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[15px] font-semibold text-slate-800 sm:text-base">My Records</h3>
                            <p className="text-[11px] text-slate-500 sm:text-xs">
                                Drafts, items, tasks & participated · all processes
                            </p>
                        </div>
                    </div>
                    <div className="w-full overflow-x-auto hide-scrollbar sm:w-auto">
                        <div className="inline-flex w-full min-w-max items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-sm sm:w-auto sm:rounded-xl">
                            {SCOPE_TABS.map((scope) => {
                                const isActive = scopeKey === scope.key
                                return (
                                    <button
                                        key={scope.key}
                                        type="button"
                                        onClick={() => setScopeKey(scope.key)}
                                        className="btn-press flex-1 cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:flex-none sm:rounded-lg sm:px-3 sm:py-1.5"
                                        style={
                                            isActive
                                                ? {
                                                      background: '#0f172a',
                                                      color: '#fff',
                                                      boxShadow: '0 4px 12px -2px rgba(15,23,42,0.35)',
                                                  }
                                                : { color: '#64748b', background: 'transparent' }
                                        }
                                    >
                                        {scope.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-x-auto hide-scrollbar">
                    <div className="inline-flex w-full min-w-max items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-sm sm:rounded-xl">
                        {TABS.map((tab) => {
                            const isActive = activeKey === tab.key
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveKey(tab.key)}
                                    className="btn-press flex-1 cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:flex-none sm:rounded-lg sm:px-3 sm:py-1.5"
                                    style={
                                        isActive
                                            ? { background: tab.color, color: '#fff', boxShadow: `0 4px 12px -2px ${tab.glow}` }
                                            : { color: '#64748b', background: 'transparent' }
                                    }
                                >
                                    <span className="sm:hidden">{tab.short}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="ml-1 opacity-80">({counts[tab.key] ?? 0})</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {scopeKey === 'myItems' ? (
                    <div className="w-full overflow-x-auto hide-scrollbar">
                        <div className="inline-flex min-w-max items-center gap-1.5">
                            {MY_ITEMS_STATUSES.map((st) => {
                                const isActive = myItemsStatus === st.key
                                const n = statusCounts?.[activeKey]?.[st.key]
                                return (
                                    <button
                                        key={st.key}
                                        type="button"
                                        onClick={() => setMyItemsStatus(st.key)}
                                        className="btn-press rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all sm:text-xs"
                                        style={
                                            isActive
                                                ? {
                                                      background: 'rgba(40,121,182,0.12)',
                                                      color: '#2879b6',
                                                      boxShadow: 'inset 0 0 0 1px rgba(40,121,182,0.35)',
                                                  }
                                                : {
                                                      background: '#f8fafc',
                                                      color: '#64748b',
                                                      boxShadow: 'inset 0 0 0 1px #e2e8f0',
                                                  }
                                        }
                                    >
                                        {st.label}
                                        {n != null ? <span className="ml-1 opacity-70">{n}</span> : null}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : null}

                {(scopeKey === 'myTasks' || scopeKey === 'participated') && steps.length > 0 ? (
                    <div className="w-full overflow-x-auto hide-scrollbar">
                        <div className="inline-flex min-w-max items-center gap-1.5">
                            {steps.map((s) => {
                                const id = String(s?._id || '')
                                const isActive = String(activeStepId) === id
                                const label = s?.StepName || s?.Name || s?.name || 'Step'
                                const n = Number(s?.Count) || Number(s?.count) || 0
                                return (
                                    <button
                                        key={id || label}
                                        type="button"
                                        onClick={() => setActiveStepId(id)}
                                        className="btn-press rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all sm:text-xs"
                                        style={
                                            isActive
                                                ? {
                                                      background: 'rgba(40,121,182,0.12)',
                                                      color: '#2879b6',
                                                      boxShadow: 'inset 0 0 0 1px rgba(40,121,182,0.35)',
                                                  }
                                                : {
                                                      background: '#f8fafc',
                                                      color: '#64748b',
                                                      boxShadow: 'inset 0 0 0 1px #e2e8f0',
                                                  }
                                        }
                                    >
                                        {label}
                                        <span className="ml-1 opacity-70">{n}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : null}
            </div>
            <div className="p-3 sm:p-4 lg:p-5">
            <div className="mb-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-sm focus-within:border-[#2879b6] focus-within:ring-2 focus-within:ring-[#2879b6]/20 sm:rounded-xl sm:py-2">
                    <i className="ri-search-line text-base text-slate-400 sm:text-sm" />
                    <input
                        value={searchId}
                        onChange={(e) => {
                            setSearchId(e.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search by ID..."
                        className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none sm:text-xs"
                    />
                </div>
            </div>

            {showSkeleton ? (
                <div
                    className="rounded-xl overflow-hidden animate-pulse"
                    style={{
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        maxHeight: 5 * 52 + 44,
                    }}
                >
                    <div
                        style={{
                            height: 44,
                            borderBottom: '1px solid #EAECF0',
                            background: 'rgba(248, 250, 252, 0.95)',
                            display: 'grid',
                            gridTemplateColumns:
                                activeKey === 'expense' || activeKey === 'advance' || activeKey === 'travel'
                                    ? 'minmax(100px,1fr) minmax(88px,0.8fr) minmax(96px,0.9fr) minmax(120px,1.05fr) 0.7fr minmax(100px,1fr) minmax(100px,1fr) minmax(120px,1.05fr)'
                                    : '1.2fr 1fr 1fr 1fr',
                            gap: 10,
                            padding: '10px 12px',
                        }}
                    >
                        {Array.from({ length: activeKey === 'expense' || activeKey === 'advance' ? 8 : activeKey === 'travel' ? 9 : 4 }, (_, i) => (
                            <div key={`sk-h-${i}`} style={{ height: 12, borderRadius: 6, background: '#E5E7EB' }} />
                        ))}
                    </div>

                    <div style={{ background: '#FFFFFF' }}>
                        {[0, 1, 2, 3, 4].map((r) => (
                            <div
                                key={`sk-r-${r}`}
                                style={{
                                    height: 52,
                                    borderBottom: r === 4 ? 'none' : '1px solid #F2F4F7',
                                    display: 'grid',
                                    gridTemplateColumns:
                                        activeKey === 'expense' || activeKey === 'advance' || activeKey === 'travel'
                                            ? 'minmax(100px,1fr) minmax(88px,0.8fr) minmax(96px,0.9fr) minmax(120px,1.05fr) 0.7fr minmax(100px,1fr) minmax(100px,1fr) minmax(120px,1.05fr)'
                                            : '1.2fr 1fr 1fr 1fr',
                                    gap: 10,
                                    padding: '10px 12px',
                                    alignItems: 'center',
                                }}
                            >
                                {Array.from({ length: activeKey === 'expense' || activeKey === 'advance' ? 8 : activeKey === 'travel' ? 9 : 4 }, (__, c) => (
                                    <div
                                        key={`sk-c-${r}-${c}`}
                                        style={{
                                            height: 10,
                                            borderRadius: 999,
                                            background: c === 0 ? '#E5E7EB' : '#EDF1F5',
                                            width: c === 0 ? '85%' : c === 6 || c === 3 ? '60%' : '75%',
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : error ? (
                <div className="text-xs p-3 rounded-lg" style={{ color: '#B42318', background: '#FFFBFA', border: '1px solid #FDA29B' }}>
                    {error}
                </div>
            ) : showGlobalEmpty ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:h-14 sm:w-14">
                        <i className="ri-inbox-2-line text-xl text-slate-400 sm:text-2xl" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No records found</p>
                    <p className="mt-1 text-xs text-slate-500">
                        No {scopeKey === 'myItems' ? MY_ITEMS_STATUSES.find((s) => s.key === myItemsStatus)?.label || 'items' : scopeKey === 'myTasks' ? 'tasks' : 'participated items'} in this process.
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400">Try another tab or process.</div>
                </div>
            ) : filteredRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-800">No matching pending records</p>
                    <p className="mt-1 text-xs text-slate-500">Try a different ID or clear the search.</p>
                </div>
            ) : activeKey === 'expense' ? (
                <div
                    className="rounded-xl overflow-x-auto overflow-y-auto"
                    style={{
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        maxHeight: 5 * 52 + 44,
                    }}
                >
                    <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 1020 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #EAECF0' }}>
                                {[
                                    { label: 'Expense ID', align: 'left' },
                                    { label: 'Request Date', align: 'left' },
                                    { label: 'Requestor', align: 'left' },
                                    { label: 'Expense Type', align: 'left' },
                                    { label: 'Total Amount', align: 'right' },
                                    { label: 'Current step', align: 'left' },
                                    { label: 'SLA', align: 'left' },
                                ].map((h) => (
                                    <th
                                        key={h.label}
                                        className="text-[10px] sm:text-xs font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap px-3 py-2.5"
                                        style={{
                                            textAlign: h.align,
                                            background: 'rgba(248, 250, 252, 0.95)',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 1,
                                        }}
                                    >
                                        {h.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((entry, idx) => {
                                const tkey = normalizeExpenseTypeKey(entry.expenseType)
                                const cfg = EXPENSE_TYPE_STYLE[tkey] || EXPENSE_TYPE_STYLE.other
                                return (
                                    <tr
                                        key={getRowId(entry.row, idx)}
                                        onClick={() => handleRowClick(entry.row)}
                                        className="cursor-pointer transition-all"
                                        style={{
                                            borderBottom: '1px solid #F2F4F7',
                                            transformOrigin: 'center',
                                            transition: 'all 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f8faff'
                                            e.currentTarget.style.boxShadow = `inset 3px 0 0 ${activeTab.color}`
                                            e.currentTarget.style.transform = 'translateX(2px)'
                                            e.currentTarget.style.filter = 'none'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#FFFFFF'
                                            e.currentTarget.style.boxShadow = 'none'
                                            e.currentTarget.style.transform = 'none'
                                            e.currentTarget.style.filter = 'none'
                                        }}
                                    >
                                        <td className="px-3 py-2.5 align-middle" style={{ fontSize: 12, color: '#101828' }}>
                                            <span
                                                className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg max-w-[140px] truncate align-middle"
                                                style={{ background: 'rgba(40,121,182,0.08)', color: '#2879b6' }}
                                                title={entry.expenseId}
                                            >
                                                {entry.expenseId}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle text-[11px] sm:text-xs text-gray-500 whitespace-nowrap">
                                            {entry.requestDateStr || '—'}
                                        </td>
                                        <td className="px-3 py-2.5 align-middle max-w-[140px]">
                                            <span className="text-[11px] sm:text-xs text-gray-700 truncate block" title={entry.requestorText || ''}>
                                                {entry.requestorText || '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${cfg.colorFrom}, ${cfg.colorTo})`,
                                                    }}
                                                >
                                                    <i className={`${cfg.icon} text-white text-sm`} />
                                                </div>
                                                <span className="text-[11px] sm:text-xs font-semibold truncate min-w-0" style={{ color: cfg.text }}>
                                                    {entry.expenseType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle text-right">
                                            <span className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums">{formatINR(entry.totalAmount)}</span>
                                        </td>
                                        <td className="px-3 py-2.5 align-top max-w-[200px]">
                                            <CurrentStepBadges text={entry.currentStep} size="sm" />
                                        </td>
                                        <td className="px-3 py-2.5 align-top">
                                            <SlaCell deadlineAtMs={entry.deadlineAtMs} deadlineLabel={entry.deadlineText} size="sm" />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : activeKey === 'advance' ? (
                <div
                    className="rounded-xl overflow-x-auto overflow-y-auto"
                    style={{
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        maxHeight: 5 * 52 + 44,
                    }}
                >
                    <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 980 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #EAECF0' }}>
                                {[
                                    { label: 'Request ID', align: 'left' },
                                    { label: 'Requested Date', align: 'left' },
                                    { label: 'Requestor', align: 'left' },
                                    { label: 'Link To Travel', align: 'left' },
                                    { label: 'Advance Amount', align: 'right' },
                                    { label: 'Current step', align: 'left' },
                                    { label: 'SLA', align: 'left' },
                                ].map((h) => (
                                    <th
                                        key={h.label}
                                        className="text-[10px] sm:text-xs font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap px-3 py-2.5"
                                        style={{
                                            textAlign: h.align,
                                            background: 'rgba(248, 250, 252, 0.95)',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 1,
                                        }}
                                    >
                                        {h.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((entry, idx) => (
                                <tr
                                    key={getRowId(entry.row, idx)}
                                    onClick={() => handleRowClick(entry.row)}
                                    className="cursor-pointer transition-all"
                                    style={{
                                        borderBottom: '1px solid #F2F4F7',
                                        transformOrigin: 'center',
                                        transition: 'all 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f8faff'
                                        e.currentTarget.style.boxShadow = `inset 3px 0 0 ${activeTab.color}`
                                        e.currentTarget.style.transform = 'translateX(2px)'
                                        e.currentTarget.style.filter = 'none'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#FFFFFF'
                                        e.currentTarget.style.boxShadow = 'none'
                                        e.currentTarget.style.transform = 'none'
                                        e.currentTarget.style.filter = 'none'
                                    }}
                                >
                                    <td className="px-3 py-2.5 align-middle" style={{ fontSize: 12, color: '#101828' }}>
                                        <span
                                            className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg max-w-[160px] truncate align-middle"
                                            style={{ background: 'rgba(125,194,68,0.12)', color: '#3f6212' }}
                                            title={entry.requestId}
                                        >
                                            {entry.requestId}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle text-[11px] sm:text-xs text-gray-500 whitespace-nowrap">
                                        {entry.requestedDateStr || '—'}
                                    </td>
                                    <td className="px-3 py-2.5 align-middle max-w-[140px]">
                                        <span className="text-[11px] sm:text-xs text-gray-700 truncate block" title={entry.requestorText || ''}>
                                            {entry.requestorText || '—'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle max-w-[340px]">
                                        <span className="text-[11px] sm:text-xs text-gray-700 truncate block" title={entry.linkToTravelText}>
                                            {entry.linkToTravelText}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle text-right">
                                        <span className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums">{formatINR(entry.advanceAmount)}</span>
                                    </td>
                                    <td className="px-3 py-2.5 align-top max-w-[220px]">
                                        <CurrentStepBadges text={entry.currentStep} size="sm" />
                                    </td>
                                    <td className="px-3 py-2.5 align-top">
                                        <SlaCell deadlineAtMs={entry.deadlineAtMs} deadlineLabel={entry.deadlineText} size="sm" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeKey === 'travel' ? (
                <div
                    className="rounded-xl overflow-x-auto overflow-y-auto"
                    style={{
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        maxHeight: 5 * 52 + 44,
                    }}
                >
                    <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 1080 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #EAECF0' }}>
                                {[
                                    { label: 'Request ID', align: 'left' },
                                    { label: 'Requestor', align: 'left' },
                                    { label: 'Trip Type', align: 'left' },
                                    { label: 'Departure Date', align: 'left' },
                                    { label: 'Source (From)', align: 'left' },
                                    { label: 'Destination (To)', align: 'left' },
                                    { label: 'Booking Amount', align: 'right' },
                                    { label: 'Current step', align: 'left' },
                                    { label: 'SLA', align: 'left' },
                                ].map((h) => (
                                    <th
                                        key={h.label}
                                        className="text-[10px] sm:text-xs font-semibold text-[#475569] uppercase tracking-wider whitespace-nowrap px-3 py-2.5"
                                        style={{
                                            textAlign: h.align,
                                            background: 'rgba(248, 250, 252, 0.95)',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 1,
                                        }}
                                    >
                                        {h.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((entry, idx) => {
                                const typeStyle = TRAVEL_TYPE_STYLE[entry.travelTypeKey] || {
                                    bg: 'rgba(100,116,139,0.10)',
                                    color: '#475569',
                                }
                                return (
                                <tr
                                    key={getRowId(entry.row, idx)}
                                    onClick={() => handleRowClick(entry.row)}
                                    className="cursor-pointer transition-all"
                                    style={{
                                        borderBottom: '1px solid #F2F4F7',
                                        transformOrigin: 'center',
                                        transition: 'all 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f8faff'
                                        e.currentTarget.style.boxShadow = `inset 3px 0 0 ${activeTab.color}`
                                        e.currentTarget.style.transform = 'translateX(2px)'
                                        e.currentTarget.style.filter = 'none'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#FFFFFF'
                                        e.currentTarget.style.boxShadow = 'none'
                                        e.currentTarget.style.transform = 'none'
                                        e.currentTarget.style.filter = 'none'
                                    }}
                                >
                                    <td className="px-3 py-2.5 align-middle" style={{ fontSize: 12, color: '#101828' }}>
                                        <span
                                            className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg max-w-[160px] truncate align-middle"
                                            style={{ background: 'rgba(238,106,49,0.12)', color: '#9a3412' }}
                                            title={entry.requestId}
                                        >
                                            {entry.requestId}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle max-w-[140px]">
                                        <span className="text-[11px] sm:text-xs text-gray-700 truncate block" title={entry.requestorText || ''}>
                                            {entry.requestorText || '—'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                                        <span
                                            className="inline-block text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg"
                                            style={{ background: typeStyle.bg, color: typeStyle.color }}
                                        >
                                            {entry.tripTypeLabel}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-middle text-[11px] sm:text-xs text-gray-500 whitespace-nowrap">
                                        {entry.departureDateStr || '—'}
                                    </td>
                                    {entry.isMultiCity ? (
                                        <td className="px-3 py-2.5 align-middle" colSpan={2}>
                                            <span
                                                className="text-[11px] sm:text-xs font-semibold text-gray-700"
                                                title={entry.routeSummary || entry.fromText}
                                            >
                                                {entry.routeSummary || entry.fromText || '—'}
                                            </span>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-3 py-2.5 align-middle">
                                                <span className="text-[11px] sm:text-xs font-semibold text-gray-700">{entry.fromText}</span>
                                            </td>
                                            <td className="px-3 py-2.5 align-middle">
                                                <span className="text-[11px] sm:text-xs font-semibold text-gray-700">{entry.toTextValue}</span>
                                            </td>
                                        </>
                                    )}
                                    <td className="px-3 py-2.5 align-middle text-right whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums">
                                            {formatINR(entry.bookingAmount)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 align-top max-w-[220px]">
                                        <CurrentStepBadges text={entry.currentStep} size="sm" />
                                    </td>
                                    <td className="px-3 py-2.5 align-top">
                                        <SlaCell deadlineAtMs={entry.deadlineAtMs} deadlineLabel={entry.deadlineText} size="sm" />
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div
                    className="rounded-xl overflow-x-auto overflow-y-auto"
                    style={{
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        maxHeight: 5 * 52 + 44,
                    }}
                >
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                        <thead>
                            <tr>
                                {cols.map((c) => (
                                    <th
                                        key={c.Id}
                                        style={{
                                            textAlign: 'left',
                                            padding: '10px 12px',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            borderBottom: '1px solid #EAECF0',
                                            background: 'rgba(248, 250, 252, 0.95)',
                                            whiteSpace: 'nowrap',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 1,
                                        }}
                                    >
                                        {c.Name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((row, idx) => (
                                <tr
                                    key={getRowId(row, idx)}
                                    onClick={() => handleRowClick(row)}
                                    className="cursor-pointer transition-all"
                                    style={{
                                        borderBottom: '1px solid #F2F4F7',
                                        transformOrigin: 'center',
                                        transition: 'all 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f8faff'
                                        e.currentTarget.style.boxShadow = `inset 3px 0 0 ${activeTab.color}`
                                        e.currentTarget.style.transform = 'translateX(2px)'
                                        e.currentTarget.style.filter = 'none'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#FFFFFF'
                                        e.currentTarget.style.boxShadow = 'none'
                                        e.currentTarget.style.transform = 'none'
                                        e.currentTarget.style.filter = 'none'
                                    }}
                                >
                                    {cols.map((c) => (
                                        <td
                                            key={c.Id}
                                            style={{
                                                padding: '12px 12px',
                                                fontSize: 12,
                                                color: '#101828',
                                                verticalAlign: 'middle',
                                                maxWidth: 240,
                                                transition: 'padding 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            }}
                                        >
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {toText(row?.[c.Id]) || <span style={{ color: '#98A2B3' }}>—</span>}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!showSkeleton && !error && filteredRows.length > 0 && (
                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-[9px] sm:text-xs text-slate-500">
                        Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, paginationLength)} of {paginationLength}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                        >
                            <i className="ri-arrow-left-s-line" />
                        </button>
                        <span className="text-[9px] sm:text-xs text-slate-600 px-2 font-medium">
                            {currentPage}/{totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                        >
                            <i className="ri-arrow-right-s-line" />
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}
