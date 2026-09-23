import { useState, useEffect, useRef } from 'react'
import { kf } from './../sdk/index.js'
import PendingApprovalsWidget from './components/PendingApprovalsWidget.jsx'
import {
    flightIcon,
    customTravelBookingIcon,
    customTravelAdvanceIcon,
    customTravelExpenseIcon,
    customPendingRequestsIcon,
    customNearingSlaIcon,
    customSlaBreachedIcon,
    customExceptionIcon,
} from '../../../raghul_icons/index.js'

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

const KPI_BRAND = {
    blue: '#1E88E5',
    orange: '#FB8C00',
    amberText: '#FB8C00',
    red: '#E53935',
    purple: '#7c3aed',
}

const COMPACT_CARD = {
    pending: {
        bg: '#f0f7ff',
        border: 'rgba(40, 121, 182, 0.2)',
        icon: customPendingRequestsIcon,
        valueColor: KPI_BRAND.blue,
    },
    nearing: {
        bg: '#fffbeb',
        border: 'rgba(217, 119, 6, 0.22)',
        icon: customNearingSlaIcon,
        valueColor: KPI_BRAND.amberText,
    },
    breached: {
        bg: '#fef2f2',
        border: 'rgba(220, 38, 38, 0.2)',
        icon: customSlaBreachedIcon,
        valueColor: KPI_BRAND.red,
    },
    exception: {
        bg: '#faf5ff',
        border: 'rgba(124, 58, 237, 0.18)',
        icon: customExceptionIcon,
        valueColor: KPI_BRAND.purple,
    },
}

function CompactSummaryCard({ title, values, variant, delayClass = '' }) {
    const s = COMPACT_CARD[variant]
    const expense = values?.expense ?? 0
    const advance = values?.advance ?? 0
    const travel = values?.travel ?? 0
    const total = expense + advance + travel
    const breakdown = [
        { label: 'Booking', value: travel, icon: customTravelBookingIcon },
        { label: 'Advance', value: advance, icon: customTravelAdvanceIcon },
        { label: 'Expense', value: expense, icon: customTravelExpenseIcon },
    ]
    return (
        <div
            className={`summary-kpi-card min-w-0 animate-fade-in-up ${delayClass}`}
            style={{
                '--summary-accent': s.valueColor,
                '--summary-border': s.border,
                background: `radial-gradient(ellipse 90% 85% at 0% 0%, ${s.bg} 0%, transparent 58%), radial-gradient(ellipse 65% 60% at 100% 100%, ${s.bg} 0%, transparent 54%), #fff`,
            }}
        >
            <div className="summary-kpi-head">
                <div className="summary-status-icon" aria-hidden="true">
                    <span className="summary-icon-glow" />
                    <span className="summary-icon-shine" />
                    <img src={s.icon} alt="" />
                </div>
                <div className="summary-kpi-title">
                    <p title={title}>{title}</p>
                    <span>Requires your attention</span>
                </div>
                <div className="summary-total">
                    <AnimatedInt value={total} />
                    <span>Total</span>
                </div>
            </div>

            <div className="summary-breakdown">
                {breakdown.map((item) => (
                    <div className="summary-breakdown-item" key={item.label}>
                        <img src={item.icon} alt="" aria-hidden="true" />
                        <div>
                            <span>{item.label}</span>
                            <AnimatedInt value={item.value} />
                        </div>
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
        <div className="min-h-screen bg-gray-50 overflow-y-auto">
            <div className="p-2.5 sm:p-4 lg:p-6">
                <div
                    className="travel-hero rounded-xl sm:rounded-2xl mb-2.5 sm:mb-6 relative overflow-hidden animate-fade-in-up border border-white/80"
                    style={{ background: 'radial-gradient(circle at 72% 10%, rgba(255,255,255,0.18), transparent 28%), linear-gradient(105deg, #2f87c8 0%, #51a6d8 58%, #7dbfe4 100%)', padding: '12px 16px' }}
                >
                    <div className="travel-hero-art" aria-hidden="true">
                        <span className="travel-cloud travel-cloud-one" />
                        <span className="travel-cloud travel-cloud-two" />
                        <span className="travel-cloud travel-cloud-three" />
                        <svg className="travel-flight-path" viewBox="0 0 250 60">
                            <path d="M4 43 C48 4, 82 52, 121 22 S190 12, 222 32" />
                        </svg>
                        <img className="travel-hero-plane" src={flightIcon} alt="" />
                        <span className="travel-hero-quote">“New places.<br />Greater possibilities.”</span>
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                                <span className="text-[9px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                                    {currentDateLabel}
                                </span>
                            </div>
                            <h1 className="text-white text-[15px] sm:text-2xl font-bold leading-tight mt-1 sm:mt-2">{greetingText}, {userName}! 👋</h1>
                            <p className="text-white/70 text-[9px] sm:text-sm mt-0.5 sm:mt-1.5 max-w-full sm:max-w-md">
                             {companyDisplayName}
                            </p>
                        </div>

                        <div
                            className="travel-hero-scope flex-shrink-0 inline-flex rounded-xl p-0.5 sm:p-1 gap-0.5 self-center sm:self-auto scale-95 sm:scale-100"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.12)' }}
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
                                        className="px-1.5 sm:px-4 py-1 sm:py-2 rounded-lg text-[9px] sm:text-xs font-semibold transition-all min-w-[58px] sm:min-w-[88px]"
                                        style={
                                            active
                                                ? {
                                                      background: 'rgba(255,255,255,0.95)',
                                                      color: '#0D1F3C',
                                                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                                  }
                                                : {
                                                      background: 'transparent',
                                                      color: 'rgba(255,255,255,0.75)',
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

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${hideExceptionCard ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-2 sm:gap-3 mb-4 sm:mb-6`}>
                    <CompactSummaryCard
                        title="Pending Requests"
                        values={pendingCounts}
                        variant="pending"
                        delayClass="delay-75"
                    />
                    <CompactSummaryCard
                        title="Nearing SLA"
                        values={slaSummary.nearingSla}
                        variant="nearing"
                        delayClass="delay-100"
                    />
                    <CompactSummaryCard
                        title="SLA Breached"
                        values={slaSummary.breachedSla}
                        variant="breached"
                        delayClass="delay-150"
                    />
                    {!hideExceptionCard && (
                        <CompactSummaryCard
                            title="Exception"
                            values={slaSummary.exception}
                            variant="exception"
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
