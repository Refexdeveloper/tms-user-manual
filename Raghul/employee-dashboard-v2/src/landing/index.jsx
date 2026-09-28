import { useState, useMemo, useEffect } from 'react'
import { kf } from './../sdk/index.js'
import { dashboardCardStats } from '../mocks/advances.js'
import ExpenseTrendsChart from './components/ExpenseTrendsChart.jsx'
import UpcomingTrips from './components/UpcomingTrips.jsx'
import PendingApprovalsWidget from './components/PendingApprovalsWidget.jsx'

const APP_ID = 'Expense_and_Travel_Management_A00'
const L1_MANAGER_DASHBOARD_PAGE_ID = 'Approver_Dashboard_V2_A00'
const PAGE_SIZE = 2000
const MAX_PAGES = 15

const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

const EXPENSE_REPORT = {
    processId: 'Expense_Management_A03',
    reportId: 'All_Items_MK_A00',
    dateColId: 'Column_msE_PUucAP',
    amountColId: 'Column_Nvns1CPpfI',
}

// Travel Expense (All_Items_MK_A00) – provided ids
const EXPENSE_COL_IDS = {
    currentStep: 'Column_bzLJNkKQZO',
    status: 'Column_nEtxbnvlrc',
    type: 'Column_XcXTxxA4-C',
}

const ADVANCE_REPORT = {
    processId: 'Advance_Payment_Request_Process_A01',
    reportId: 'ALL_ITEMS_WITH_TABLE_A00',
    dateColId: 'Column_RmtnLwNoFB',
    amountColId: 'Column_rMCWa-_7NO',
}

// Popups
const POPUPS = {
    expense: 'Popup_E4xarw8lLE',
    advance: 'Popup_J0C5lIdWCL',
    travel: 'Popup_rCILSrY8KF',
}

const PENDING_COUNT_TABS = [
    {
        key: 'travel',
        processId: 'Travel_Management_A02',
        reportId: 'All_Items_A00',
    },
    {
        key: 'advance',
        processId: 'Advance_Payment_Request_Process_A01',
        reportId: 'ALL_ITEMS_WITH_TABLE_A00',
    },
    {
        key: 'expense',
        processId: 'Expense_Management_A03',
        reportId: 'All_Items_MK_A00',
    },
]

const mainCards = [
    {
        key: 'travel',
        label: 'Travel Booking',
        icon: 'ri-flight-takeoff-line',
        color: '#1E88E5',
        colorLight: 'rgba(30,136,229,0.12)',
        accent: 'text-[#1E88E5]',
        bar: 'from-sky-50 via-white to-indigo-50',
        ring: 'ring-sky-500/15',
        chip: 'border-sky-200 bg-sky-50',
        gradient: 'linear-gradient(135deg, #1E88E5 0%, #42A5F5 100%)',
        shadow: 'rgba(30,136,229,0.3)',
        data: dashboardCardStats.travel,
    },
    {
        key: 'advances',
        label: 'Travel Advance',
        icon: 'ri-wallet-3-line',
        color: '#43A047',
        colorLight: 'rgba(67,160,71,0.12)',
        accent: 'text-[#43A047]',
        bar: 'from-emerald-50 via-white to-teal-50',
        ring: 'ring-emerald-500/15',
        chip: 'border-emerald-200 bg-emerald-50',
        gradient: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)',
        shadow: 'rgba(67,160,71,0.3)',
        data: dashboardCardStats.advances,
    },
    {
        key: 'expenses',
        label: 'Travel Expense',
        icon: 'ri-receipt-line',
        color: '#FB8C00',
        colorLight: 'rgba(251,140,0,0.12)',
        accent: 'text-[#FB8C00]',
        bar: 'from-orange-50 via-white to-amber-50',
        ring: 'ring-orange-500/15',
        chip: 'border-orange-200 bg-orange-50',
        gradient: 'linear-gradient(135deg, #FB8C00 0%, #FFA726 100%)',
        shadow: 'rgba(251,140,0,0.3)',
        data: dashboardCardStats.expenses,
    },
]

function toInitials(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    if (!parts.length) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
}

function formatINR(amount) {
    return '₹\u00A0' + amount.toLocaleString('en-IN')
}

