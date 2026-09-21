import { Link } from 'react-router-dom'
import { MODE_VISUAL, PRIMARY_MODES, IconFlight, IconTrain, IconBus, IconHotel, IconCab } from './TravelIcons'

const ICONS = {
  air: IconFlight,
  train: IconTrain,
  bus: IconBus,
  accommodation: IconHotel,
  cab: IconCab,
}

/**
 * Compact mode rail — remixicon flight + animated icons (no instructional fluff)
 */
export default function TravelModeCards({
  title = 'Book your trip',
  subtitle = null,
  onSelect,
  selected,
}) {
  function go(item, e) {
    if (onSelect) {
      e.preventDefault()
      onSelect(item.mode)
    }
  }

  return (
    <section className="travel-modes-compact">
      {(title || subtitle) && (
        <div className="travel-modes-head">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}

      <div className="mmt-mode-rail" role="tablist" aria-label="Travel modes">
        {PRIMARY_MODES.map((m) => {
          const visual = MODE_VISUAL[m.mode]
          const Icon = ICONS[m.mode] || IconFlight
          const active = selected === m.mode
          const cls = `mmt-mode-tab${active ? ' active' : ''}`
          const style = { '--mode-accent': visual.accent }
          const inner = (
            <>
              <span className="mmt-mode-img-wrap mmt-mode-icon-wrap" style={{ color: visual.accent, background: visual.soft }}>
                <Icon size={26} />
              </span>
              <span className="mmt-mode-label">{m.label}</span>
            </>
          )
          return onSelect ? (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cls}
              style={style}
              onClick={(e) => go(m, e)}
            >
              {inner}
            </button>
          ) : (
            <Link key={m.id} to={m.to} className={cls} style={style}>
              {inner}
            </Link>
          )
        })}
      </div>

      <div className="mmt-mode-extra">
        <Link to="/new?mode=cab" className="mmt-extra-link">
          <IconCab size={18} animated={false} />
          Cab
        </Link>
        <Link to="/new?mode=air&addon=hotel" className="mmt-extra-link">
          Flight + Hotel
        </Link>
      </div>
    </section>
  )
}

/** Tiny chip for request rows — remix flight when air */
export function ModePhotoThumb({ mode, withHotel = false, size = 32, alt }) {
  const visual = MODE_VISUAL[withHotel ? 'accommodation' : mode] || MODE_VISUAL.air
  const Icon = withHotel ? IconHotel : ICONS[mode] || IconFlight
  return (
    <span
      className="mode-icon-thumb mode-icon-thumb-photo"
      style={{ width: size, height: size, background: visual.soft, color: visual.accent }}
      title={alt || visual.label}
    >
      <Icon size={Math.round(size * 0.55)} animated={false} />
    </span>
  )
}
