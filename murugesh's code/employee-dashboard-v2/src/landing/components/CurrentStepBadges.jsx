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
        return { bg: 'rgba(229, 57, 53, 0.1)', color: '#E53935', dot: '#E53935' }
    }
    if (t.includes('withdrawn')) {
        return { bg: '#f1f5f9', color: '#7F8C8D', dot: '#94a3b8' }
    }
    if (t.includes('exception')) {
        return { bg: 'rgba(251, 140, 0, 0.14)', color: '#EF6C00', dot: '#FB8C00' }
    }
    if (t.includes('manager') || /\bl[123]\b/.test(t) || (t.includes('approval') && !t.includes('rejected'))) {
        return { bg: 'rgba(30, 136, 229, 0.12)', color: '#1565C0', dot: '#1E88E5' }
    }
    if (t.includes('complete') || (t.includes('approved') && !t.includes('approval')) || t.includes('paid') || t.includes('booked')) {
        return { bg: 'rgba(67, 160, 71, 0.1)', color: '#2E7D32', dot: '#43A047' }
    }
    if (t.includes('pending') || t.includes('submitted') || t.includes('review') || t.includes('progress') || t.includes('draft')) {
        return { bg: 'rgba(251, 140, 0, 0.12)', color: '#EF6C00', dot: '#FB8C00' }
    }
    return { bg: '#eff6ff', color: '#1E88E5', dot: '#1E88E5' }
}

export default function CurrentStepBadges({ text, size = 'sm' }) {
    const parts = parseStepParts(text)
    const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
    const textClass = size === 'sm' ? 'text-[11px]' : 'text-xs'

    if (!parts.length) {
        return <span className={`${textClass} font-medium text-slate-400`}>—</span>
    }

    return (
        <div className="flex flex-wrap items-center gap-1 gap-y-1">
            {parts.map((label, i) => {
                const v = stepVisual(label)
                return (
                    <span
                        key={`${label}-${i}`}
                        className={`inline-flex items-center gap-1 rounded-lg font-semibold whitespace-nowrap ${textClass} ${pad}`}
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
