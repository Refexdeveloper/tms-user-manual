import { useMemo, useState } from 'react'
import PlaceAutocomplete from './PlaceAutocomplete'
import TripAddOns from './TripAddOns'
import { ModePhotoThumb } from './TravelModeCards'
import { IconBus, IconTrain } from './TravelIcons'

const todayIso = () => new Date().toISOString().slice(0, 10)

function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function fmtChip(iso) {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })
}

/** Clean train/bus search — tiny icons, Places-ready */
export default function GroundSearchForm({ mode, value, onChange }) {
  const v = value || {}
  const [searched, setSearched] = useState(false)
  const isBus = mode === 'bus'
  const isTrain = mode === 'train'

  function set(patch) {
    onChange({ ...v, ...patch })
  }

  const date = v.date || ''
  const chips = useMemo(() => {
    const base = todayIso()
    return [0, 1, 2].map((n) => {
      const iso = addDays(base, n)
      return { iso, label: fmtChip(iso) }
    })
  }, [])

  return (
    <div className="ground-search">
      <div className="ground-search-card">
        <div className="ground-search-head">
          <ModePhotoThumb mode={mode} size={36} alt={mode} />
          <div>
            <h3>{isTrain ? 'Train journey' : 'Bus journey'}</h3>
            <p>
              {isTrain
                ? 'Search stations & cities (Google Places ready)'
                : 'From = source · To = destination (Places ready)'}
            </p>
          </div>
        </div>

        <div className="ground-fields">
          <div className="ground-field">
            <div className="ground-field-label" style={{ color: isBus ? '#E88A2D' : '#70B62C' }}>
              {isBus ? <IconBus size={16} /> : <IconTrain size={16} />}
              From
            </div>
            <PlaceAutocomplete
              source="places"
              value={v.from}
              onChange={(loc) => set({ from: loc })}
              placeholder={isTrain ? 'Source station / city' : 'Source city'}
              compact
            />
          </div>

          <button
            type="button"
            className="ground-swap"
            title="Swap"
            onClick={() => set({ from: v.to, to: v.from })}
          >
            ⇄
          </button>

          <div className="ground-field">
            <div className="ground-field-label" style={{ color: isBus ? '#E88A2D' : '#70B62C' }}>
              {isBus ? <IconBus size={16} /> : <IconTrain size={16} />}
              To
            </div>
            <PlaceAutocomplete
              source="places"
              value={v.to}
              onChange={(loc) => set({ to: loc })}
              placeholder={isTrain ? 'Destination station / city' : 'Destination city'}
              compact
            />
          </div>

          <div className="ground-field date">
            <div className="ground-field-label">Departure</div>
            <input
              type="date"
              min={todayIso()}
              value={date}
              onChange={(e) => set({ date: e.target.value })}
            />
            <div className="date-chips">
              {chips.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  className={date === c.iso ? 'on' : ''}
                  onClick={() => set({ date: c.iso })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-primary ground-search-btn" onClick={() => setSearched(true)}>
          Search {isTrain ? 'trains' : 'buses'} →
        </button>

        {searched && (
          <div className="ground-result-hint">
            <strong>
              {v.from?.display || v.from?.label || 'From'} → {v.to?.display || v.to?.label || 'To'}
            </strong>
            <span>
              {date || 'Pick a date'} · Travel Desk will confirm seats. Mock Places until API key is set.
            </span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <TripAddOns
          showFlightHotel={false}
          value={v.addons || {}}
          onChange={(addons) => set({ addons })}
        />
      </div>

      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <div className="field">
          <label>Notes for Travel Desk</label>
          <textarea
            placeholder="Preferred timing, class, seat type…"
            value={v.notes || ''}
            onChange={(e) => set({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
