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
        gradient: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
        shadow: 'rgba(30,136,229,0.3)',
        data: dashboardCardStats.travel,
    },
    {
        key: 'advances',
        label: 'Travel Advance',
        icon: 'ri-wallet-3-line',
        color: '#0084AD',
        colorLight: 'rgba(0,132,173,0.12)',
        gradient: 'linear-gradient(135deg, #0084AD 0%, #0EA5E9 100%)',
        shadow: 'rgba(0,132,173,0.3)',
        data: dashboardCardStats.advances,
    },
    {
        key: 'expenses',
        label: 'Travel Expense',
        icon: 'ri-receipt-line',
        color: '#F97316',
        colorLight: 'rgba(249,115,22,0.12)',
        gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
        shadow: 'rgba(249,115,22,0.3)',
        data: dashboardCardStats.expenses,
    },
]

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
    const [actionOpen, setActionOpen] = useState(false)
    const [hoveredSat, setHoveredSat] = useState(null)
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
        <div className="min-h-screen overflow-y-auto pm-page-bg">
            <div className="p-1.5 sm:p-4 lg:p-6">
                <div
                    className="rounded-xl sm:rounded-2xl lg:rounded-3xl mb-2.5 sm:mb-6 relative overflow-hidden animate-fade-in-up shadow-[0_12px_30px_rgba(76,98,168,0.12)]"
                    style={{
                        background:
                            'linear-gradient(135deg, #1565C0 0%, #1E88E5 55%, #2B5AED 100%)',
                        padding: '8px 10px',
                    }}
                >
                    <div className="absolute right-0 top-0 w-72 h-full pointer-events-none overflow-hidden">
                        <div
                            className="w-52 h-52 rounded-full absolute -right-16 -top-16 animate-float"
                            style={{ background: 'rgba(125,194,68,0.12)' }}
                        />
                        <div
                            className="w-32 h-32 rounded-full absolute right-28 bottom-2 animate-float delay-300"
                            style={{ background: 'rgba(238,106,49,0.1)' }}
                        />
                        <div
                            className="w-20 h-20 rounded-full absolute right-8 top-6 animate-spin-slow"
                            style={{
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {/*<img
                                src={companyLogoSrc}
                                alt=""
                                className="h-9 w-auto max-h-[52px] sm:h-12 sm:max-h-14 object-contain flex-shrink-0 rounded-md bg-white/5 p-0.5"
                                loading="lazy"
                                decoding="async"
                            />*/}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                                    <span
                                        className="text-[9px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full"
                                        style={{
                                            background:
                                                'rgba(255,255,255,0.12)',
                                            color: 'rgba(255,255,255,0.8)',
                                        }}
                                    >
                                        {currentDateLabel}
                                    </span>
                                    {/* <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(125,194,68,0.25)', color: '#b3f07e' }}>
                                    ● All systems normal
                                </span> */}
                                </div>
                                <h1 className="text-white text-[15px] sm:text-2xl font-bold leading-tight mt-1 sm:mt-2 break-words">
                                    {greetingText}, {userName}! 👋
                                </h1>
                                <p className="text-white/70 text-[9px] sm:text-sm mt-0.5 sm:mt-1.5 max-w-full sm:max-w-md">
                                    {companyDisplayName || 'Refex Group'}
                                    {/* You have{' '} */}
                                    {/* <span className="font-semibold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(238,106,49,0.35)', color: '#ffc9a0' }}>
                                    {totalPending} pending requests
                                </span>
                                {' '}(
                                <span className="font-semibold" style={{ color: '#9DD4FF' }}>Travel Booking {pendingCounts.travel}</span>,{' '}
                                <span className="font-semibold" style={{ color: '#BFF59A' }}>Travel Advance {pendingCounts.advance}</span>,{' '}
                                <span className="font-semibold" style={{ color: '#FFD2B5' }}>Travel Expense {pendingCounts.expense}</span>
                                ). */}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 flex-shrink-0 w-full lg:w-auto">
                            <div className="sm:hidden w-full">
                                <div className="flex flex-wrap items-center justify-center gap-1 mb-1">
                                    <button
                                        onClick={() => openPopup('travel')}
                                        className="flex items-center gap-1 cursor-pointer whitespace-nowrap rounded-md px-1.5 py-1"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, #2879b6, #3a9ad9)',
                                            boxShadow:
                                                '0 6px 18px rgba(40,121,182,0.35)',
                                        }}

                                    >
                                        <div
                                            className="w-3.5 h-3.5 flex items-center justify-center rounded-md flex-shrink-0"
                                            style={{
                                                background:
                                                    'rgba(255,255,255,0.22)',
                                            }}
                                        >
                                            <i
                                                className="ri-flight-takeoff-line text-white"
                                                style={{ fontSize: '11px' }}
                                            />
                                        </div>
                                        <span className="text-white text-[9px] font-semibold tracking-wide">
                                            Travel Booking
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => openPopup('advance')}
                                        className="flex items-center gap-1 cursor-pointer whitespace-nowrap rounded-md px-1.5 py-1"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, #7dc244, #a3d96a)',
                                            boxShadow:
                                                '0 6px 18px rgba(125,194,68,0.35)',
                                        }}
                                    >
                                        <div
                                            className="w-3.5 h-3.5 flex items-center justify-center rounded-md flex-shrink-0"
                                            style={{
                                                background:
                                                    'rgba(255,255,255,0.22)',
                                            }}
                                        >
                                            <i
                                                className="ri-wallet-3-line text-white"
                                                style={{ fontSize: '11px' }}
                                            />
                                        </div>
                                        <span className="text-white text-[9px] font-semibold tracking-wide">
                                            Travel Advance
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => openPopup('expense')}
                                        className="flex items-center gap-1 cursor-pointer whitespace-nowrap rounded-md px-1.5 py-1"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, #ee6a31, #f5924e)',
                                            boxShadow:
                                                '0 6px 18px rgba(238,106,49,0.35)',
                                        }}
                                    >
                                        <div
                                            className="w-3.5 h-3.5 flex items-center justify-center rounded-md flex-shrink-0"
                                            style={{
                                                background:
                                                    'rgba(255,255,255,0.22)',
                                            }}
                                        >
                                            <i
                                                className="ri-receipt-line text-white"
                                                style={{ fontSize: '11px' }}
                                            />
                                        </div>
                                        <span className="text-white text-[9px] font-semibold tracking-wide">
                                            Travel Expense
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div
                                className="relative self-end sm:self-auto scale-[0.9] sm:scale-100 origin-right hidden sm:block"
                                style={{
                                    width: '220px',
                                    height: '118px',
                                    maxWidth: '100%',
                                }}
                                onMouseEnter={() => setActionOpen(true)}
                                onMouseLeave={() => {
                                    setActionOpen(false)
                                    setHoveredSat(null)
                                }}
                            >
                                <button
                                    onClick={() => openPopup('travel')}
                                    onMouseEnter={() => setHoveredSat(0)}
                                    onMouseLeave={() => setHoveredSat(null)}
                                    className="absolute flex items-center gap-2 cursor-pointer whitespace-nowrap rounded-xl satellite-pill"
                                    style={{
                                        height: '32px',
                                        padding: '0 12px 0 7px',
                                        top: '43px',
                                        right: '18px',
                                        background:
                                            'linear-gradient(135deg, #2879b6, #3a9ad9)',
                                        boxShadow:
                                            hoveredSat === 0
                                                ? '0 0 0 4px rgba(40,121,182,0.35), 0 0 28px rgba(40,121,182,1)'
                                                : actionOpen
                                                  ? '0 0 0 3px rgba(40,121,182,0.25), 0 0 20px rgba(40,121,182,0.85)'
                                                  : 'none',
                                        transform: actionOpen
                                            ? `translate(-105px, -40px) scale(${hoveredSat === 0 ? 1.1 : 1})`
                                            : 'translate(0px, 0px) scale(0)',
                                        opacity: actionOpen ? 1 : 0,
                                        transition:
                                            'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                                        transitionDelay: actionOpen
                                            ? '0ms'
                                            : '80ms',
                                        zIndex: hoveredSat === 0 ? 25 : 20,
                                        transformOrigin: 'right center',
                                    }}
                                >
                                    <div
                                        className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0"
                                        style={{
                                            background:
                                                'rgba(255,255,255,0.22)',
                                        }}
                                    >
                                        <i
                                            className="ri-flight-takeoff-line text-white"
                                            style={{ fontSize: '11px' }}
                                        />
                                    </div>
                                    <span className="text-white text-xs font-semibold tracking-wide">
                                        Travel Booking
                                    </span>
                                </button>

                                <button
                                    onClick={() => openPopup('advance')}
                                    onMouseEnter={() => setHoveredSat(1)}
                                    onMouseLeave={() => setHoveredSat(null)}
                                    className="absolute flex items-center gap-2 cursor-pointer whitespace-nowrap rounded-xl satellite-pill"
                                    style={{
                                        height: '32px',
                                        padding: '0 12px 0 7px',
                                        top: '43px',
                                        right: '18px',
                                        background:
                                            'linear-gradient(135deg, #7dc244, #a3d96a)',
                                        boxShadow:
                                            hoveredSat === 1
                                                ? '0 0 0 4px rgba(125,194,68,0.35), 0 0 28px rgba(125,194,68,1)'
                                                : actionOpen
                                                  ? '0 0 0 3px rgba(125,194,68,0.25), 0 0 20px rgba(125,194,68,0.85)'
                                                  : 'none',
                                        transform: actionOpen
                                            ? `translate(-115px, 0px) scale(${hoveredSat === 1 ? 1.1 : 1})`
                                            : 'translate(0px, 0px) scale(0)',
                                        opacity: actionOpen ? 1 : 0,
                                        transition:
                                            'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                                        transitionDelay: actionOpen
                                            ? '65ms'
                                            : '45ms',
                                        zIndex: hoveredSat === 1 ? 25 : 20,
                                        transformOrigin: 'right center',
                                    }}
                                >
                                    <div
                                        className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0"
                                        style={{
                                            background:
                                                'rgba(255,255,255,0.22)',
                                        }}
                                    >
                                        <i
                                            className="ri-wallet-3-line text-white"
                                            style={{ fontSize: '11px' }}
                                        />
                                    </div>
                                    <span className="text-white text-xs font-semibold tracking-wide">
                                        Travel Advance
                                    </span>
                                </button>

                                <button
                                    onClick={() => openPopup('expense')}
                                    onMouseEnter={() => setHoveredSat(2)}
                                    onMouseLeave={() => setHoveredSat(null)}
                                    className="absolute flex items-center gap-2 cursor-pointer whitespace-nowrap rounded-xl satellite-pill"
                                    style={{
                                        height: '32px',
                                        padding: '0 12px 0 7px',
                                        top: '43px',
                                        right: '18px',
                                        background:
                                            'linear-gradient(135deg, #ee6a31, #f5924e)',
                                        boxShadow:
                                            hoveredSat === 2
                                                ? '0 0 0 4px rgba(238,106,49,0.35), 0 0 28px rgba(238,106,49,1)'
                                                : actionOpen
                                                  ? '0 0 0 3px rgba(238,106,49,0.25), 0 0 20px rgba(238,106,49,0.85)'
                                                  : 'none',
                                        transform: actionOpen
                                            ? `translate(-105px, 40px) scale(${hoveredSat === 2 ? 1.1 : 1})`
                                            : 'translate(0px, 0px) scale(0)',
                                        opacity: actionOpen ? 1 : 0,
                                        transition:
                                            'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                                        transitionDelay: actionOpen
                                            ? '130ms'
                                            : '0ms',
                                        zIndex: hoveredSat === 2 ? 25 : 20,
                                        transformOrigin: 'right center',
                                    }}
                                >
                                    <div
                                        className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0"
                                        style={{
                                            background:
                                                'rgba(255,255,255,0.22)',
                                        }}
                                    >
                                        <i
                                            className="ri-receipt-line text-white"
                                            style={{ fontSize: '11px' }}
                                        />
                                    </div>
                                    <span className="text-white text-xs font-semibold tracking-wide">
                                        Travel Expense
                                    </span>
                                </button>

                                {actionOpen && (
                                    <span
                                        className="absolute rounded-full pointer-events-none animate-ping-once"
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            top: '33px',
                                            right: '14px',
                                            border: '1.5px solid rgba(255,255,255,0.4)',
                                        }}
                                    />
                                )}

                                <button
                                    className="absolute rounded-full flex items-center justify-center cursor-pointer"
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        top: '37px',
                                        right: '18px',
                                        background: actionOpen
                                            ? 'rgba(255,255,255,0.30)'
                                            : 'rgba(255,255,255,0.18)',
                                        border: '2px solid rgba(255,255,255,0.38)',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: actionOpen
                                            ? '0 0 0 7px rgba(255,255,255,0.07), 0 6px 22px rgba(0,0,0,0.28)'
                                            : '0 4px 16px rgba(0,0,0,0.22)',
                                        transition:
                                            'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                                        zIndex: 30,
                                    }}
                                >
                                    <i
                                        className="ri-add-line text-white"
                                        style={{
                                            fontSize: '22px',
                                            display: 'block',
                                            transition:
                                                'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                                            transform: actionOpen
                                                ? 'rotate(135deg)'
                                                : 'rotate(0deg)',
                                        }}
                                    />
                                </button>
                            </div>

                            {showScopeToggle && (
                                <div
                                    className="inline-flex rounded-xl p-0.5 sm:p-1 gap-0.5 self-center sm:self-auto scale-95 sm:scale-100"
                                    style={{
                                        background: 'rgba(0,0,0,0.22)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        zIndex: 40,
                                    }}
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
                                                onClick={() =>
                                                    handleEmployeeScopeSwitch(
                                                        opt.id
                                                    )
                                                }
                                                className="px-1.5 sm:px-4 py-1 sm:py-2 rounded-lg text-[9px] sm:text-xs font-semibold transition-all min-w-[58px] sm:min-w-[88px]"
                                                style={
                                                    active
                                                        ? {
                                                              background:
                                                                  'rgba(255,255,255,0.95)',
                                                              color: '#0D1F3C',
                                                              boxShadow:
                                                                  '0 2px 8px rgba(0,0,0,0.12)',
                                                          }
                                                        : {
                                                              background:
                                                                  'transparent',
                                                              color: 'rgba(255,255,255,0.78)',
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

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5 sm:gap-4 lg:gap-5 mb-2.5 sm:mb-6">
                    {mainCards.map((card, idx) =>
                        (() => {
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
                                ? cardValues.travelSubmittedCount +
                                  cardValues.travelClaimedCount
                                : 0
                            const submittedLabel = isTravel
                                ? 'Total'
                                : 'Submitted'
                            const claimedLabel = isTravel ? 'Booked' : 'Claimed'

                            return (
                                <div
                                    key={card.key}
                                    className="rounded-lg sm:rounded-2xl overflow-hidden card-lift card-brand-glow animate-fade-in-up shimmer-overlay"
                                    style={{
                                        background: '#ffffff',
                                        border: `1px solid ${card.color}26`,
                                        boxShadow: `0 10px 24px ${card.shadow.replace('0.3', '0.14')}`,
                                        animationDelay: `${idx * 90}ms`,
                                        '--glow-color': card.shadow.replace(
                                            '0.3',
                                            '0.32'
                                        ),
                                    }}
                                >
                                    <div
                                        className="px-2 sm:px-5 pt-2 sm:pt-4 pb-1.5 sm:pb-3 flex items-center justify-between"
                                        style={{
                                            borderBottom: '1px solid #E6ECF4',
                                            background: card.colorLight,
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <span
                                                className="font-bold text-[10px] sm:text-sm tracking-wide"
                                                style={{ color: '#101828' }}
                                            >
                                                {card.label}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <div
                                                className="w-5.5 h-5.5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center card-icon"
                                                style={{
                                                    background: '#ffffff',
                                                    border: `1px solid ${card.color}3A`,
                                                }}
                                            >
                                                <i
                                                    className={`${card.icon} text-[10px] sm:text-base`}
                                                    style={{
                                                        color: card.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2">
                                        <div
                                            className="px-2 sm:px-5 py-2 sm:py-4"
                                            style={{
                                                borderRight:
                                                    '1px solid #E6ECF4',
                                                background: '#FCFDFE',
                                            }}
                                        >
                                            <div className="flex items-center gap-1 mb-1 sm:mb-2">
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{
                                                        background: card.color,
                                                    }}
                                                />
                                                <span className="text-[#475467] text-[8px] sm:text-xs font-medium uppercase tracking-wider">
                                                    {submittedLabel}
                                                </span>
                                            </div>
                                            {isTravel ? (
                                                <>
                                                    <p className="text-[#101828] text-[13px] sm:text-xl font-bold leading-tight animate-count-up tabular-nums">
                                                        <AnimatedInt
                                                            value={
                                                                travelBookingTotalCount
                                                            }
                                                        />
                                                    </p>
                                                    <p
                                                        className="text-[#667085] text-[8px] sm:text-xs mt-0.5 invisible"
                                                        aria-hidden
                                                    >
                                                        INR
                                                    </p>
                                                    <div className="mt-1 sm:mt-2 flex items-center gap-1">
                                                        <div
                                                            className="w-3 h-3 sm:w-5 sm:h-5 flex items-center justify-center rounded"
                                                            style={{
                                                                background:
                                                                    card.colorLight,
                                                            }}
                                                        >
                                                            <i
                                                                className="ri-file-list-3-line text-[8px] sm:text-xs"
                                                                style={{
                                                                    color: card.color,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[#344054] text-[8px] sm:text-xs font-semibold">
                                                            {travelBookingTotalCount ===
                                                            1
                                                                ? 'Request'
                                                                : 'Requests'}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-[#101828] text-[13px] sm:text-xl font-bold leading-tight animate-count-up">
                                                        <AnimatedINR
                                                            value={
                                                                submittedAmount
                                                            }
                                                        />
                                                    </p>
                                                    <p className="text-[#667085] text-[8px] sm:text-xs mt-0.5">
                                                        INR
                                                    </p>
                                                    <div className="mt-1 sm:mt-2 flex items-center gap-1">
                                                        <div
                                                            className="w-3 h-3 sm:w-5 sm:h-5 flex items-center justify-center rounded"
                                                            style={{
                                                                background:
                                                                    card.colorLight,
                                                            }}
                                                        >
                                                            <i
                                                                className="ri-file-list-3-line text-[8px] sm:text-xs"
                                                                style={{
                                                                    color: card.color,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[#344054] text-[8px] sm:text-xs font-semibold">
                                                            <AnimatedInt
                                                                value={
                                                                    submittedCount
                                                                }
                                                            />{' '}
                                                            Requests
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div
                                            className="px-2 sm:px-5 py-2 sm:py-4"
                                            style={{ background: '#FFFFFF' }}
                                        >
                                            <div className="flex items-center gap-1 mb-1 sm:mb-2">
                                                <div
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{
                                                        background: card.color,
                                                    }}
                                                />
                                                <span className="text-[#475467] text-[8px] sm:text-xs font-medium uppercase tracking-wider">
                                                    {claimedLabel}
                                                </span>
                                            </div>
                                            <p className="text-[#101828] text-[13px] sm:text-xl font-bold leading-tight animate-count-up">
                                                <AnimatedINR
                                                    value={claimedAmount}
                                                />
                                            </p>
                                            <p className="text-[#667085] text-[8px] sm:text-xs mt-0.5">
                                                INR
                                            </p>
                                            <div className="mt-1 sm:mt-2 flex items-center gap-1">
                                                <div
                                                    className="w-3 h-3 sm:w-5 sm:h-5 flex items-center justify-center rounded"
                                                    style={{
                                                        background:
                                                            card.colorLight,
                                                    }}
                                                >
                                                    <i
                                                        className="ri-checkbox-circle-line text-[8px] sm:text-xs"
                                                        style={{
                                                            color: card.color,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[#344054] text-[8px] sm:text-xs font-semibold">
                                                    <AnimatedInt
                                                        value={claimedCount}
                                                    />{' '}
                                                    {isTravel
                                                        ? claimedCount === 1
                                                            ? 'Request'
                                                            : 'Requests'
                                                        : 'Requests'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 sm:gap-4 mb-4">
                    <div className="col-span-1 xl:col-span-3 animate-fade-in-up delay-300">
                        <ExpenseTrendsChart key={`trends-${refreshNonce}`} />
                    </div>
                    <div className="col-span-1 xl:col-span-2 animate-fade-in-up delay-400">
                        <UpcomingTrips
                            key={`trips-${refreshNonce}`}
                            onPopupClosed={refreshAll}
                        />
                    </div>
                </div>

                <div className="animate-fade-in-up delay-500">
                    <PendingApprovalsWidget
                        key={`pending-${refreshNonce}`}
                        onPopupClosed={refreshAll}
                    />
                </div>
            </div>
        </div>
    )
}
