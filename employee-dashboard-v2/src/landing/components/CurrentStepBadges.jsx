/** Split workflow step text into parts (e.g. multiple steps joined with commas). */
function parseStepParts(raw) {
    if (raw === null || raw === undefined) return []
    const s = String(raw).trim()
    if (!s) return []
    return s
        .split(',')
        .map((p) => p.replace(/^["'\s]+|["'\s]+$/g, '').trim())
        .filter(Boolean)
}

/** Map step label to badge colors (order: specific → general). */
function stepVisual(label) {
    const t = String(label || '').toLowerCase()

    if (t.includes('rejected')) {
        return { bg: 'rgba(220, 38, 38, 0.1)', color: '#b91c1c', dot: '#ef4444' }
    }
    if (t.includes('withdrawn')) {
        return { bg: 'rgba(71, 85, 105, 0.12)', color: '#475569', dot: '#64748b' }
    }
    if (t.includes('exception')) {
        return { bg: 'rgba(245, 158, 11, 0.14)', color: '#b45309', dot: '#f59e0b' }
    }
    if (t.includes('manager') || /\bl[123]\b/.test(t) || (t.includes('approval') && !t.includes('rejected'))) {
        return { bg: 'rgba(40, 121, 182, 0.12)', color: '#1e4d72', dot: '#2879b6' }
    }
    if (t.includes('complete') || (t.includes('approved') && !t.includes('approval')) || t.includes('paid') || t.includes('booked')) {
        return { bg: 'rgba(19, 155, 73, 0.1)', color: '#166534', dot: '#22c55e' }
    }
    if (t.includes('pending') || t.includes('submitted') || t.includes('review') || t.includes('progress') || t.includes('draft')) {
        return { bg: 'rgba(245, 158, 33, 0.12)', color: '#a86a00', dot: '#F59E21' }
    }
    return { bg: 'rgba(99, 102, 241, 0.1)', color: '#4338ca', dot: '#6366f1' }
}

export default function CurrentStepBadges({ text, size = 'sm' }) {
    const parts = parseStepParts(text)
    const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
    const textClass = size === 'sm' ? 'text-[11px]' : 'text-xs'

    if (!parts.length) {
        return <span className={`${textClass} text-gray-400 font-medium`}>—</span>
    }

    return (
        <div className="flex flex-wrap items-center gap-1 gap-y-1">
            {parts.map((label, i) => {
                const v = stepVisual(label)
                return (
                    <span
                        key={`${label}-${i}`}
                        className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${textClass} ${pad}`}
                        style={{ background: v.bg, color: v.color }}
                        title={label}
                    >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.dot }} />
                        {label}
                    </span>
                )
            })}
        </div>
    )
}
