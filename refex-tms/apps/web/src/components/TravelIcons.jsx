/** Tiny travel icons — flight from employee-dashboard remixicon; others animated */

export function IconFlight({ size = 28, animated = true }) {
  return (
    <span
      className={`ti-wrap ti-remix${animated ? ' ti-fly' : ''}`}
      style={{ width: size, height: size, fontSize: size }}
      aria-hidden
    >
      <i className="ri-flight-takeoff-line" />
    </span>
  )
}

export function IconTrain({ size = 28, animated = true }) {
  return (
    <span className={`ti-wrap${animated ? ' ti-train' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="6" y="3.5" width="12" height="13" rx="3.5" fill="currentColor" />
        <rect x="8" y="5.5" width="3.5" height="3" rx="0.6" fill="#fff" opacity="0.9" />
        <rect x="12.5" y="5.5" width="3.5" height="3" rx="0.6" fill="#fff" opacity="0.9" />
        <circle cx="9" cy="18.5" r="1.4" fill="currentColor" />
        <circle cx="15" cy="18.5" r="1.4" fill="currentColor" />
        <path className="ti-smoke" d="M8 2.2c.4-.8 1.2-1 1.6-.2M11 1.8c.5-1 1.4-1.1 1.7-.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      </svg>
    </span>
  )
}

export function IconBus({ size = 28, animated = true }) {
  return (
    <span className={`ti-wrap${animated ? ' ti-bus' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="5" width="16" height="11" rx="3" fill="currentColor" />
        <rect x="6" y="7" width="4" height="3.2" rx="0.5" fill="#fff" opacity="0.9" />
        <rect x="11" y="7" width="4" height="3.2" rx="0.5" fill="#fff" opacity="0.9" />
        <circle cx="8" cy="17.5" r="1.5" fill="currentColor" />
        <circle cx="16" cy="17.5" r="1.5" fill="currentColor" />
        <path className="ti-road" d="M3 20.5h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      </svg>
    </span>
  )
}

export function IconCab({ size = 28, animated = true }) {
  return (
    <span className={`ti-wrap${animated ? ' ti-cab' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 13.5l1.4-4.2A2.5 2.5 0 0 1 7.8 7.5h8.4a2.5 2.5 0 0 1 2.4 1.8L20 13.5V17H4v-3.5z" fill="currentColor" />
        <rect x="7" y="9" width="4" height="2.4" rx="0.4" fill="#fff" opacity="0.9" />
        <rect x="13" y="9" width="4" height="2.4" rx="0.4" fill="#fff" opacity="0.9" />
        <circle cx="7.5" cy="17.5" r="1.4" fill="currentColor" />
        <circle cx="16.5" cy="17.5" r="1.4" fill="currentColor" />
        <rect x="10.2" y="5.5" width="3.6" height="1.6" rx="0.4" fill="#FBBF24" />
      </svg>
    </span>
  )
}

export function IconHotel({ size = 28 }) {
  return (
    <span className="ti-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="6" y="4" width="12" height="16" rx="1.5" fill="currentColor" />
        <rect x="8" y="6.5" width="2.5" height="2.5" rx="0.4" fill="#fff" opacity="0.9" />
        <rect x="13.5" y="6.5" width="2.5" height="2.5" rx="0.4" fill="#fff" opacity="0.9" />
        <rect x="8" y="11" width="2.5" height="2.5" rx="0.4" fill="#fff" opacity="0.9" />
        <rect x="13.5" y="11" width="2.5" height="2.5" rx="0.4" fill="#fff" opacity="0.9" />
        <rect x="10.5" y="15.5" width="3" height="4.5" rx="0.3" fill="#fff" opacity="0.85" />
      </svg>
    </span>
  )
}

export function IconFlightHotel({ size = 28 }) {
  return (
    <span className="ti-wrap" style={{ width: size, height: size, display: 'inline-flex', gap: 1 }}>
      <IconFlight size={Math.round(size * 0.72)} animated={false} />
      <IconHotel size={Math.round(size * 0.72)} />
    </span>
  )
}

export function IconBusIn(props) {
  return <IconBus {...props} />
}

export function IconBusOut(props) {
  return <IconBus {...props} />
}

export const MODE_VISUAL = {
  air: { Icon: IconFlight, label: 'Flights', accent: '#2D7BBF', soft: '#E8F4FC', color: '#2D7BBF' },
  train: { Icon: IconTrain, label: 'Trains', accent: '#70B62C', soft: '#E8F6E0', color: '#70B62C' },
  bus: { Icon: IconBus, label: 'Buses', accent: '#E88A2D', soft: '#FFF3E0', color: '#E88A2D' },
  cab: { Icon: IconCab, label: 'Cabs', accent: '#4F6BED', soft: '#E8EEFF', color: '#4F6BED' },
  accommodation: { Icon: IconHotel, label: 'Hotels', accent: '#8B5CF6', soft: '#F5E8FF', color: '#8B5CF6' },
}

export const PRIMARY_MODES = [
  { id: 'air', label: 'Flights', subtitle: 'Live fares', to: '/new?mode=air', mode: 'air' },
  { id: 'accommodation', label: 'Hotels', subtitle: 'Stay', to: '/new?mode=accommodation', mode: 'accommodation' },
  { id: 'train', label: 'Trains', subtitle: 'Places', to: '/new?mode=train', mode: 'train' },
  { id: 'bus', label: 'Buses', subtitle: 'City to city', to: '/new?mode=bus', mode: 'bus' },
]
