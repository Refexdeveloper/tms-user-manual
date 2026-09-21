import { useMemo, useState } from 'react'
import { api } from '../api'
import PlaceAutocomplete from './PlaceAutocomplete'
import AirlineLogo from './AirlineLogo'
import { formatMoney } from '../lib/constants'

const TRIP_TABS = [
  { id: 'oneWay', label: 'One Way' },
  { id: 'roundTrip', label: 'Round Trip' },
  { id: 'multiCity', label: 'Multi-city' },
]

const todayIso = () => new Date().toISOString().slice(0, 10)

function emptySegment() {
  return { from: null, to: null, date: '' }
}

/**
 * Air/Flight search + selection step.
 * Reuses the existing eTravel Air/Flight Cloud Run service (via the API proxy),
 * so search behaviour, fields and business rules match the configuration already
 * used in the Kissflow flight-search component.
 */
export default function FlightSearchStep({ value, onChange }) {
  const [tripType, setTripType] = useState(value?.tripType || 'oneWay')
  const [fareClass, setFareClass] = useState(value?.fareClass || 'Economy')
  const [segments, setSegments] = useState(
    value?.segments?.length ? value.segments : [emptySegment(), emptySegment()]
  )
  const [returnDate, setReturnDate] = useState(value?.returnDate || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [options, setOptions] = useState([])
  const [activeLeg, setActiveLeg] = useState(0)
  const [selected, setSelected] = useState(value?.selectedOption || null)
  const [filters, setFilters] = useState({ stops: new Set(), airlines: new Set(), depart: new Set() })
  const [sortBy, setSortBy] = useState('price')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const leg0 = segments[0]
  const singleTo = tripType !== 'multiCity' ? segments[0]?.to : null

  function updateSegment(i, patch) {
    setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }

  function addLeg() {
    setSegments((prev) => {
      if (prev.length >= 4) return prev
      const last = prev[prev.length - 1]
      return [...prev, { from: last?.to || null, to: null, date: last?.date || '' }]
    })
  }

  function removeLeg(i) {
    setSegments((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev))
  }

  function swap() {
    setSegments((prev) => {
      const next = [...prev]
      next[0] = { ...next[0], from: prev[0].to, to: prev[0].from }
      return next
    })
  }

  async function runSearch() {
    setError('')
    const from = segments[0]?.from
    const to = tripType === 'multiCity' ? segments[segments.length - 1]?.to : segments[0]?.to
    const depDate = segments[0]?.date

    if (!from || !to || !depDate) {
      setError('Please choose From, To and a travel date before searching.')
      return
    }
    if (tripType === 'roundTrip' && !returnDate) {
      setError('Please choose a return date for a round trip.')
      return
    }
    if (tripType === 'multiCity' && segments.some((s) => !s.from || !s.to || !s.date)) {
      setError('Please complete every leg (From, To, Date) before searching.')
      return
    }

    const basePayload = {
      tripType,
      isInternational: from.city && to.city ? false : false,
      fareClass,
      fromCity: from.code,
      toCity: to.code,
      depDate,
      noOfAdults: 1,
      noOfChildren: 0,
      noOfInfant: 0,
      limit: 40,
      maxResults: 40,
    }
    if (tripType === 'roundTrip') basePayload.arrDate = returnDate
    if (tripType === 'multiCity') {
      basePayload.segments = segments.map((s) => ({
        fromCity: s.from.code,
        toCity: s.to.code,
        depDate: s.date,
      }))
    }

    setLoading(true)
    setOptions([])
    try {
      const data = await api('/flights/search', { method: 'POST', body: basePayload })
      const result = data.result || {}
      const raw = result.options || result.flights || []
      setOptions(Array.isArray(raw) ? raw : [])
      setFilters({ stops: new Set(), airlines: new Set(), depart: new Set() })
      setSortBy('price')
      setFiltersOpen(false)
      setActiveLeg(0)
      setStatus(
        `${(raw || []).length} option${(raw || []).length === 1 ? '' : 's'} shown · ${result.currencyCode || 'INR'}`
      )
      if (!raw || raw.length === 0) {
        setError('No flights found for this search. Try different dates or route.')
      }
    } catch (err) {
      setError(err.message || 'Flight search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function legOptions(legIndex) {
    if (tripType === 'oneWay') return options
    return options.filter((o) => Number(o.sectorIndex ?? 0) === legIndex)
  }

  const currentLegFlights = useMemo(() => legOptions(activeLeg), [options, tripType, activeLeg])

  const airlineFilters = useMemo(() => {
    const map = new Map()
    for (const o of currentLegFlights) {
      const key = o.airlineName || o.airlineCode || 'Airline'
      const prev = map.get(key) || { count: 0, code: o.airlineCode }
      map.set(key, { count: prev.count + 1, code: prev.code || o.airlineCode })
    }
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count)
  }, [currentLegFlights])

  const visibleFlights = useMemo(() => {
    let list = [...currentLegFlights]
    if (filters.stops.size) {
      list = list.filter((o) => {
        const s = Number(o.stops || 0)
        return (
          (filters.stops.has('0') && s === 0) ||
          (filters.stops.has('1') && s === 1) ||
          (filters.stops.has('2plus') && s >= 2)
        )
      })
    }
    if (filters.airlines.size) {
      list = list.filter((o) => filters.airlines.has(o.airlineName || o.airlineCode))
    }
    if (filters.depart.size) {
      list = list.filter((o) => {
        const h = parseInt(String(o.departureTime || '0').split(':')[0], 10) || 0
        return (
          (filters.depart.has('night') && h >= 0 && h < 6) ||
          (filters.depart.has('morning') && h >= 6 && h < 12) ||
          (filters.depart.has('afternoon') && h >= 12 && h < 18) ||
          (filters.depart.has('evening') && h >= 18 && h < 24)
        )
      })
    }
    list.sort((a, b) => {
      if (sortBy === 'duration') {
        return (parseDuration(a.duration) || 0) - (parseDuration(b.duration) || 0)
      }
      if (sortBy === 'depart') {
        return String(a.departureTime || '').localeCompare(String(b.departureTime || ''))
      }
      return (Number(a.totalFare) || 0) - (Number(b.totalFare) || 0)
    })
    return list
  }, [currentLegFlights, filters, sortBy])

  function parseDuration(d) {
    if (!d) return 0
    const m = String(d).match(/(\d+)\s*h.*?(\d+)\s*m/i) || String(d).match(/(\d+)\s*h/i)
    if (!m) return 0
    return Number(m[1] || 0) * 60 + Number(m[2] || 0)
  }

  function toggleStop(id) {
    setFilters((f) => {
      const next = new Set(f.stops)
      next.has(id) ? next.delete(id) : next.add(id)
      return { ...f, stops: next }
    })
  }

  function toggleAirline(name) {
    setFilters((f) => {
      const next = new Set(f.airlines)
      next.has(name) ? next.delete(name) : next.add(name)
      return { ...f, airlines: next }
    })
  }

  function toggleDepart(id) {
    setFilters((f) => {
      const next = new Set(f.depart)
      next.has(id) ? next.delete(id) : next.add(id)
      return { ...f, depart: next }
    })
  }

  const activeFilterCount = filters.stops.size + filters.airlines.size + filters.depart.size

  function FiltersPanel({ onClose }) {
    return (
      <div className="flight-filters-card">
        <div className="flight-filters-head">
          <strong className="flight-filters-title">Filters</strong>
          {onClose && (
            <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={onClose}>
              Done
            </button>
          )}
        </div>

        <div className="flight-filters-section">
          <div className="flight-filters-label">STOPS</div>
          {[
            ['0', 'Non-stop'],
            ['1', '1 stop'],
            ['2plus', '2+ Stops'],
          ].map(([id, label]) => (
            <label key={id} className="flight-filter-row">
              <input type="checkbox" checked={filters.stops.has(id)} onChange={() => toggleStop(id)} />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="flight-filters-section">
          <div className="flight-filters-label">AIRLINES</div>
          {airlineFilters.map(([name, meta]) => (
            <label key={name} className="flight-filter-row">
              <input type="checkbox" checked={filters.airlines.has(name)} onChange={() => toggleAirline(name)} />
              <AirlineLogo code={meta.code} name={name} size={22} />
              <span>
                {name} ({meta.count})
              </span>
            </label>
          ))}
        </div>

        <div className="flight-filters-section">
          <div className="flight-filters-label">DEPARTURE TIME</div>
          {[
            ['night', '00:00 – 06:00'],
            ['morning', '06:00 – 12:00'],
            ['afternoon', '12:00 – 18:00'],
            ['evening', '18:00 – 24:00'],
          ].map(([id, label]) => (
            <label key={id} className="flight-filter-row">
              <input type="checkbox" checked={filters.depart.has(id)} onChange={() => toggleDepart(id)} />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setFilters({ stops: new Set(), airlines: new Set(), depart: new Set() })}
          >
            Clear filters
          </button>
        )}
      </div>
    )
  }

  function selectFlight(legIndex, flight) {
    if (tripType === 'oneWay') {
      const next = { type: 'oneWay', flight }
      setSelected(next)
      emit(next)
      return
    }
    if (tripType === 'roundTrip') {
      const cur = selected?.type === 'roundTrip' ? selected : { type: 'roundTrip', onward: null, return: null }
      const next = { ...cur, [legIndex === 0 ? 'onward' : 'return']: flight }
      setSelected(next)
      emit(next)
      if (legIndex === 0) setActiveLeg(1)
      return
    }
    // multiCity
    const cur = selected?.type === 'multiCity' ? selected : { type: 'multiCity', legs: [] }
    const legs = [...(cur.legs || [])]
    legs[legIndex] = flight
    const next = { type: 'multiCity', legs }
    setSelected(next)
    emit(next)
    if (legIndex < segments.length - 1) setActiveLeg(legIndex + 1)
  }

  function emit(nextSelected) {
    onChange({
      tripType,
      fareClass,
      segments,
      returnDate,
      selectedOption: nextSelected,
      snapshot: { options, tripType, searchedAt: new Date().toISOString() },
    })
  }

  const legLabels =
    tripType === 'roundTrip'
      ? ['Onward', 'Return']
      : segments.map((_, i) => `Stop ${i + 1}`)
  const legCount = tripType === 'roundTrip' ? 2 : tripType === 'multiCity' ? segments.length : 1

  return (
    <div>
      <div className="search-card">
        <div className="trip-tabs">
          {TRIP_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`trip-tab ${tripType === t.id ? 'active' : ''}`}
              onClick={() => {
                setTripType(t.id)
                setOptions([])
                setSelected(null)
                if (t.id === 'multiCity' && segments.length < 2) {
                  setSegments([emptySegment(), emptySegment()])
                }
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tripType !== 'multiCity' ? (
          <div className="search-fields">
            <PlaceAutocomplete
              label="From"
              value={leg0.from}
              onChange={(v) => updateSegment(0, { from: v })}
              placeholder="City or airport"
            />
            <button type="button" className="swap-btn" onClick={swap} title="Swap">
              ⇄
            </button>
            <PlaceAutocomplete
              label="To"
              value={leg0.to}
              onChange={(v) => updateSegment(0, { to: v })}
              placeholder="City or airport"
            />
            <div className="field">
              <label>Departure</label>
              <input
                type="date"
                min={todayIso()}
                value={leg0.date}
                onChange={(e) => updateSegment(0, { date: e.target.value })}
              />
            </div>
            {tripType === 'roundTrip' ? (
              <div className="field">
                <label>Return</label>
                <input
                  type="date"
                  min={leg0.date || todayIso()}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            ) : (
              <div className="field">
                <label>Class</label>
                <select value={fareClass} onChange={(e) => setFareClass(e.target.value)}>
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                </select>
              </div>
            )}
            <button type="button" className="btn btn-accent" onClick={runSearch} disabled={loading}>
              {loading ? 'Searching…' : 'SEARCH'}
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            {segments.map((seg, i) => (
              <div key={i} className="grid-3" style={{ marginBottom: 10, alignItems: 'end' }}>
                <PlaceAutocomplete
                  label={`Leg ${i + 1} · From`}
                  value={seg.from}
                  onChange={(v) => updateSegment(i, { from: v })}
                />
                <PlaceAutocomplete
                  label="To"
                  value={seg.to}
                  onChange={(v) => updateSegment(i, { to: v })}
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Date</label>
                    <input
                      type="date"
                      min={todayIso()}
                      value={seg.date}
                      onChange={(e) => updateSegment(i, { date: e.target.value })}
                    />
                  </div>
                  {segments.length > 2 && (
                    <button type="button" className="btn btn-ghost" onClick={() => removeLeg(i)}>
                      −
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {segments.length < 4 && (
                <button type="button" className="btn btn-ghost" onClick={addLeg}>
                  + Add another leg
                </button>
              )}
              <select
                value={fareClass}
                onChange={(e) => setFareClass(e.target.value)}
                style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px' }}
              >
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
              </select>
              <button type="button" className="btn btn-accent" onClick={runSearch} disabled={loading} style={{ marginLeft: 'auto' }}>
                {loading ? 'Searching…' : 'SEARCH'}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="banner warn" style={{ marginTop: 16 }}>{error}</div>}
      {status && options.length > 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '16px 0 8px' }}>{status}</p>
      )}

      {options.length > 0 && legCount > 1 && (
        <div className="trip-tabs" style={{ background: '#eef1f6', marginTop: 10 }}>
          {legLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`trip-tab ${activeLeg === i ? 'active' : ''}`}
              style={activeLeg !== i ? { color: 'var(--muted)' } : undefined}
              onClick={() => setActiveLeg(i)}
            >
              {label}
              {(tripType === 'roundTrip' ? selected?.[i === 0 ? 'onward' : 'return'] : selected?.legs?.[i]) ? ' ✓' : ''}
            </button>
          ))}
        </div>
      )}

      {options.length > 0 && (
        <div className="flight-results-layout anim-fade-up" style={{ marginTop: 14 }}>
          <aside className="flight-filters-desktop">
            <FiltersPanel />
          </aside>

          <div className="flight-results-main">
            <div className="flight-results-toolbar">
              <button
                type="button"
                className="btn btn-ghost flight-filter-open"
                onClick={() => setFiltersOpen(true)}
              >
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
              </button>
              <div className="flight-sort-tabs">
                {[
                  ['price', 'Lowest Price'],
                  ['duration', 'Shortest'],
                  ['depart', 'Earliest'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`flight-sort-tab${sortBy === id ? ' active' : ''}`}
                    onClick={() => setSortBy(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="pill flight-count-pill">
                {visibleFlights.length}/{currentLegFlights.length}
              </span>
            </div>

            {visibleFlights.length === 0 && (
              <p style={{ color: 'var(--muted)' }}>No flights match these filters.</p>
            )}
            {visibleFlights.map((opt, idx) => {
              const isSelected =
                tripType === 'oneWay'
                  ? selected?.flight === opt
                  : tripType === 'roundTrip'
                    ? selected?.[activeLeg === 0 ? 'onward' : 'return'] === opt
                    : selected?.legs?.[activeLeg] === opt
              return (
                <FlightCard
                  key={opt.__optionKey || opt.id || idx}
                  option={opt}
                  selected={isSelected}
                  onSelect={() => selectFlight(activeLeg, opt)}
                />
              )
            })}
          </div>

          {filtersOpen && (
            <div className="flight-filters-sheet" role="dialog" aria-modal="true">
              <button type="button" className="flight-filters-backdrop" aria-label="Close" onClick={() => setFiltersOpen(false)} />
              <div className="flight-filters-sheet-panel">
                <FiltersPanel onClose={() => setFiltersOpen(false)} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FlightCard({ option, selected, onSelect }) {
  return (
    <div className={`flight-card flight-card-mobile ${selected ? 'selected' : ''}`}>
      <div className="flight-card-top">
        <div className="flight-airline">
          <AirlineLogo code={option.airlineCode} name={option.airlineName} size={36} />
          <div>
            <strong>{option.airlineName || option.airlineCode}</strong>
            <div className="muted-sm">
              {option.airlineCode} {option.flightNumber}
            </div>
          </div>
        </div>
        <div className="flight-price">{formatMoney(option.totalFare, option.currencyCode)}</div>
      </div>
      <div className="flight-route">
        <div className="flight-time">
          <div className="t">{option.departureTime || '--:--'}</div>
          <div className="c">{option.sourceCityCode}</div>
        </div>
        <div className="flight-mid">
          <div>{option.duration || ''}</div>
          <div className="line" />
          <div>{option.stops ? `${option.stops} stop${option.stops > 1 ? 's' : ''}` : 'Non-stop'}</div>
        </div>
        <div className="flight-time">
          <div className="t">{option.arrivalTime || '--:--'}</div>
          <div className="c">{option.destinationCityCode}</div>
        </div>
      </div>
      <div className="flight-card-actions">
        <span className="flight-details-link">Flight details</span>
        <button type="button" className={`btn ${selected ? 'btn-success' : 'btn-primary'}`} onClick={onSelect}>
          {selected ? 'Selected ✓' : 'Select'}
        </button>
      </div>
    </div>
  )
}
