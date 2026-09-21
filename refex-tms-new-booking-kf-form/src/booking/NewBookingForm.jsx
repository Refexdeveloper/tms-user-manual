import { useEffect, useMemo, useState } from 'react'
import { kf } from '../sdk'
import { FIELDS, PURPOSES, MODE_OPTIONS, FARE_CLASSES } from './constants.js'
import { formatMoney, searchAirports, searchFlights, todayIso, DEFAULT_FROM, DEFAULT_TO } from './api.js'
import AirlineLogo from './AirlineLogo.jsx'

function advanceDays(dep) {
  if (!dep) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dep)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / 86400000)
}

function placeDisplay(p) {
  if (!p) return ''
  return p.display || `${p.city || ''}${p.code ? ` (${p.code})` : ''}`.trim()
}

function mapFlight(o) {
  return {
    id: o.id,
    airline: o.airlineName || o.airline || '',
    airlineCode: o.airlineCode || '',
    flightNo: o.flightNumber || o.flightNo || '',
    depart: o.departureTime || o.depart || '',
    arrive: o.arrivalTime || o.arrive || '',
    duration: o.duration || '',
    stops: o.stops ?? 0,
    total: o.totalFare ?? o.fare ?? 0,
    currency: o.currencyCode || 'INR',
    fromCode: o.sourceCityCode || '',
    toCode: o.destinationCityCode || '',
  }
}

