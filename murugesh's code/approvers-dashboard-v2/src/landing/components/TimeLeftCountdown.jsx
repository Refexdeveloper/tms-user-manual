import { useEffect, useState } from 'react'

/** Omit zero units (e.g. 0 min 23 sec → 23 sec; 2d 0h 3m 0s → 2 days 3 min). */
function formatCountdown(ms) {
    if (!Number.isFinite(ms) || ms < 0) return ''
    let sec = Math.floor(ms / 1000)
    const days = Math.floor(sec / 86400)
    sec %= 86400
    const hrs = Math.floor(sec / 3600)
    sec %= 3600
    const min = Math.floor(sec / 60)
    const s = sec % 60

    const parts = []
    if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
    if (hrs > 0) parts.push(`${hrs} hr${hrs === 1 ? '' : 's'}`)
    if (min > 0) parts.push(`${min} min`)
    if (s > 0 || parts.length === 0) parts.push(`${s} sec`)

    return parts.join(' ')
}

/** Safe (green) | last 20% of [start→deadline] window (amber) | past deadline (red). */
function computeVariant(now, deadlineAtMs, windowStartAtMs) {
    const remaining = deadlineAtMs - now
    if (remaining <= 0) {
        return {
            key: 'breach',
            bg: 'rgba(229, 57, 53, 0.12)',
            color: '#C62828',
            dot: '#E53935',
            label: 'Breached',
        }
    }

    let inFinalWindow = false
    const totalWindow = deadlineAtMs - windowStartAtMs
    if (
        windowStartAtMs != null &&
        Number.isFinite(windowStartAtMs) &&
        totalWindow > 0 &&
        remaining > 0 &&
        remaining <= totalWindow * 0.2
    ) {
        inFinalWindow = true
    }

    if (inFinalWindow) {
        return {
            key: 'warn',
            bg: 'rgba(251, 140, 0, 0.14)',
            color: '#EF6C00',
            dot: '#FB8C00',
            label: formatCountdown(remaining),
        }
    }

    return {
        key: 'safe',
        bg: 'rgba(67, 160, 71, 0.1)',
        color: '#2E7D32',
        dot: '#43A047',
        label: formatCountdown(remaining),
    }
}

export default function TimeLeftCountdown({ deadlineAtMs, windowStartAtMs, size = 'sm' }) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        if (deadlineAtMs == null || !Number.isFinite(deadlineAtMs)) return undefined
        setNow(Date.now())

        let id = 0
        const tick = () => setNow(Date.now())

        // Update once per second; browser may throttle in background.
        id = window.setInterval(tick, 1000)

        // When page becomes visible/focused, immediately catch up.
        const onFocus = () => tick()
        const onVis = () => {
            if (document.visibilityState === 'visible') tick()
        }
        window.addEventListener('focus', onFocus)
        document.addEventListener('visibilitychange', onVis)

        return () => {
            window.clearInterval(id)
            window.removeEventListener('focus', onFocus)
            document.removeEventListener('visibilitychange', onVis)
        }
    }, [deadlineAtMs])

    const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
    const textClass = size === 'sm' ? 'text-[11px]' : 'text-xs'

    if (deadlineAtMs == null || !Number.isFinite(deadlineAtMs)) {
        return <span className={`${textClass} text-gray-400 font-medium`}>—</span>
    }

    const v = computeVariant(now, deadlineAtMs, windowStartAtMs)

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-lg font-semibold ${textClass} ${pad}${v.key === 'breach' ? '' : ' max-w-[260px]'}`}
            style={{ background: v.bg, color: v.color }}
            title={v.key === 'breach' ? 'Past deadline' : v.key === 'warn' ? 'Less than 20% of time window remaining' : 'Within deadline'}
        >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.dot }} />
            <span className={`leading-snug ${v.key === 'breach' ? 'whitespace-nowrap' : 'break-words max-w-[260px]'}`}>{v.label}</span>
        </span>
    )
}

