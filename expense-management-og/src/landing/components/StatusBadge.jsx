const statusConfig = {
    pending: {
        label: 'Pending',
        bg: 'rgba(245,158,33,0.12)',
        color: '#a86a00',
        dot: '#F59E21',
        icon: 'ri-time-line',
    },
    approved: {
        label: 'Approved',
        bg: 'rgba(19,155,73,0.1)',
        color: '#139B49',
        dot: '#7dc244',
        icon: 'ri-checkbox-circle-line',
    },
    rejected: {
        label: 'Rejected',
        bg: 'rgba(238,106,49,0.1)',
        color: '#b84f1a',
        dot: '#ee6a31',
        icon: 'ri-close-circle-line',
    },
}

export default function StatusBadge({ status, size = 'md' }) {
    const config = statusConfig[String(status || '').toLowerCase()] ?? statusConfig.pending
    const pad = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap text-xs ${pad}`} style={{ background: config.bg, color: config.color }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: config.dot }} />
            {config.label}
        </span>
    )
}
