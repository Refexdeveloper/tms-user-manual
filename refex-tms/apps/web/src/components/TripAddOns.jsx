import { useState } from 'react'
import { IconCab, IconFlightHotel, IconHotel } from './TravelIcons'

/**
 * Optional Hotel / Cab add-ons — mobile-friendly tabs (mockup screen 5).
 */
export default function TripAddOns({ value = {}, onChange, showFlightHotel = true }) {
  const v = value || {}
  const [tab, setTab] = useState(showFlightHotel ? 'hotel' : 'cab')

  function toggle(key) {
    onChange({ ...v, [key]: !v[key] })
  }

  return (
    <div className="addons-card addons-mobile">
      <div className="addons-head">
        <h4>Add accommodation & transport</h4>
        <p>Optional — Travel Desk will arrange selected add-ons.</p>
      </div>

      <div className="addon-tabs" role="tablist">
        {showFlightHotel && (
          <button
            type="button"
            role="tab"
            className={`addon-tab${tab === 'hotel' ? ' active' : ''}`}
            onClick={() => setTab('hotel')}
          >
            <span className="addon-tab-ico" style={{ color: '#8B5CF6' }}>
              <IconHotel size={18} />
            </span>
            Hotel
          </button>
        )}
        <button
          type="button"
          role="tab"
          className={`addon-tab${tab === 'cab' ? ' active' : ''}`}
          onClick={() => setTab('cab')}
        >
          <span className="addon-tab-ico" style={{ color: '#4F6BED' }}>
            <IconCab size={18} />
          </span>
          Cab / Transfer
        </button>
      </div>

      {tab === 'hotel' && showFlightHotel && (
        <button
          type="button"
          className={`addon-tile${v.withHotel ? ' on' : ''}`}
          onClick={() => toggle('withHotel')}
        >
          <span className="addon-mini" style={{ color: '#2d7bbf', background: '#e8f4fc' }}>
            <IconFlightHotel size={22} />
          </span>
          <div>
            <strong>Flight + Hotel</strong>
            <span>Ask Travel Desk for stay with this trip</span>
          </div>
          <span className="addon-check">{v.withHotel ? '✓' : ''}</span>
        </button>
      )}

      {tab === 'cab' && (
        <button
          type="button"
          className={`addon-tile${v.withCab ? ' on' : ''}`}
          onClick={() => toggle('withCab')}
        >
          <span className="addon-mini" style={{ color: '#4F6BED', background: '#E8EEFF' }}>
            <IconCab size={22} />
          </span>
          <div>
            <strong>Airport / station cab</strong>
            <span>Pickup & drop with this journey</span>
          </div>
          <span className="addon-check">{v.withCab ? '✓' : ''}</span>
        </button>
      )}
    </div>
  )
}
