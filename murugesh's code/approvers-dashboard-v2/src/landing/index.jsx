import { useState, useEffect, useRef } from 'react'
import { kf } from './../sdk/index.js'
import PendingApprovalsWidget from './components/PendingApprovalsWidget.jsx'

const APP_ID = 'Expense_and_Travel_Management_A00'
const EMPLOYEE_DASHBOARD_PAGE_ID = 'Employee_Dashboard_V2_A00'
const REPORT_PAGE_SIZE = 2000
const REPORT_MAX_PAGES = 15

/** Pending items per process — same reports as the pending-approvals widget */
const PENDING_COUNT_TABS = [
    { key: 'travel', processId: 'Travel_Management_A02', reportId: 'All_Items_A00' },
    { key: 'advance', processId: 'Advance_Payment_Request_Process_A01', reportId: 'ALL_ITEMS_WITH_TABLE_A00' },
    { key: 'expense', processId: 'Expense_Management_A03', reportId: 'All_Items_MK_A00' },
]

const EXCEPTION_COL = {
    expense: 'Column__hqtAn5Ntn',
    advance: 'Column_ke6yUOIhtC',
    travel: 'Column_9UVEZRstyf',
}

function isYesLike(raw) {
    if (raw === true) return true
    if (raw === false || raw == null || raw === '') return false
    if (typeof raw === 'number') return raw === 1
    const s = String(raw).trim().toLowerCase()
    return s === 'yes' || s === 'true' || s === '1'
}

const TAB_STATUS_VALUE = {
    expense: (row) => row?.['Column_ly2Y3J4L9f'] || row?.['Column_dfTTpYLnJ0'] || row?.['Column_-9Qj6UkJOI'],
    advance: (row) => row?.['Column_p9wbFBO6NA'] || row?.['Column_PdcYkpz3ei'],
    travel: (row) => row?.['Column_iujlmrkz00'] || row?.['Column_hx4B-_JQjZ'],
}

/** SLA deadlines per process (prefer explicit IDs; fallback to name-matching). */
const DEADLINE_COL_IDS = {
    // Same as widget `EMPTY_EXPENSE_FIELD_IDS.slaDeadline`
    expense: ['Column_KD_a7365Yi'],
    // Same as widget `ADVANCE_FIELD_IDS.slaDeadline`
    advance: ['Column_Wc-2EfDPkD'],
    // Same as widget `TRAVEL_FIELD_IDS.slaDeadline`
    travel: ['Column_3l8DHla3JD'],
}

/** How far ahead of the deadline counts as “nearing SLA” (still pending, not yet breached) */
const NEARING_SLA_MS = 48 * 60 * 60 * 1000

function isPendingStatus(text) {
    const s = String(text || '').toLowerCase()
    if (!s) return true
    if (s.includes('reject') || s.includes('cancel') || s.includes('complete') || s.includes('approve') || s.includes('booked') || s.includes('paid')) return false
    return s.includes('pending') || s.includes('progress') || s.includes('review') || s.includes('approval') || s.includes('desk')
}

function findDeadlineColumnId(columns) {
    const cols = columns || []
    const col = cols.find((c) => {
        const n = String(c?.Name || '').toLowerCase()
        if (/\bdeadline\b/.test(n)) return true
        if (n.includes('sla') && (n.includes('due') || n.includes('end') || n.includes('deadline'))) return true
        if (n.includes('due') && n.includes('date')) return true
        return false
    })
    return col?.Id || ''
}

function deadlineRawToMs(raw) {
    if (raw == null || raw === '') return NaN
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw > 1e12 ? raw : raw * 1000
    if (typeof raw === 'string') {
        const d = new Date(raw)
        return Number.isNaN(d.getTime()) ? NaN : d.getTime()
    }
    if (typeof raw === 'object') {
        const v = raw.Value ?? raw.value ?? raw.Text ?? raw.text ?? raw.Name ?? raw.name
        if (v != null && v !== raw) return deadlineRawToMs(v)
        const d = new Date(String(raw))
        return Number.isNaN(d.getTime()) ? NaN : d.getTime()
    }
    return NaN
}

function earliestDeadlineMsForRow(row, tabKey, fallbackDeadlineColId) {
    const ids = DEADLINE_COL_IDS?.[tabKey] || []
    let best = Number.POSITIVE_INFINITY

    for (const colId of ids) {
        const ms = deadlineRawToMs(row?.[colId])
        if (Number.isFinite(ms) && ms > 0 && ms < best) best = ms
    }

    if (fallbackDeadlineColId) {
        const ms = deadlineRawToMs(row?.[fallbackDeadlineColId])
        if (Number.isFinite(ms) && ms > 0 && ms < best) best = ms
    }

    return best === Number.POSITIVE_INFINITY ? NaN : best
}