function AirportInput({ label, value, onChange }) {
  const [q, setQ] = useState(placeDisplay(value))
  const [opts, setOpts] = useState([])
  useEffect(() => setQ(placeDisplay(value)), [value])
  useEffect(() => {
    let ignore = false
    const t = setTimeout(async () => {
      if (!q || q.length < 2) return setOpts([])
      const list = await searchAirports(q)
      if (!ignore) {
        setOpts(
          (list || []).slice(0, 6).map((o) => ({
            code: o.code || o.iata || '',
            city: o.city || o.name || '',
            name: o.name || o.city || '',
            country: o.country || 'IN',
            display: `${o.city || o.name || ''} (${o.code || o.iata || ''})`,
          }))
        )
      }
    }, 200)
    return () => {
      ignore = true
      clearTimeout(t)
    }
  }, [q])

  return (
    <label className="ap-field">
      <span className="ap-label">{label}</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="City or airport"
        autoComplete="off"
      />
      {value?.code ? (
        <em className="ap-sub">
          {value.code} · {value.name}
        </em>
      ) : null}
      {opts.length > 0 && (
        <ul className="ap-suggest">
          {opts.map((o) => (
            <li key={o.code}>
              <button
                type="button"
                onClick={() => {
                  onChange(o)
                  setQ(o.display)
                  setOpts([])
                }}
              >
                <strong>{o.city}</strong>
                <small>
                  {o.code} · {o.name}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  )
}

export default function NewBookingForm() {
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('Air')
  const [purpose, setPurpose] = useState('Business trip')
  const [region, setRegion] = useState('Domestic')
  const [tripType, setTripType] = useState('oneWay')
  const [fareClass, setFareClass] = useState('Economy')
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [depDate, setDepDate] = useState(todayIso())
  const [retDate, setRetDate] = useState('')
  const [hotel, setHotel] = useState(false)
  const [cab, setCab] = useState(false)
  const [hotelCity, setHotelCity] = useState('')
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [comments, setComments] = useState('')
  const [flights, setFlights] = useState([])
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(0)
  const [searching, setSearching] = useState(false)
  const [stopFilter, setStopFilter] = useState('all')
  const [airlineFilter, setAirlineFilter] = useState('all')
  const [errors, setErrors] = useState([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const PAGE = 8
  const lead = advanceDays(depDate)
  const breached = lead != null && lead < 15

  useEffect(() => {
    try {
      kf.context.watchParams(() => {})
    } catch {
      /* local preview */
    }
    kf.user
      ?.getUser?.()
      .then(setUser)
      .catch(() => {})
  }, [])

  const airlines = useMemo(() => {
    const map = {}
    flights.forEach((f) => {
      const k = f.airline || 'Other'
      map[k] = (map[k] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [flights])

  const filtered = useMemo(() => {
    return flights.filter((f) => {
      if (stopFilter === '0' && f.stops !== 0) return false
      if (stopFilter === '1' && !(f.stops >= 1)) return false
      if (airlineFilter !== 'all' && f.airline !== airlineFilter) return false
      return true
    })
  }, [flights, stopFilter, airlineFilter])

  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))

  useEffect(() => setPage(0), [stopFilter, airlineFilter])

  const payload = useMemo(() => {
    const f = selected || {}
    const amount = Number(f.total || 0)
    const modeLabel = mode === 'Air' ? 'Flight' : mode === 'Hotel' ? 'Hotel' : mode
    const travelMode = mode === 'Air' ? 'Air' : mode
    return {
      [FIELDS.purpose]: purpose,
      [FIELDS.purposeAlt]: purpose,
      [FIELDS.region]: region,
      [FIELDS.mode]: modeLabel,
      [FIELDS.modeAlt]: travelMode,
      [FIELDS.trip]: tripType,
      [FIELDS.tripAlt]: tripType,
      [FIELDS.dep]: depDate,
      [FIELDS.depAlt]: depDate,
      [FIELDS.ret]: retDate,
      [FIELDS.from]: from?.city || '',
      [FIELDS.to]: to?.city || '',
      [FIELDS.fromAlt]: from?.city || '',
      [FIELDS.toAlt]: to?.city || '',
      [FIELDS.boarding]: from?.city || '',
      [FIELDS.dest]: to?.city || '',
      [FIELDS.amount]: amount || undefined,
      [FIELDS.amountAlt]: amount || undefined,
      [FIELDS.hotel]: hotel || mode === 'Hotel' ? 'Yes' : 'No',
      [FIELDS.comments]: comments,
      [FIELDS.city]: hotelCity || (mode === 'Hotel' ? to?.city : ''),
      [FIELDS.checkin]: checkin,
      [FIELDS.checkout]: checkout,
      [FIELDS.pickup]: pickup,
      [FIELDS.drop]: drop,
      [FIELDS.requesterEmail]: user?.Email || '',
      [FIELDS.empEmail]: user?.Email || '',
      [FIELDS.employeeDetails]: user?.Name || '',
      FS_Airline_Name: f.airline || '',
      FS_Airline_Code: f.airlineCode || '',
      FS_Flight_Number: f.flightNo || '',
      FS_Selected_Flight_ID: f.id || '',
      FS_Is_International: region === 'International' ? 'Yes' : 'No',
      FS_Booking_Amount: amount || undefined,
      FS_Currency_Code: f.currency || 'INR',
      FS_Total_Fare: amount || undefined,
      FS_From_Code: from?.code || '',
      FS_From_City: from?.city || '',
      FS_From_Airport_Name: from?.name || '',
      FS_To_Code: to?.code || '',
      FS_To_City: to?.city || '',
      FS_To_Airport_Name: to?.name || '',
      FS_Trip_Type: tripType,
      FS_Departure_Date: depDate,
      FS_Departure_Time: f.depart || '',
      FS_Arrival_Time: f.arrive || '',
      FS_Duration: f.duration || '',
      FS_Stops: f.stops ?? '',
      FS_Policy_Status: breached ? 'BREACHED' : 'Within policy',
      FS_Policy_Insight_Message: breached
        ? `This booking breaches the 15-day advance booking policy by ${Math.max(0, 15 - lead)} days.`
        : 'Within 15-day advance booking policy.',
    }
  }, [
    purpose,
    region,
    mode,
    tripType,
    depDate,
    retDate,
    from,
    to,
    selected,
    hotel,
    comments,
    hotelCity,
    checkin,
    checkout,
    pickup,
    drop,
    user,
    breached,
    lead,
  ])

  function validate() {
    const next = []
    if (!purpose) next.push('Travel Purpose is required.')
    if (mode === 'Air') {
      if (!from?.code) next.push('Choose From airport.')
      if (!to?.code) next.push('Choose To airport.')
      if (!depDate) next.push('Departure date is required.')
      if (tripType === 'roundTrip' && !retDate) next.push('Return date is required.')
      if (!selected) next.push('Select a flight before submit.')
    }
    if (mode === 'Hotel' || hotel) {
      if (!(hotelCity || to?.city)) next.push('Hotel city is required.')
      if (!checkin) next.push('Check-in date is required.')
      if (!checkout) next.push('Check-out date is required.')
    }
    if (mode === 'Cab' || cab) {
      if (!pickup) next.push('Pickup location is required.')
      if (!drop) next.push('Drop location is required.')
    }
    if ((mode === 'Train' || mode === 'Bus') && (!from?.city || !to?.city || !depDate)) {
      next.push('From, To and date are required.')
    }
    return next
  }

  async function search() {
    const next = []
    if (!from?.code) next.push('Choose From airport.')
    if (!to?.code) next.push('Choose To airport.')
    if (!depDate) next.push('Departure date is required.')
    if (tripType === 'roundTrip' && !retDate) next.push('Return date is required.')
    setErrors(next)
    if (next.length) return
    setSearching(true)
    setStatus('')
    try {
      const res = await searchFlights({
        tripType,
        from,
        to,
        depDate,
        arrDate: tripType === 'roundTrip' ? retDate : '',
        fareClass,
        domesticInternational: region,
      })
      const list = (res.options || []).map(mapFlight)
      setFlights(list)
      setSelected(null)
      setStopFilter('all')
      setAirlineFilter('all')
      setPage(0)
      setStatus(list.length ? `${list.length} flights` : 'No flights found')
    } catch (err) {
      setErrors([err.message || 'Flight search failed'])
    } finally {
      setSearching(false)
    }
  }

  function swap() {
    setFrom(to)
    setTo(from)
  }

  async function saveToKissflow() {
    const next = validate()
    setErrors(next)
    if (next.length) return
    setBusy(true)
    setStatus('')
    try {
      const clean = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      )
      await kf.context.updateField(clean)
      if (kf.context.submit) await kf.context.submit()
      else if (kf.context.save) await kf.context.save()
      setStatus('Saved to Travel_Management_A02. Click Kissflow Submit if still open.')
    } catch (err) {
      setStatus(err.message || 'Could not write Kissflow fields')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tb">
      <header className="tb-hero">
        <div>
          <p className="tb-kicker">
            <i className="ri-plane-line" /> Travel Booking
          </p>
          <h1>Book your trip</h1>
          <p className="tb-sub">Writes to Kissflow Travel Request · Travel_Management_A02</p>
        </div>
        {user?.Name && (
          <div className="tb-user">
            <span>{String(user.Name).split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{user.Name}</strong>
              <small>{user.Email}</small>
            </div>
          </div>
        )}
      </header>

      {/* Tiny mode icons — Ixigo style */}
      <nav className="tb-modes">
        {MODE_OPTIONS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={mode === m.id ? 'on' : ''}
            style={{ '--accent': m.accent }}
            onClick={() => setMode(m.id)}
          >
            <i className={m.icon} />
            <span>{m.label}</span>
          </button>
        ))}
      </nav>

      <section className="tb-card tb-meta">
        <label>
          <span>Purpose *</span>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {PURPOSES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Domestic / International *</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option>Domestic</option>
            <option>International</option>
          </select>
        </label>
        {mode === 'Air' && (
          <label>
            <span>Class</span>
            <select value={fareClass} onChange={(e) => setFareClass(e.target.value)}>
              {FARE_CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
      </section>

      {/* MMT-style search widget */}
      {(mode === 'Air' || mode === 'Train' || mode === 'Bus') && (
        <section className="tb-card tb-search">
          {mode === 'Air' && (
            <div className="tb-trip">
              {[
                ['oneWay', 'One Way'],
                ['roundTrip', 'Round Trip'],
              ].map(([id, label]) => (
                <button key={id} type="button" className={tripType === id ? 'on' : ''} onClick={() => setTripType(id)}>
                  {label}
                </button>
              ))}
              <span className="tb-policy">
                <i className="ri-shield-check-line" /> Policy: book 15 days before departure
              </span>
            </div>
          )}

          <div className="tb-route">
            <AirportInput label="FROM" value={from} onChange={setFrom} />
            <button type="button" className="tb-swap" onClick={swap} aria-label="Swap">
              <i className="ri-arrow-left-right-line" />
            </button>
            <AirportInput label="TO" value={to} onChange={setTo} />
            <label className="ap-field">
              <span className="ap-label">DEPARTURE</span>
              <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} />
            </label>
            {mode === 'Air' && tripType === 'roundTrip' && (
              <label className="ap-field">
                <span className="ap-label">RETURN</span>
                <input type="date" value={retDate} onChange={(e) => setRetDate(e.target.value)} />
              </label>
            )}
            {mode === 'Air' ? (
              <button type="button" className="tb-search-btn" onClick={search} disabled={searching}>
                {searching ? 'Searching…' : 'SEARCH'}
              </button>
            ) : null}
          </div>

          {mode === 'Air' && breached && lead != null && (
            <p className="tb-warn">
              This booking breaches the 15-day advance booking policy by {Math.max(0, 15 - lead)} days. Fare impact
              tracking should be initiated for Finance/Admin review.
            </p>
          )}

          {mode === 'Air' && (
            <div className="tb-addons">
              <label className="chip">
                <input type="checkbox" checked={hotel} onChange={(e) => setHotel(e.target.checked)} />
                <i className="ri-hotel-bed-line" /> + Hotel
              </label>
              <label className="chip">
                <input type="checkbox" checked={cab} onChange={(e) => setCab(e.target.checked)} />
                <i className="ri-taxi-line" /> + Cab
              </label>
            </div>
          )}
        </section>
      )}

      {mode === 'Air' && (
        <section className="tb-results">
          <aside className="tb-filters">
            <h3>Filters</h3>
            <div>
              <strong>Stops</strong>
              {[
                ['all', 'All'],
                ['0', 'Non-stop'],
                ['1', '1+ stop'],
              ].map(([id, label]) => (
                <label key={id}>
                  <input type="radio" checked={stopFilter === id} onChange={() => setStopFilter(id)} /> {label}
                </label>
              ))}
            </div>
            <div>
              <strong>Airlines</strong>
              <label>
                <input type="radio" checked={airlineFilter === 'all'} onChange={() => setAirlineFilter('all')} /> All
              </label>
              {airlines.slice(0, 8).map(([name, count]) => (
                <label key={name}>
                  <input
                    type="radio"
                    checked={airlineFilter === name}
                    onChange={() => setAirlineFilter(name)}
                  />{' '}
                  {name} ({count})
                </label>
              ))}
              {!airlines.length && <em>Search to load filters</em>}
            </div>
          </aside>

          <div className="tb-list">
            <div className="tb-list-meta">
              <span>
                {from?.code || '—'} → {to?.code || '—'} · {filtered.length} options · INR
              </span>
              {filtered.length > 0 && (
                <span>
                  Showing {page * PAGE + 1}–{Math.min(filtered.length, (page + 1) * PAGE)} · Page {page + 1}/{pages}
                </span>
              )}
            </div>

            {!flights.length && !searching && (
              <div className="tb-empty">
                <i className="ri-flight-takeoff-line" />
                <p>Search flights to view available options</p>
              </div>
            )}

            <ul className="tb-flights">
              {pageItems.map((f) => (
                <li key={f.id}>
                  <article className={selected?.id === f.id ? 'tb-flight on' : 'tb-flight'}>
                    <div className="tb-air">
                      <AirlineLogo code={f.airlineCode} name={f.airline} size={36} />
                      <div>
                        <strong>
                          {f.airline} {f.flightNo}
                        </strong>
                        <button type="button" className="tb-link" onClick={() => setSelected(f)}>
                          View details
                        </button>
                      </div>
                    </div>
                    <div className="tb-path">
                      <div>
                        <b>{f.depart}</b>
                        <small>{from?.code}</small>
                      </div>
                      <div className="tb-mid">
                        <span>{f.duration}</span>
                        <i />
                        <span>{f.stops === 0 ? 'Non-stop' : `${f.stops} stop`}</span>
                      </div>
                      <div>
                        <b>{f.arrive}</b>
                        <small>{to?.code}</small>
                      </div>
                    </div>
                    <div className="tb-fare">
                      <b>{formatMoney(f.total, f.currency)}</b>
                      <button type="button" className="tb-select" onClick={() => setSelected(f)}>
                        SELECT
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            {filtered.length > PAGE && (
              <div className="tb-pager">
                <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button type="button" className="primary" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}

            {selected && (
              <div className="tb-picked">
                <AirlineLogo code={selected.airlineCode} name={selected.airline} size={28} />
                <div>
                  <strong>
                    {selected.airline} {selected.flightNo} · {formatMoney(selected.total)}
                  </strong>
                  <small>
                    {from?.code} {selected.depart} → {to?.code} {selected.arrive} ·{' '}
                    {selected.stops === 0 ? 'Non-stop' : `${selected.stops} stop`}
                  </small>
                </div>
                {breached && <em className="tb-badge">BREACHED</em>}
              </div>
            )}
          </div>
        </section>
      )}

      {(hotel || mode === 'Hotel') && (
        <section className="tb-card">
          <h2>
            <i className="ri-hotel-bed-line" /> Hotel
          </h2>
          <div className="tb-meta">
            <label>
              <span>City *</span>
              <input value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} placeholder="City" />
            </label>
            <label>
              <span>Check-in *</span>
              <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
            </label>
            <label>
              <span>Check-out *</span>
              <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
            </label>
          </div>
        </section>
      )}

      {(cab || mode === 'Cab') && (
        <section className="tb-card">
          <h2>
            <i className="ri-taxi-line" /> Cab
          </h2>
          <div className="tb-meta">
            <label>
              <span>Pickup *</span>
              <input value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </label>
            <label>
              <span>Drop *</span>
              <input value={drop} onChange={(e) => setDrop(e.target.value)} />
            </label>
          </div>
        </section>
      )}

      <section className="tb-card">
        <label className="full">
          <span>Comments</span>
          <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Optional notes for approvers" />
        </label>
      </section>

      {errors.length > 0 && (
        <ul className="tb-errors">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {status && <p className="tb-status">{status}</p>}

      <footer className="tb-actions">
        <button type="button" className="ghost" disabled={busy} onClick={() => setErrors([])}>
          Discard
        </button>
        <button type="button" className="primary" disabled={busy} onClick={saveToKissflow}>
          {busy ? 'Saving…' : 'Save to Kissflow & continue'}
        </button>
      </footer>
    </div>
  )
}
