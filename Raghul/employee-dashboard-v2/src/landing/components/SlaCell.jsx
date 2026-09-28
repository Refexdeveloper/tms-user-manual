import { useEffect, useState } from 'react'

/** e.g. `16 Jul 2026, 11:27:25 AM` */
export function formatSlaDeadline(deadlineAtMsOrDate) {
    const d = new Date(deadlineAtMsOrDate)
    if (Number.isNaN(d.getTime())) return '—'
    const day = d.getDate()
    const month = d.toLocaleString('en-US', { month: 'short' })
    const year = d.getFullYear()
    const time = d.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    })
    return `${day} ${month} ${year}, ${time}`
}

/**
 * Two-unit precision that shrinks with magnitude:
 * - seconds only → `30 sec`
 * - minutes      → `10m 12s`
 * - hours        → `12h 32m`
 * - days         → `1d 12h` (stops at hours; e.g. `120d 21h`)
 */
export function formatSlaCompactDuration(ms) {
    if (!Number.isFinite(ms) || ms < 0) return '0 sec'
    const totalSec = Math.floor(ms / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds} sec`
}

/** Green (≥24h) · Yellow (<24h) · Orange (<1h) · Red (breached). */
export function getSlaPillStyle(remainingMs, breached) {
    if (breached) {
        return { bg: 'rgba(229, 57, 53, 0.12)', color: '#C62828', dot: '#E53935' }
    }
    const hours = remainingMs / 3600000
    if (hours < 1) {
        return { bg: 'rgba(251, 140, 0, 0.14)', color: '#E65100', dot: '#FB8C00' }
    }
    if (hours < 24) {
        return { bg: 'rgba(251, 140, 0, 0.14)', color: '#EF6C00', dot: '#FB8C00' }
    }
    return { bg: 'rgba(67, 160, 71, 0.1)', color: '#2E7D32', dot: '#43A047' }
}

export default function SlaCell({ deadlineAtMs, deadlineLabel, size = 'sm' }) {
    const [, setTick] = useState(0)

    useEffect(() => {
        if (deadlineAtMs == null || !Number.isFinite(deadlineAtMs)) return undefined
        let timeoutId
        const schedule = () => {
            // Under an hour (either side) the display shows seconds, so tick every second; otherwise every 30s.
            const absDiff = Math.abs(deadlineAtMs - Date.now())
            const delay = absDiff < 3600000 ? 1000 : 30000
            timeoutId = setTimeout(() => {
                setTick((t) => t + 1)
                schedule()
            }, delay)
        }
        schedule()
        return () => clearTimeout(timeoutId)
    }, [deadlineAtMs])

    const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
    const textClass = size === 'sm' ? 'text-[10px]' : 'text-[11px]'

    const hasDeadlineMs = deadlineAtMs != null && Number.isFinite(deadlineAtMs)
    const deadlineText =
        deadlineLabel && deadlineLabel !== '—'
            ? deadlineLabel
            : hasDeadlineMs
              ? formatSlaDeadline(deadlineAtMs)
              : '—'

    if (!hasDeadlineMs && deadlineText === '—') {
        return <span className={`${textClass} font-medium text-slate-400`}>—</span>
    }

    const now = Date.now()
    const breached = hasDeadlineMs && now > deadlineAtMs
    const diffMs = breached ? now - deadlineAtMs : hasDeadlineMs ? deadlineAtMs - now : 0
    const duration = formatSlaCompactDuration(diffMs)
    const pillText = breached ? `+${duration}` : `${duration} left`
    const pillStyle = getSlaPillStyle(diffMs, breached)

    return (
        <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
            <span className="text-[11px] tabular-nums leading-snug text-slate-600 whitespace-nowrap">{deadlineText}</span>
            {hasDeadlineMs && (
                <span
                    className={`inline-flex items-center gap-1 rounded-lg font-semibold whitespace-nowrap w-fit ${textClass} ${pad}`}
                    style={{ background: pillStyle.bg, color: pillStyle.color }}
                    title={breached ? 'SLA breached' : 'Time remaining'}
                >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pillStyle.dot }} />
                    {pillText}
                </span>
            )}
        </div>
    )
}
