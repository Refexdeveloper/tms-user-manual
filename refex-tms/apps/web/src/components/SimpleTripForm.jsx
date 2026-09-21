import PlaceAutocomplete from './PlaceAutocomplete'
import TripAddOns from './TripAddOns'
import { ModePhotoThumb } from './TravelModeCards'

const todayIso = () => new Date().toISOString().slice(0, 10)

const COPY = {
  cab: {
    title: 'Cab / Airport transfer',
    hint: 'Pickup & drop for Travel Desk',
  },
  accommodation: {
    title: 'Hotel / Stay',
    hint: 'City and dates for hotel options',
  },
}

export default function SimpleTripForm({ mode, value, onChange }) {
  const copy = COPY[mode] || COPY.cab
  const v = value || {}
  const isStay = mode === 'accommodation'

  function set(patch) {
    onChange({ ...v, ...patch })
  }

  return (
    <div className="ground-search">
      <div className="ground-search-card">
        <div className="ground-search-head">
          <ModePhotoThumb mode={mode} size={36} alt={mode} />
          <div>
            <h3>{copy.title}</h3>
            <p>{copy.hint}</p>
          </div>
        </div>

        <div className="grid-2">
          {isStay ? (
            <PlaceAutocomplete
              label="City"
              source="places"
              value={v.city}
              onChange={(loc) => set({ city: loc })}
              placeholder="Search city (Google Places ready)"
            />
          ) : (
            <>
              <PlaceAutocomplete
                label="Pickup"
                source="places"
                value={v.from}
                onChange={(loc) => set({ from: loc })}
                placeholder="Pickup location"
              />
              <PlaceAutocomplete
                label="Drop"
                source="places"
                value={v.to}
                onChange={(loc) => set({ to: loc })}
                placeholder="Drop location"
              />
            </>
          )}
        </div>

        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="field">
            <label>{isStay ? 'Check-in' : 'Pickup date'}</label>
            <input
              type="date"
              min={todayIso()}
              value={v.date || ''}
              onChange={(e) => set({ date: e.target.value })}
            />
          </div>
          {isStay ? (
            <div className="field">
              <label>Check-out</label>
              <input
                type="date"
                min={v.date || todayIso()}
                value={v.endDate || ''}
                onChange={(e) => set({ endDate: e.target.value })}
              />
            </div>
          ) : (
            <div className="field">
              <label>Pickup time</label>
              <input
                type="time"
                value={v.time || ''}
                onChange={(e) => set({ time: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Additional notes</label>
          <textarea
            placeholder="Preferred vehicle, special requirements…"
            value={v.notes || ''}
            onChange={(e) => set({ notes: e.target.value })}
          />
        </div>
      </div>

      {mode === 'cab' && (
        <div style={{ marginTop: 14 }}>
          <TripAddOns showFlightHotel={false} value={v.addons || {}} onChange={(addons) => set({ addons })} />
        </div>
      )}
    </div>
  )
}