const COUNT_UP_MS = 1100

function useCountUp(endValue, duration = COUNT_UP_MS) {
    const [display, setDisplay] = useState(0)
    const displayRef = useRef(0)

    useEffect(() => {
        const to = Number.isFinite(Number(endValue)) ? Math.round(Number(endValue)) : 0
        const from = displayRef.current
        let raf = 0
        const t0 = performance.now()
        const easeOutCubic = (t) => 1 - (1 - t) ** 3

        const step = (now) => {
            const t = Math.min(1, (now - t0) / duration)
            const v = from + (to - from) * easeOutCubic(t)
            const rounded = Math.round(v)
            setDisplay(rounded)
            displayRef.current = rounded
            if (t < 1) raf = requestAnimationFrame(step)
            else {
                displayRef.current = to
                setDisplay(to)
            }
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [endValue, duration])

    return display
}

function AnimatedInt({ value, className, style }) {
    const n = useCountUp(value)
    return (
        <span className={className} style={style}>
            {n.toLocaleString('en-IN')}
        </span>
    )
}

/** Project-management KPI card tokens (EmpKPICards / reports Kpi). */
const COMPACT_CARD = {
    pending: {
        accent: 'text-[#1E88E5]',
        valueColor: '#1E88E5',
        bar: 'from-sky-50 via-white to-indigo-50',
        ring: 'ring-sky-500/15',
        iconColor: '#1E88E5',
        chip: 'border-sky-200 bg-sky-50',
    },
    nearing: {
        accent: 'text-[#FB8C00]',
        valueColor: '#FB8C00',
        bar: 'from-amber-50 via-white to-orange-50',
        ring: 'ring-amber-500/15',
        iconColor: '#FB8C00',
        chip: 'border-amber-200 bg-amber-50',
    },
    breached: {
        accent: 'text-[#E53935]',
        valueColor: '#E53935',
        bar: 'from-rose-50 via-white to-red-50',
        ring: 'ring-red-500/15',
        iconColor: '#E53935',
        chip: 'border-rose-200 bg-rose-50',
    },
    exception: {
        accent: 'text-[#7c3aed]',
        valueColor: '#7c3aed',
        bar: 'from-violet-50 via-white to-purple-50',
        ring: 'ring-violet-500/15',
        iconColor: '#7c3aed',
        chip: 'border-violet-200 bg-violet-50',
    },
}

function toInitials(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    if (!parts.length) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
}

function CompactSummaryCard({ title, values, variant, iconClass, delayClass = '', subtext = '' }) {
    const s = COMPACT_CARD[variant]
    const expense = values?.expense ?? 0
    const advance = values?.advance ?? 0
    const travel = values?.travel ?? 0
    const total = expense + advance + travel
    return (
        <div
            className={`kpi-card group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br ${s.bar} p-3.5 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.12)] ring-1 ${s.ring} transition duration-200 active:scale-[0.98] sm:rounded-2xl sm:p-4 lg:rounded-3xl lg:p-5 animate-fade-in-up ${delayClass}`}
        >
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold leading-snug text-slate-800 sm:text-sm">{title}</p>
                    {subtext ? <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-xs">{subtext}</p> : null}
                </div>
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/90 text-base shadow-sm ring-1 ring-slate-200/60 sm:h-10 sm:w-10 sm:text-base"
                    style={{ color: s.iconColor }}
                >
                    <i className={iconClass} aria-hidden />
                </div>
            </div>
            <p className={`text-2xl font-bold tabular-nums leading-none sm:text-3xl ${s.accent}`}>
                <AnimatedInt value={total} />
            </p>

            <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-slate-200/80 pt-3 sm:gap-2">
                {[
                    { label: 'Booking', value: travel },
                    { label: 'Advance', value: advance },
                    { label: 'Expense', value: expense },
                ].map((item) => (
                    <div
                        key={item.label}
                        className={`min-w-0 rounded-xl border px-1.5 py-1.5 text-center shadow-sm sm:px-2 sm:py-2 sm:text-left ${s.chip}`}
                    >
                        <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-[#2C3E50] sm:text-[10px]">
                            {item.label}
                        </p>
                        <AnimatedInt
                            value={item.value}
                            className="text-xs font-bold tabular-nums leading-tight sm:text-sm"
                            style={{ color: s.valueColor }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function DefaultLandingComponent() {
    const [scope, setScope] = useState('team')
    const [refreshNonce, setRefreshNonce] = useState(0)
    const [pendingCounts, setPendingCounts] = useState({
        expense: 0,
        advance: 0,
        travel: 0,
    })
    const [slaSummary, setSlaSummary] = useState({
        nearingSla: { expense: 0, advance: 0, travel: 0 },
        breachedSla: { expense: 0, advance: 0, travel: 0 },
        exception: { expense: 0, advance: 0, travel: 0 },
    })

    const userName = (kf && kf.user && kf.user.Name) || ''
    const accountId = kf?.account?._id
    const userId = String(kf?.user?._id || '').trim()

    /** Full user profile includes accurate `Company`; `kf.user.Company` may be empty — overwritten after `/user/2/...` fetch. */
    const [resolvedCompany, setResolvedCompany] = useState(() =>
        String(kf?.user?.Company || '').trim()
    )
    const companyDisplayName = resolvedCompany.trim() || 'Refex Group'

    useEffect(() => {
        if (!accountId || !userId || typeof kf?.api !== 'function') return
        let cancelled = false
        ;(async () => {
            try {
                const url = `/user/2/${accountId}/${userId}`
                const resp = await kf.api(url, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                })
                const co = String(resp?.Company ?? '').trim()
                if (!cancelled && co) setResolvedCompany(co)
            } catch (e) {
                console.warn('[approvers-dashboard] User profile fetch failed', e)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [accountId, userId])

    const appRoles = Array.isArray(kf?.user?.AppRoles)
        ? kf.user.AppRoles
        : Array.isArray(kf?.user?.Roles)
          ? kf.user.Roles
          : Array.isArray(kf?.user?.roles)
            ? kf.user.roles
            : []
    const currentRoleRaw = appRoles?.[0]
    const currentRoleName =
        typeof currentRoleRaw === 'string'
            ? currentRoleRaw
            : currentRoleRaw && typeof currentRoleRaw === 'object'
              ? currentRoleRaw.Name || currentRoleRaw.name || ''
              : ''
    const roleLower = String(currentRoleName).trim().toLowerCase()
    const hideExceptionCard = roleLower.includes('l1 manager') || roleLower.includes('l2 manager')

    const now = new Date()
    const currentDateLabel = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
    const hour = now.getHours()
    const greetingText = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Good night'

    const openEmployeeDashboard = async () => {
        try {
            kf.app.openPage(EMPLOYEE_DASHBOARD_PAGE_ID)
        } catch (e) {
            console.error('Failed to open employee dashboard page', e)
        }
    }

    const handleScopeSwitch = async (nextScope) => {
        if (nextScope === 'me') {
            await openEmployeeDashboard()
            return
        }
        setScope('team')
    }

    const refreshAll = () => setRefreshNonce((n) => n + 1)

    useEffect(() => {
        const events = kf?.events || kf?.event
        if (!events || typeof events.on !== 'function') return

        const handle = () => refreshAll()
        try {
            events.on('afterTaskSave', handle)
            events.on('afterFormSubmit', handle)
            events.on?.('afterFormSave', handle)
            events.on?.('afterItemSave', handle)
        } catch (e) {
            console.warn('kf events subscription failed', e)
        }

        return () => {
            if (typeof events.off !== 'function') return
            try {
                events.off('afterTaskSave', handle)
                events.off('afterFormSubmit', handle)
                events.off?.('afterFormSave', handle)
                events.off?.('afterItemSave', handle)
            } catch {
                // ignore
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId])

    useEffect(() => {
        let lastHandledSeq = Number(window.__KF_DASH_POPUP_SEQ__ || 0)
        const shouldHandle = () => {
            const seq = Number(window.__KF_DASH_POPUP_SEQ__ || 0)
            const openedAt = Number(window.__KF_DASH_POPUP_OPENED_AT__ || 0)
            if (!seq || seq === lastHandledSeq) return false
            if (!openedAt || Date.now() - openedAt > 10 * 60 * 1000) {
                lastHandledSeq = seq
                return false
            }
            lastHandledSeq = seq
            return true
        }

        const onFocus = () => {
            if (shouldHandle()) refreshAll()
        }
        const onVisibility = () => {
            if (document.visibilityState === 'visible' && shouldHandle()) refreshAll()
        }

        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onVisibility)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // Summary now comes from PendingApprovalsWidget (My Tasks list),
        // so cards match widget counts exactly.
    }, [accountId, refreshNonce])

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f9fafb] via-[#f9fafb] to-[#f3f6fb] px-3 pb-8 pt-0 sm:p-6 safe-pb">
            <div className="-mx-3 mb-3 sm:-mx-6 sm:mb-6 animate-fade-in-up">
                <div className="border-b border-white/50 bg-gradient-to-b from-[#f9fafb]/95 to-[#f0f7ff]/90 px-3 py-3 shadow-[0_8px_30px_-18px_rgba(30,41,59,0.12)] backdrop-blur-md sm:px-6 sm:py-4">
                    <div className="mx-auto flex max-w-[1800px] flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E88E5] text-sm font-bold text-white shadow-[0_8px_20px_-4px_rgba(30,136,229,0.45)] sm:h-12 sm:w-12 sm:text-sm">
                                    {toInitials(userName)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                        <h1 className="truncate text-[15px] font-semibold leading-tight text-[#2C3E50] sm:text-base">
                                            {greetingText}, {userName || 'there'}!
                                        </h1>
                                        {currentRoleName ? (
                                            <span className="shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#1E88E5] ring-1 ring-[#1E88E5]/20 sm:px-2.5 sm:text-xs">
                                                {currentRoleName}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mt-0.5 truncate text-[11px] text-slate-600 sm:text-xs">
                                        {companyDisplayName}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-500 sm:hidden">
                                        <i className="ri-calendar-line text-[#1E88E5]" aria-hidden />
                                        {currentDateLabel}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2 text-xs text-slate-800 shadow-sm sm:flex">
                                <i className="ri-calendar-line text-[#1E88E5]" aria-hidden />
                                <span className="font-medium">{currentDateLabel}</span>
                            </div>

                            <div
                                className="grid w-full grid-cols-2 rounded-2xl border border-slate-200/90 bg-white/95 p-1 shadow-sm sm:inline-flex sm:w-auto sm:rounded-xl"
                                role="group"
                                aria-label="Dashboard scope"
                            >
                                {[
                                    { id: 'me', label: 'Me' },
                                    { id: 'team', label: 'My Team' },
                                ].map((opt) => {
                                    const active = scope === opt.id
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleScopeSwitch(opt.id)}
                                            className="btn-press rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:min-w-[88px] sm:rounded-lg sm:px-4 sm:py-2"
                                            style={
                                                active
                                                    ? {
                                                          background: '#1E88E5',
                                                          color: '#fff',
                                                          boxShadow: '0 4px 12px -2px rgba(30,136,229,0.45)',
                                                      }
                                                    : {
                                                          background: 'transparent',
                                                          color: '#7F8C8D',
                                                      }
                                            }
                                        >
                                            {opt.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1800px] space-y-4 sm:space-y-6">
                <div className={`grid grid-cols-2 ${hideExceptionCard ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-2.5 sm:gap-4`}>
                    <CompactSummaryCard
                        title="Pending Requests"
                        subtext="Awaiting your action"
                        values={pendingCounts}
                        variant="pending"
                        iconClass="ri-hourglass-line"
                        delayClass="delay-75"
                    />
                    <CompactSummaryCard
                        title="Nearing SLA"
                        subtext="Within 48 hours"
                        values={slaSummary.nearingSla}
                        variant="nearing"
                        iconClass="ri-timer-flash-line"
                        delayClass="delay-100"
                    />
                    <CompactSummaryCard
                        title="SLA Breached"
                        subtext="Needs attention"
                        values={slaSummary.breachedSla}
                        variant="breached"
                        iconClass="ri-alarm-warning-line"
                        delayClass="delay-150"
                    />
                    {!hideExceptionCard && (
                        <CompactSummaryCard
                            title="Exception"
                            subtext="Flagged for review"
                            values={slaSummary.exception}
                            variant="exception"
                            iconClass="ri-error-warning-line"
                            delayClass="delay-200"
                        />
                    )}
                </div>

                <div className="animate-fade-in-up delay-500">
                    <PendingApprovalsWidget
                        key={`pending-${refreshNonce}`}
                        onPopupClosed={refreshAll}
                        onSummaryChange={({ pendingCounts: p, nearingSla, breachedSla, exception }) => {
                            if (p) setPendingCounts(p)
                            setSlaSummary({
                                nearingSla: nearingSla || { expense: 0, advance: 0, travel: 0 },
                                breachedSla: breachedSla || { expense: 0, advance: 0, travel: 0 },
                                exception: exception || { expense: 0, advance: 0, travel: 0 },
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