const COUNT_UP_MS = 1000

function useCountUp(endValue, duration = COUNT_UP_MS) {
    const [display, setDisplay] = useState(0)
    useEffect(() => {
        const to = Number.isFinite(Number(endValue))
            ? Math.round(Number(endValue))
            : 0
        const from = 0
        const t0 = performance.now()
        let raf = 0
        const easeOutCubic = (t) => 1 - (1 - t) ** 3
        const step = (now) => {
            const t = Math.min(1, (now - t0) / duration)
            setDisplay(Math.round(from + (to - from) * easeOutCubic(t)))
            if (t < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [endValue, duration])
    return display
}

function AnimatedINR({ value }) {
    const n = useCountUp(value)
    return formatINR(n)
}

function AnimatedInt({ value }) {
    const n = useCountUp(value)
    return n.toLocaleString('en-IN')
}

export function DefaultLandingComponent() {
    const [scope, setScope] = useState('me')
    const [refreshNonce, setRefreshNonce] = useState(0)
    const [cardValues, setCardValues] = useState({
        expenseSubmittedAmount: 0,
        expenseSubmittedCount: 0,
        expenseClaimedAmount: 0,
        expenseClaimedCount: 0,
        advanceSubmittedAmount: 0,
        advanceSubmittedCount: 0,
        advanceClaimedAmount: 0,
        advanceClaimedCount: 0,
        travelSubmittedAmount: 0,
        travelSubmittedCount: 0,
        travelClaimedAmount: 0,
        travelClaimedCount: 0,
    })
    const [pendingCounts, setPendingCounts] = useState({
        expense: 0,
        advance: 0,
        travel: 0,
    })
    /** Full user profile includes accurate `Company`; `kf.user.Company` may be empty — overwritten after `/user/2/...` fetch. */
    const [resolvedCompany, setResolvedCompany] = useState(() =>
        String(kf?.user?.Company || '').trim()
    )

    const userName = (kf && kf.user && kf.user.Name) || ''
    const userEmail = String(kf?.user?.Email || '')
        .trim()
        .toLowerCase()
    const accountId = kf?.account?._id
    const userId = String(kf?.user?._id || '').trim()

    const companyDisplayName = resolvedCompany.trim() || 'Refex Group'
    const userCompanyLower = companyDisplayName.toLowerCase()

    /** Venwind vs Refex branding — logos live in `public/` (Vite serves as `/filename.png`). */
    const companyLogoSrc = useMemo(() => {
        const c = userCompanyLower
        if (c === 'venwind refex power limited' || c.includes('venwind')) {
            return 'https://venwindrefex.com/Venwind_Logo_Final.png'
        }
        return 'https://refex.group/uploads/images/general/general/general-general-refexlogo-1770112732644-292185.png'
    }, [userCompanyLower])

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
                console.warn(
                    '[employee-dashboard] User profile fetch failed',
                    e
                )
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
    const currentRoleRaw = appRoles[0]
    const currentRoleName =
        typeof currentRoleRaw === 'string'
            ? currentRoleRaw
            : currentRoleRaw && typeof currentRoleRaw === 'object'
              ? currentRoleRaw.Name || currentRoleRaw.name || ''
              : ''
    // Show toggle only when current role is not Employee.
    const showScopeToggle =
        String(currentRoleName).trim().toLowerCase() !== 'employee'

    const now = new Date()
    const currentDateLabel = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
    const hour = now.getHours()
    const greetingText =
        hour < 12
            ? 'Good morning'
            : hour < 17
              ? 'Good afternoon'
              : hour < 21
                ? 'Good evening'
                : 'Good night'
    const totalPending =
        pendingCounts.expense + pendingCounts.advance + pendingCounts.travel

    const toNumber = (value) => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0
        if (typeof value === 'string') {
            const parsed = Number(
                String(value)
                    .replace(/,/g, '')
                    .replace(/[^\d.-]/g, '')
            )
            return Number.isFinite(parsed) ? parsed : 0
        }
        if (value && typeof value === 'object') {
            const inner =
                value.value ?? value.Value ?? value.amount ?? value.Amount
            return toNumber(inner)
        }
        return 0
    }

    const isMyRow = (row, emailColId) => {
        const rowEmail = String(row?.[emailColId] || '')
            .trim()
            .toLowerCase()
        if (!userEmail) return true
        return rowEmail === userEmail
    }

    useEffect(() => {
        const fetchCardsFromAllItems = async () => {
            try {
                if (!accountId || !kf?.api) return

                const fetchAllRows = async (processId, reportId) => {
                    const allRows = []
                    for (let page = 1; page <= MAX_PAGES; page++) {
                        const url = `/process-report/2/${accountId}/${processId}/${reportId}?_application_id=${APP_ID}&page_number=${page}&page_size=${PAGE_SIZE}`
                        const resp = await kf.api(url)
                        const rows = Array.isArray(resp?.Data) ? resp.Data : []
                        if (!rows.length) break
                        allRows.push(...rows)
                        if (rows.length < PAGE_SIZE) break
                    }
                    return allRows
                }

                const expenseRows = await fetchAllRows(
                    EXPENSE_REPORT.processId,
                    EXPENSE_REPORT.reportId
                )
                const advanceRows = await fetchAllRows(
                    ADVANCE_REPORT.processId,
                    ADVANCE_REPORT.reportId
                )
                const travelRows = await fetchAllRows(
                    'Travel_Management_A02',
                    'All_Items_A00'
                )

                let expenseSubmittedAmount = 0
                let expenseSubmittedCount = 0
                let expenseClaimedAmount = 0
                let expenseClaimedCount = 0
                for (const row of expenseRows) {
                    if (!isMyRow(row, 'Column_OpIELajxeZ')) continue
                    const amount = toNumber(
                        row?.['Column_Nvns1CPpfI'] ??
                            row?.['Column_UyJCJpXn5Y'] ??
                            row?.Total_Claimable_Amount ??
                            row?.['Column_ncznaD0xeN'] ??
                            row?.['Column_U1MuKst0Wc'] ??
                            0
                    )
                    const statusRaw = String(
                        row?.[EXPENSE_COL_IDS.status] || ''
                    )
                        .trim()
                        .toLowerCase()
                    // Employee dashboard rule: Completed => Claimed (only).
                    const isClaimed =
                        statusRaw === 'completed' ||
                        statusRaw.includes('completed')
                    if (isClaimed) {
                        expenseClaimedCount += 1
                        expenseClaimedAmount += amount
                    } else {
                        expenseSubmittedCount += 1
                        expenseSubmittedAmount += amount
                    }
                }

                let advanceSubmittedAmount = 0
                let advanceSubmittedCount = 0
                let advanceClaimedAmount = 0
                let advanceClaimedCount = 0
                for (const row of advanceRows) {
                    if (!isMyRow(row, 'Column_V1IbWdYHUL')) continue
                    const amount = toNumber(
                        row?.['Column_rMCWa-_7NO'] ?? row?.['Column_t1eY-VJcss']
                    )
                    const statusRaw = String(
                        row?.['Column_p9wbFBO6NA'] ||
                            row?.['Column_PdcYkpz3ei'] ||
                            ''
                    ).toLowerCase()
                    const isClaimed =
                        statusRaw.includes('approve') ||
                        statusRaw.includes('complete') ||
                        statusRaw.includes('paid')
                    if (isClaimed) {
                        advanceClaimedCount += 1
                        advanceClaimedAmount += amount
                    } else {
                        advanceSubmittedCount += 1
                        advanceSubmittedAmount += amount
                    }
                }

                let travelSubmittedAmount = 0
                let travelSubmittedCount = 0
                let travelClaimedAmount = 0
                let travelClaimedCount = 0
                for (const row of travelRows) {
                    if (!isMyRow(row, 'Column_lc0S2wfw8l')) continue
                    const statusRaw = String(
                        row?.['Column_iujlmrkz00'] ||
                            row?.['Column_hx4B-_JQjZ'] ||
                            ''
                    ).toLowerCase()
                    const isBooked =
                        statusRaw.includes('booked') ||
                        statusRaw.includes('complete') ||
                        statusRaw.includes('confirm')
                    if (isBooked) {
                        travelClaimedCount += 1
                        travelClaimedAmount += toNumber(
                            row?.['Column_PQUfwzpDbz']
                        )
                    } else {
                        travelSubmittedCount += 1
                        const submittedAmt = toNumber(
                            row?.['Column_TamP5ek9Lg'] ??
                                row?.['Column_nvRlT5FvRy'] ??
                                row?.['Column_c-kvPWMFjW']
                        )
                        travelSubmittedAmount += submittedAmt
                    }
                }

                setCardValues({
                    expenseSubmittedAmount,
                    expenseSubmittedCount,
                    expenseClaimedAmount,
                    expenseClaimedCount,
                    advanceSubmittedAmount,
                    advanceSubmittedCount,
                    advanceClaimedAmount,
                    advanceClaimedCount,
                    travelSubmittedAmount,
                    travelSubmittedCount,
                    travelClaimedAmount,
                    travelClaimedCount,
                })
            } catch (error) {
                console.error(
                    'Failed to fetch employee dashboard cards from All Items reports',
                    error
                )
            }
        }

        fetchCardsFromAllItems()
    }, [accountId, userEmail, refreshNonce])

    useEffect(() => {
        const fetchPendingCounts = async () => {
            if (!accountId || !kf?.api) return
            try {
                const next = {}
                for (const t of PENDING_COUNT_TABS) {
                    let count = 0
                    for (let page = 1; page <= MAX_PAGES; page++) {
                        const url = `/process-report/2/${accountId}/${t.processId}/${t.reportId}?_application_id=${APP_ID}&page_number=${page}&page_size=${PAGE_SIZE}`
                        const resp = await kf.api(url)
                        const rows = Array.isArray(resp?.Data) ? resp.Data : []
                        if (!rows.length) break
                        for (const row of rows) {
                            const include =
                                t.key === 'expense'
                                    ? isMyRow(row, 'Column_OpIELajxeZ')
                                    : t.key === 'advance'
                                      ? isMyRow(row, 'Column_V1IbWdYHUL')
                                      : isMyRow(row, 'Column_lc0S2wfw8l')
                            if (!include) continue
                            const statusRaw =
                                t.key === 'expense'
                                    ? String(
                                          row?.[EXPENSE_COL_IDS.status] || ''
                                      )
                                          .trim()
                                          .toLowerCase()
                                    : t.key === 'advance'
                                      ? String(
                                            row?.['Column_p9wbFBO6NA'] ||
                                                row?.['Column_PdcYkpz3ei'] ||
                                                ''
                                        ).toLowerCase()
                                      : String(
                                            row?.['Column_iujlmrkz00'] ||
                                                row?.['Column_hx4B-_JQjZ'] ||
                                                ''
                                        ).toLowerCase()
                            if (
                                statusRaw &&
                                (statusRaw.includes('reject') ||
                                    statusRaw.includes('cancel') ||
                                    statusRaw.includes('complete') ||
                                    statusRaw.includes('approve') ||
                                    statusRaw.includes('booked') ||
                                    statusRaw.includes('paid'))
                            )
                                continue
                            count += 1
                        }
                        if (rows.length < PAGE_SIZE) break
                    }
                    next[t.key] = count
                }
                setPendingCounts(next)
            } catch (error) {
                console.error('Failed to fetch pending counts', error)
            }
        }

        fetchPendingCounts()
    }, [accountId, userEmail, refreshNonce])

    const refreshAll = () => setRefreshNonce((n) => n + 1)

    const markPopupOpened = () => {
        try {
            window.__KF_DASH_POPUP_SEQ__ =
                Number(window.__KF_DASH_POPUP_SEQ__ || 0) + 1
            window.__KF_DASH_POPUP_OPENED_AT__ = Date.now()
        } catch {
            // ignore
        }
    }

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
            // treat "returning from popup" only if popup was opened recently
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
            if (document.visibilityState === 'visible' && shouldHandle())
                refreshAll()
        }

        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onVisibility)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const openPopup = (type) => {
        const popupId = POPUPS[type]
        if (!popupId) return
        try {
            markPopupOpened()
            kf.app.page.openPopup(popupId)
        } catch (e) {
            console.error('openPopup failed', e)
            return
        }
    }

    const openManagerDashboard = async () => {
        try {
            kf.app.openPage(L1_MANAGER_DASHBOARD_PAGE_ID)
        } catch (e) {
            console.error('Failed to open manager dashboard page', e)
        }
    }

    const handleEmployeeScopeSwitch = async (nextScope) => {
        setScope(nextScope)
        if (nextScope === 'team') {
            await openManagerDashboard()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f9fafb] via-[#f9fafb] to-[#f3f6fb] p-2 pb-6 sm:p-6">
            <div className="-mx-2 -mt-2 mb-3 sm:-mx-6 sm:-mt-6 sm:mb-6 animate-fade-in-up">
                <div className="border-b border-white/50 bg-gradient-to-b from-[#f9fafb]/92 to-[#f0f7ff]/88 px-2 py-2.5 shadow-[0_8px_30px_-18px_rgba(30,41,59,0.12)] backdrop-blur-md sm:px-6 sm:py-4">
                    <div className="mx-auto flex max-w-[1800px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E88E5] text-xs font-bold text-white shadow-[0_8px_20px_-4px_rgba(30,136,229,0.45)] sm:h-12 sm:w-12 sm:rounded-2xl sm:text-sm">
                                {toInitials(userName)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="truncate text-xs font-semibold text-[#2C3E50] sm:text-base">
                                        {greetingText}, {userName || 'there'}!
                                    </h1>
                                    {currentRoleName ? (
                                        <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-[#1E88E5] ring-1 ring-[#1E88E5]/20 sm:px-2.5 sm:text-xs">
                                            {currentRoleName}
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-0.5 truncate text-[10px] text-slate-600 sm:text-xs">
                                    {companyDisplayName || 'Refex Group'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2 text-xs text-slate-800 shadow-sm lg:flex">
                                <i className="ri-calendar-line text-[#1E88E5]" aria-hidden />
                                <span className="font-medium">{currentDateLabel}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                {[
                                    { key: 'travel', label: 'Travel Booking', short: 'Booking', icon: 'ri-flight-takeoff-line', from: '#1E88E5', to: '#42A5F5', shadow: 'rgba(30,136,229,0.35)' },
                                    { key: 'advance', label: 'Travel Advance', short: 'Advance', icon: 'ri-wallet-3-line', from: '#43A047', to: '#66BB6A', shadow: 'rgba(67,160,71,0.35)' },
                                    { key: 'expense', label: 'Travel Expense', short: 'Expense', icon: 'ri-receipt-line', from: '#FB8C00', to: '#FFA726', shadow: 'rgba(251,140,0,0.35)' },
                                ].map((a) => (
                                    <button
                                        key={a.key}
                                        type="button"
                                        onClick={() => openPopup(a.key)}
                                        className="btn-press inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[9px] font-semibold text-white shadow-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
                                        style={{
                                            background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                                            boxShadow: `0 6px 16px -6px ${a.shadow}`,
                                        }}
                                    >
                                        <i className={`${a.icon} text-[11px] sm:text-sm`} aria-hidden />
                                        <span className="hidden sm:inline">{a.label}</span>
                                        <span className="sm:hidden">{a.short}</span>
                                    </button>
                                ))}
                            </div>

                            {showScopeToggle && (
                                <div
                                    className="inline-flex rounded-xl border border-slate-200/90 bg-white/90 p-0.5 sm:p-1 gap-0.5 shadow-sm"
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
                                                onClick={() => handleEmployeeScopeSwitch(opt.id)}
                                                className="btn-press min-w-[58px] rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all sm:min-w-[88px] sm:px-4 sm:py-2 sm:text-xs"
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
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1800px] space-y-3 lg:space-y-6">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                    {mainCards.map((card, idx) => {
                        const isTravel = card.key === 'travel'
                        const submittedAmount =
                            card.key === 'expenses'
                                ? cardValues.expenseSubmittedAmount
                                : card.key === 'advances'
                                  ? cardValues.advanceSubmittedAmount
                                  : cardValues.travelSubmittedAmount
                        const submittedCount =
                            card.key === 'expenses'
                                ? cardValues.expenseSubmittedCount
                                : card.key === 'advances'
                                  ? cardValues.advanceSubmittedCount
                                  : cardValues.travelSubmittedCount
                        const claimedAmount =
                            card.key === 'expenses'
                                ? cardValues.expenseClaimedAmount
                                : card.key === 'advances'
                                  ? cardValues.advanceClaimedAmount
                                  : cardValues.travelClaimedAmount
                        const claimedCount =
                            card.key === 'expenses'
                                ? cardValues.expenseClaimedCount
                                : card.key === 'advances'
                                  ? cardValues.advanceClaimedCount
                                  : cardValues.travelClaimedCount
                        const travelBookingTotalCount = isTravel
                            ? cardValues.travelSubmittedCount + cardValues.travelClaimedCount
                            : 0
                        const submittedLabel = isTravel ? 'Total' : 'Submitted'
                        const claimedLabel = isTravel ? 'Booked' : 'Claimed'

                        return (
                            <div
                                key={card.key}
                                className={`kpi-card group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br ${card.bar} p-3 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.12)] ring-1 ${card.ring} transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-16px_rgba(15,23,42,0.16)] sm:rounded-2xl sm:p-4 lg:rounded-3xl lg:p-5 animate-fade-in-up`}
                                style={{ animationDelay: `${idx * 90}ms` }}
                            >
                                <div className="mb-2.5 flex items-start justify-between gap-2 sm:mb-3">
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-800 sm:text-sm">{card.label}</p>
                                        <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Your YTD summary</p>
                                    </div>
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-sm shadow-sm ring-1 ring-slate-200/60 sm:h-10 sm:w-10 sm:rounded-xl sm:text-base"
                                        style={{ color: card.color }}
                                    >
                                        <i className={card.icon} aria-hidden />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div className={`min-w-0 rounded-xl border p-2.5 shadow-sm sm:p-3 ${card.chip}`}>
                                        <div className="mb-1.5 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: card.color }} />
                                            <span className="text-[8px] font-semibold uppercase tracking-wider text-[#2C3E50] sm:text-[10px]">
                                                {submittedLabel}
                                            </span>
                                        </div>
                                        {isTravel ? (
                                            <>
                                                <p className={`text-lg font-bold tabular-nums leading-tight sm:text-2xl ${card.accent}`}>
                                                    <AnimatedInt value={travelBookingTotalCount} />
                                                </p>
                                                <p className="mt-1 text-[10px] font-semibold text-slate-600 sm:text-xs">
                                                    {travelBookingTotalCount === 1 ? 'Request' : 'Requests'}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className={`text-base font-bold leading-tight sm:text-xl ${card.accent}`}>
                                                    <AnimatedINR value={submittedAmount} />
                                                </p>
                                                <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px]">INR</p>
                                                <p className="mt-1 text-[10px] font-semibold text-slate-600 sm:text-xs">
                                                    <AnimatedInt value={submittedCount} /> Requests
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className={`min-w-0 rounded-xl border p-2.5 shadow-sm sm:p-3 ${card.chip}`}>
                                        <div className="mb-1.5 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: card.color }} />
                                            <span className="text-[8px] font-semibold uppercase tracking-wider text-[#2C3E50] sm:text-[10px]">
                                                {claimedLabel}
                                            </span>
                                        </div>
                                        <p className={`text-base font-bold leading-tight sm:text-xl ${card.accent}`}>
                                            <AnimatedINR value={claimedAmount} />
                                        </p>
                                        <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px]">INR</p>
                                        <p className="mt-1 text-[10px] font-semibold text-slate-600 sm:text-xs">
                                            <AnimatedInt value={claimedCount} />{' '}
                                            {isTravel
                                                ? claimedCount === 1
                                                    ? 'Request'
                                                    : 'Requests'
                                                : 'Requests'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-5">
                    <div className="col-span-1 animate-fade-in-up delay-300 xl:col-span-3">
                        <ExpenseTrendsChart key={`trends-${refreshNonce}`} />
                    </div>
                    <div className="col-span-1 animate-fade-in-up delay-400 xl:col-span-2">
                        <UpcomingTrips key={`trips-${refreshNonce}`} onPopupClosed={refreshAll} />
                    </div>
                </div>

                <div className="animate-fade-in-up delay-500">
                    <PendingApprovalsWidget key={`pending-${refreshNonce}`} onPopupClosed={refreshAll} />
                </div>
            </div>
        </div>
    )
}
