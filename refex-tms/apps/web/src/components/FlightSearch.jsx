import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import AirlineLogo from './AirlineLogo'

const POLICY_DAYS = 15

function daysUntil(dateStr) {
  if (!dateStr) return null
  const dep = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((dep - today) / (24 * 60 * 60 * 1000))
}

function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function FlightSearch({ value, onSelect }) {
  const [tripType, setTripType] = useState(value?.tripType || 'oneWay')
  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const [fromAirport, setFromAirport] = useState(null)
  const [toAirport, setToAirport] = useState(null)
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])
  const [depDate, setDepDate] = useState('')
  const [arrDate, setArrDate] = useState('')
  const [fareClass, setFareClass] = useState('Economy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(value?.selected || null)
  const [filters, setFilters] = useState({ stops: new Set(), airlines: new Set() })

  async function searchAirports(term, target) {
    if (!term || term.length < 2) return
    const data = await api(`/flights/airports?term=${encodeURIComponent(term)}&limit=8`)
    const results = data.results || []
    target === 'from' ? setFromSuggestions(results) : setToSuggestions(results)
  }

  const policy = useMemo(() => {
    const d = daysUntil(depDate)
    if (d == null) return null
    if (d >= POLICY_DAYS) {
      return { ok: true, message: `Within ${POLICY_DAYS}-day advance booking policy.` }
    }
    return {
      ok: false,
      message: `This booking breaches the ${POLICY_DAYS}-day advance booking policy by ${POLICY_DAYS - d} days. Fare impact tracking should be initiated for Finance/Admin review.`,
    }
  }, [depDate])

  const airlines = useMemo(() => {
    const map = new Map()
    for (const o of options) {
      const key = o.airlineName || o.airlineCode || 'Airline'
      const prev = map.get(key) || { count: 0, code: o.airlineCode }
      map.set(key, { count: prev.count + 1, code: prev.code || o.airlineCode })
    }
    return [...map.entries()]
  }, [options])

  const visible = useMemo(() => {
    let list = [...options]
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
    return list
  }, [options, filters])

  function swapAirports() {
    const a = fromAirport
    const at = fromText
    setFromAirport(toAirport)
    setFromText(toText)
    setToAirport(a)
    setToText(at)
  }

  async function searchFlights() {
    if (!fromAirport || !toAirport) {
      setError('Select valid From and To airports')
      return
    }
    if (tripType === 'roundTrip' && (!arrDate || arrDate <= depDate)) {
      setError('Return date must be after departure date')
      return
    }
    setLoading(true)
    setError('')
    setFilters({ stops: new Set(), airlines: new Set() })
    try {
      const payload = {
        tripType,
        isInternational: fromAirport.country !== toAirport.country,
        fareClass,
        fromCity: fromAirport.code,
        toCity: toAirport.code,
        depDate,
        noOfAdults: 1,
        noOfChildren: 0,
        noOfInfant: 0,
        limit: 50,
        maxResults: 50,
      }
      if (tripType === 'roundTrip') payload.arrDate = arrDate

      const data = await api('/flights/search', { method: 'POST', body: payload })
      if (!data.ok) throw new Error(data.error || 'Search failed')
      const result = data.result || {}
      if (String(result.status || '').toLowerCase() === 'failed') {
        throw new Error('Provider returned Failed — no fare options')
      }
      const opts = result.options || result.Options || []
      const normalized = opts.map((o, i) => ({
        ...o,
        id: o.id || o.flightId || `${o.airlineCode || 'FL'}-${o.flightNumber || i}-${i}`,
        airlineName: o.airlineName || o.airline || o.carrierName,
        airlineCode: o.airlineCode || o.carrierCode,
        departureTime: o.departureTime || o.depTime || o.sourceTime,
        arrivalTime: o.arrivalTime || o.arrTime || o.destinationTime,
        sourceCityCode: o.sourceCityCode || o.from || fromAirport.code,
        destinationCityCode: o.destinationCityCode || o.to || toAirport.code,
        duration: o.duration || o.totalDuration || '',
        stops: o.stops ?? o.stopCount ?? 0,
        totalFare: o.totalFare ?? o.fare ?? o.price ?? 0,
        __providerOrder: i,
      }))
      setOptions(normalized)
      if (!normalized.length) setError('No flights found for this search')
    } catch (err) {
      setError(err.message)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  function selectFlight(flight) {
    const payload = {
      tripType,
      fromAirport,
      toAirport,
      depDate,
      arrDate: tripType === 'roundTrip' ? arrDate : null,
      fareClass,
      selected: flight,
      policyBreached: policy ? !policy.ok : false,
      totalFare: flight.totalFare,
    }
    setSelected(flight)
    onSelect?.(payload)
  }

  useEffect(() => {
    if (value?.selected) setSelected(value.selected)
  }, [value])

  return (
    <div>
      <div className="booking-widget" style={{ marginTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <div className="trip-type-tabs">
            {[
              ['oneWay', 'One Way'],
              ['roundTrip', 'Round Trip'],
              ['multiCity', 'Multi-city'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={tripType === id ? 'active' : ''}
                onClick={() => id !== 'multiCity' && setTripType(id)}
                disabled={id === 'multiCity'}
                title={id === 'multiCity' ? 'Coming next' : undefined}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="pill">Policy · book {POLICY_DAYS} days ahead</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="search-row">
            <div className="search-cell">
              <div className="label">From</div>
              <input
                value={fromText}
                onChange={(e) => {
                  setFromText(e.target.value)
                  setFromAirport(null)
                  searchAirports(e.target.value, 'from')
                }}
                placeholder="City or airport"
              />
              <div className="hint">
                {fromAirport
                  ? `${fromAirport.code} · ${fromAirport.name || fromAirport.city}`
                  : 'Select airport'}
              </div>
              {fromSuggestions.length > 0 && !fromAirport && (
                <SuggestionList
                  items={fromSuggestions}
                  onPick={(a) => {
                    setFromAirport(a)
                    setFromText(a.city || a.code)
                    setFromSuggestions([])
                  }}
                />
              )}
            </div>

            <div className="search-cell">
              <div className="label">To</div>
              <input
                value={toText}
                onChange={(e) => {
                  setToText(e.target.value)
                  setToAirport(null)
                  searchAirports(e.target.value, 'to')
                }}
                placeholder="City or airport"
              />
              <div className="hint">
                {toAirport
                  ? `${toAirport.code} · ${toAirport.name || toAirport.city}`
                  : 'Select airport'}
              </div>
              {toSuggestions.length > 0 && !toAirport && (
                <SuggestionList
                  items={toSuggestions}
                  onPick={(a) => {
                    setToAirport(a)
                    setToText(a.city || a.code)
                    setToSuggestions([])
                  }}
                />
              )}
            </div>

            <div className="search-cell">
              <div className="label">Departure</div>
              <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} />
              <div className="hint">Travel date</div>
            </div>

            {tripType === 'roundTrip' ? (
              <div className="search-cell">
                <div className="label">Return</div>
                <input type="date" value={arrDate} onChange={(e) => setArrDate(e.target.value)} />
                <div className="hint">Return date</div>
              </div>
            ) : (
              <div className="search-cell">
                <div className="label">Class</div>
                <select value={fareClass} onChange={(e) => setFareClass(e.target.value)}>
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                </select>
                <div className="hint">Cabin</div>
              </div>
            )}

            <button className="btn btn-accent" type="button" onClick={searchFlights} disabled={loading} style={{ height: 64, minWidth: 120 }}>
              {loading ? '…' : 'SEARCH'}
            </button>
          </div>

          <button type="button" className="swap-btn" onClick={swapAirports} title="Swap cities" aria-label="Swap">
            ⇅
          </button>
        </div>

        {tripType === 'roundTrip' && (
          <div className="search-cell" style={{ marginTop: 12, maxWidth: 240 }}>
            <div className="label">Class</div>
            <select value={fareClass} onChange={(e) => setFareClass(e.target.value)}>
              <option>Economy</option>
              <option>Premium Economy</option>
              <option>Business</option>
            </select>
          </div>
        )}

        {policy && (
          <div className={`policy-banner ${policy.ok ? 'ok' : 'breach'}`}>{policy.message}</div>
        )}
        {error && <p style={{ color: 'var(--danger)', marginBottom: 0 }}>{error}</p>}
      </div>

      {options.length > 0 && (
        <div className="flight-results-layout anim-fade-up">
          <aside className="card" style={{ padding: 16, height: 'fit-content' }}>
            <strong style={{ fontFamily: 'var(--display)' }}>Filters</strong>
            <div style={{ marginTop: 14 }}>
              <div className="label" style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', marginBottom: 8 }}>
                STOPS
              </div>
              {[
                ['0', 'Non-stop'],
                ['1', '1 stop'],
                ['2plus', '2+ Stops'],
              ].map(([id, label]) => (
                <label key={id} style={{ display: 'flex', gap: 8, marginBottom: 8, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={filters.stops.has(id)}
                    onChange={(e) => {
                      const next = new Set(filters.stops)
                      e.target.checked ? next.add(id) : next.delete(id)
                      setFilters((f) => ({ ...f, stops: next }))
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', marginBottom: 8 }}>
                AIRLINES
              </div>
              {airlines.map(([name, meta]) => (
                <label key={name} style={{ display: 'flex', gap: 8, marginBottom: 8, fontWeight: 600, alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filters.airlines.has(name)}
                    onChange={(e) => {
                      const next = new Set(filters.airlines)
                      e.target.checked ? next.add(name) : next.delete(name)
                      setFilters((f) => ({ ...f, airlines: next }))
                    }}
                  />
                  <AirlineLogo code={meta.code} name={name} size={22} />
                  {name} ({meta.count})
                </label>
              ))}
            </div>
          </aside>

          <div>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong style={{ fontFamily: 'var(--display)', fontSize: '1.05rem' }}>
                {fromAirport?.code} → {toAirport?.code}
              </strong>
              <span className="pill">
                {visible.length} of {options.length} · INR
              </span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {visible.map((flight) => {
                const isSelected = selected?.id === flight.id
                return (
                  <div key={flight.id} className={`flight-card${isSelected ? ' selected' : ''}`}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <AirlineLogo code={flight.airlineCode} name={flight.airlineName} size={42} />
                      <div>
                        <strong>
                          {flight.airlineName} {flight.flightNumber || flight.airlineCode}
                        </strong>
                        <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
                          {Number(flight.stops || 0) === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}
                          {flight.duration ? ` · ${flight.duration}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{flight.departureTime || '—'}</div>
                        <div style={{ color: 'var(--muted)' }}>{flight.sourceCityCode}</div>
                      </div>
                      <div style={{ color: 'var(--refex-orange)', fontWeight: 700 }}>→</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{flight.arrivalTime || '—'}</div>
                        <div style={{ color: 'var(--muted)' }}>{flight.destinationCityCode}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="fare-amount">{formatMoney(flight.totalFare)}</div>
                      <button
                        type="button"
                        className={`btn ${isSelected ? 'btn-success' : 'btn-accent'}`}
                        style={{ marginTop: 8, animation: isSelected ? 'none' : undefined }}
                        onClick={() => selectFlight(flight)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="sticky-selection">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <AirlineLogo code={selected.airlineCode} name={selected.airlineName} size={36} />
            <div>
              <strong>Selected flight</strong>
              <div style={{ marginTop: 4 }}>
                {selected.airlineName} {selected.flightNumber || ''} · {formatMoney(selected.totalFare)} ·{' '}
                {selected.sourceCityCode} → {selected.destinationCityCode}
                {policy && !policy.ok && (
                  <span className="pill warn" style={{ marginLeft: 8 }}>
                    BREACHED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SuggestionList({ items, onPick }) {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 30,
        top: 'calc(100% + 6px)',
        left: 0,
        right: 0,
        background: 'white',
        border: '1px solid var(--line)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        animation: 'fadeUp 0.2s var(--ease)',
      }}
    >
      {items.map((a) => (
        <button
          key={a.code || a.city}
          type="button"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            border: 0,
            background: 'white',
            padding: '11px 14px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--pastel-sky)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--pastel-sky)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
          }}
          onClick={() => onPick(a)}
        >
          <strong>{a.city || a.code}</strong>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            {[a.code, a.name, a.country].filter(Boolean).join(' · ')}
          </div>
        </button>
      ))}
    </div>
  )
}
