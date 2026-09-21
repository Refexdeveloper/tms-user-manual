import { useEffect, useMemo, useState } from 'react'
import { kf } from '../sdk'
import { FIELDS, PURPOSES, MODE_OPTIONS, TIMES, LINES, ENTITIES } from './constants.js'
import { formatMoney, searchAirports, searchFlights, todayIso, DEFAULT_FROM, DEFAULT_TO } from './api.js'

function initials(name) {
  return String(name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function daysBetween(from, to) {
  if (!from || !to) return ''
  const a = new Date(from)
  const b = new Date(to)
  const n = Math.round((b - a) / 86400000)
  return Number.isFinite(n) && n >= 0 ? String(n) : ''
}

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

function YesNo({ label, value, onChange }) {
  return (
    <div className="yn">
      <span>{label}</span>
      <div className="yn-btns">
        {['Yes', 'No'].map((opt) => (
          <button key={opt} type="button" className={value === opt ? 'on' : ''} onClick={() => onChange(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function PlaceField({ label, value, onChange, required }) {
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
    }, 220)
    return () => {
      ignore = true
      clearTimeout(t)
    }
  }, [q])
  return (
    <label className="field">
      <span>
        {label}
        {required ? ' *' : ''}
      </span>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="City or airport" />
      {value?.code ? (
        <em className="sub">
          {value.code} · {value.name}
        </em>
      ) : null}
      {opts.length > 0 && (
        <ul className="suggest">
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
  const [purpose, setPurpose] = useState('Business trip')
  const [multi, setMulti] = useState('No')
  const [mode, setMode] = useState('Air')
  const [eligible] = useState('Economy')
  const [tripType, setTripType] = useState('oneWay')
  const [region, setRegion] = useState('Domestic')
  const [visa, setVisa] = useState('No')
  const [exception, setException] = useState('No')
  const [venwind, setVenwind] = useState('No')
  const [cab, setCab] = useState('No')
  const [hotel, setHotel] = useState('No')
  const [group, setGroup] = useState('No')
  const [desk, setDesk] = useState('Yes')
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [depDate, setDepDate] = useState(todayIso())
  const [retDate, setRetDate] = useState('')
  const [prefDep, setPrefDep] = useState('Morning')
  const [prefRet, setPrefRet] = useState('Evening')
  const [modifyId, setModifyId] = useState('')
  const [requestId] = useState('Auto on submit')
  const [comments, setComments] = useState('')
  const [line, setLine] = useState('')
  const [entity, setEntity] = useState('')
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [dropTime, setDropTime] = useState('')
  const [hotelCity, setHotelCity] = useState('')
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [legs, setLegs] = useState([
    { travelDate: '', toDate: '', from: '', to: '', preferred: 'Morning' },
    { travelDate: '', toDate: '', from: '', to: '', preferred: 'Morning' },
  ])
  const [flights, setFlights] = useState([])
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(0)
  const [searching, setSearching] = useState(false)
  const [errors, setErrors] = useState([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [stopFilter, setStopFilter] = useState('all')
  const [airlineFilter, setAirlineFilter] = useState('all')

  const PAGE = 8
  const lead = advanceDays(depDate)
  const breached = lead != null && lead < 15
  const travelDays = daysBetween(depDate, tripType === 'roundTrip' && retDate ? retDate : depDate)

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
      if (stopFilter === '1' && f.stops < 1) return false
      if (airlineFilter !== 'all' && f.airline !== airlineFilter) return false
      return true
    })
  }, [flights, stopFilter, airlineFilter])

  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))

  useEffect(() => {
    kf.context.watchParams(() => {})
    kf.user.getUser().then(setUser).catch(() => {})
  }, [])

  useEffect(() => {
    setPage(0)
  }, [stopFilter, airlineFilter])

  const payload = useMemo(() => {
    const f = selected || {}
    const amount = Number(f.total || 0)
    const modeLabel = mode === 'Air' ? 'Flight' : mode
    return {
      [FIELDS.purpose]: purpose,
      [FIELDS.purposeAlt]: purpose,
      [FIELDS.region]: region,
      [FIELDS.mode]: modeLabel,
      [FIELDS.modeAlt]: mode,
      [FIELDS.trip]: tripType,
      [FIELDS.tripAlt]: tripType,
      [FIELDS.dep]: depDate,
      [FIELDS.depAlt]: depDate,
      [FIELDS.ret]: retDate,
      [FIELDS.from]: from?.city || '',
      [FIELDS.to]: to?.city || '',
      [FIELDS.fromAlt]: from?.city || '',
      [FIELDS.toAlt]: to?.city || '',
      [FIELDS.amount]: amount,
      [FIELDS.amountAlt]: amount,
      [FIELDS.visa]: visa,
      [FIELDS.hotel]: hotel,
      [FIELDS.exception]: exception === 'Yes' ? 'Yes' : '',
      [FIELDS.multi]: multi,
      [FIELDS.modify]: modifyId,
      [FIELDS.comments]: comments,
      [FIELDS.boarding]: from?.city || '',
      [FIELDS.dest]: to?.city || '',
      [FIELDS.pickup]: pickup,
      [FIELDS.drop]: drop,
      [FIELDS.pickupTime]: pickupTime,
      [FIELDS.dropTime]: dropTime,
      [FIELDS.city]: hotelCity,
      [FIELDS.checkin]: checkin,
      [FIELDS.checkout]: checkout,
      [FIELDS.requesterEmail]: user?.Email || '',
      [FIELDS.empEmail]: user?.Email || '',
      [FIELDS.employeeDetails]: user?.Name || '',
      FS_Airline_Name: f.airline || '',
      FS_Airline_Code: f.airlineCode || '',
      FS_Flight_Number: f.flightNo || '',
      FS_Selected_Flight_ID: f.id || '',
      FS_Is_International: region === 'International' ? 'Yes' : 'No',
      FS_Booking_Amount: amount,
      FS_Currency_Code: f.currency || 'INR',
      FS_Total_Fare: amount,
      FS_From_Code: from?.code || f.fromCode || '',
      FS_From_City: from?.city || '',
      FS_From_Airport_Name: from?.name || '',
      FS_To_Code: to?.code || f.toCode || '',
      FS_To_City: to?.city || '',
      FS_To_Airport_Name: to?.name || '',
      FS_Trip_Type: tripType,
      FS_Departure_Date: depDate,
      FS_Departure_Time: f.depart || '',
      FS_Arrival_Time: f.arrive || '',
      FS_Duration: f.duration || '',
      FS_Stops: f.stops ?? '',
      FS_Policy_Status: breached ? 'BREACHED' : 'Within policy',
      FS_Policy_Actual_Advance: lead != null ? String(lead) : '',
      FS_Policy_Required_Amount: '15',
      FS_Policy_Insight_Message: breached
        ? `This booking breaches the 15-day advance booking policy by ${Math.max(0, 15 - lead)} days. Fare impact tracking should be initiated for Finance/Admin review.`
        : 'Within 15-day advance booking policy.',
      Eligible_Mode: eligible,
      Preferred_Departure_Time: prefDep,
      Preferred_Return_Time: prefRet,
      Number_of_Travel_days: travelDays,
      Do_you_require_a_cab_arrangement: cab,
      Group_Travel: group,
      Travel_booking_required_by_Travel_Desk: desk,
      This_is_Venwind_Travel_Request_form: venwind,
      Business_Line: line,
      Entity: entity,
      MC_Route_Summary:
        multi === 'Yes'
          ? legs
              .filter((l) => l.from || l.to)
              .map((l) => `${l.from || '?'}→${l.to || '?'} (${l.travelDate || ''})`)
              .join(' | ')
          : '',
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
    visa,
    hotel,
    exception,
    multi,
    modifyId,
    comments,
    cab,
    group,
    desk,
    venwind,
    eligible,
    prefDep,
    prefRet,
    travelDays,
    breached,
    lead,
    line,
    entity,
    pickup,
    drop,
    pickupTime,
    dropTime,
    hotelCity,
    checkin,
    checkout,
    user,
    legs,
  ])

  function validate() {
    const next = []
    if (!purpose) next.push('Travel Purpose is required.')
    if (!mode) next.push('Travel Mode is required.')
    if (!multi) next.push('Multiple cities is required.')
    if (multi === 'No') {
      if (!from?.city) next.push('Boarding (From) is required.')
      if (!to?.city) next.push('Destination (To) is required.')
      if (!depDate) next.push('Departure Date is required.')
      if (tripType === 'roundTrip' && !retDate) next.push('Return Date is required for round trip.')
      if (tripType === 'roundTrip' && retDate && depDate && retDate < depDate) {
        next.push('Return Date cannot be before Departure Date.')
      }
      if (!prefDep) next.push('Preferred Departure Time is required.')
      if (tripType === 'roundTrip' && !prefRet) next.push('Preferred Return Time is required.')
    } else {
      const filled = legs.filter((l) => l.travelDate || l.from || l.to)
      if (!filled.length) next.push('Add at least one multi-city leg.')
      filled.forEach((l, i) => {
        if (!l.travelDate) next.push(`Leg ${i + 1}: Travel Date is required.`)
        if (!l.toDate) next.push(`Leg ${i + 1}: To Date is required.`)
        if (!l.from) next.push(`Leg ${i + 1}: Boarding (From) is required.`)
        if (!l.to) next.push(`Leg ${i + 1}: Destination (To) is required.`)
      })
    }
    if (mode === 'Air' && desk === 'No' && !selected) next.push('Select a flight, or set Travel Desk booking to Yes.')
    if (region === 'International' && visa === 'Yes' && !comments) next.push('Add a comment when a visa is required.')
    if (cab === 'Yes') {
      if (!pickup) next.push('Pickup Location is required for cab.')
      if (!drop) next.push('Drop Location is required for cab.')
      if (!pickupTime) next.push('Pickup Time is required for cab.')
    }
    if (hotel === 'Yes') {
      if (!hotelCity) next.push('Hotel city is required.')
      if (!checkin) next.push('Check-in date is required.')
      if (!checkout) next.push('Check-out date is required.')
      if (checkin && checkout && checkout < checkin) next.push('Check-out cannot be before check-in.')
    }
    return next
  }

  async function search() {
    const next = []
    if (!from?.code) next.push('Choose a boarding airport.')
    if (!to?.code) next.push('Choose a destination airport.')
    if (!depDate) next.push('Departure Date is required.')
    if (tripType === 'roundTrip' && !retDate) next.push('Return Date is required.')
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
        fareClass: eligible,
        domesticInternational: region,
      })
      const list = (res.options || []).map(mapFlight)
      setFlights(list)
      setPage(0)
      setSelected(null)
      setStopFilter('all')
      setAirlineFilter('all')
      setStatus(list.length ? `${list.length} flights found` : 'No flights for these dates.')
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

  function updateLeg(i, key, value) {
    setLegs((prev) => prev.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)))
  }

  async function save(submit) {
    const next = validate()
    setErrors(next)
    if (next.length) return
    setBusy(true)
    setStatus('')
    try {
      await kf.context.updateField(payload)
      if (submit && kf.context.submit) await kf.context.submit()
      else if (submit && kf.context.save) await kf.context.save()
      setStatus(submit ? 'Saved to Kissflow. Click Submit on the form if still open.' : 'Draft saved to Kissflow fields.')
    } catch (err) {
      setStatus(err.message || 'Could not write Kissflow fields')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="book">
      <header className="who">
        <span className="avatar">{initials(user?.Name)}</span>
        <div>
          <strong>{user?.Name || 'Traveller'}</strong>
          <small>{user?.Email || 'Requester auto-filled from Kissflow user'}</small>
        </div>
      </header>

      <section className="card">
        <h2>Travel Request Form</h2>
        <div className="grid4">
          <label className="field">
            <span>Travel Request ID</span>
            <input value={requestId} readOnly />
          </label>
          <label className="field span2">
            <span>Select the request which you want to modify</span>
            <input value={modifyId} onChange={(e) => setModifyId(e.target.value)} placeholder="Search request ID" />
          </label>
        </div>
        <div className="grid4">
          <label className="field">
            <span>Travel Purpose *</span>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {PURPOSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Travelling to multiple cities? *</span>
            <select value={multi} onChange={(e) => setMulti(e.target.value)}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </label>
          <label className="field">
            <span>Travel Mode *</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {MODE_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Eligible Mode</span>
            <input value={eligible} readOnly />
          </label>
        </div>

        <div className="mode-tiny">
          {MODE_OPTIONS.map((m) => (
            <button key={m.id} type="button" className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>
              <i className={m.icon} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="grid3">
          <fieldset className="radios">
            <legend>Trip Type *</legend>
            {[
              ['oneWay', 'One way'],
              ['roundTrip', 'Round trip'],
              ['multiCity', 'Multi city'],
            ].map(([id, label]) => (
              <label key={id}>
                <input type="radio" name="trip" checked={tripType === id} onChange={() => setTripType(id)} /> {label}
              </label>
            ))}
          </fieldset>
          <fieldset className="radios">
            <legend>Domestic / International *</legend>
            {['Domestic', 'International'].map((id) => (
              <label key={id}>
                <input type="radio" name="region" checked={region === id} onChange={() => setRegion(id)} /> {id}
              </label>
            ))}
          </fieldset>
          <div className="stack">
            <YesNo label="Do you require visa?" value={visa} onChange={setVisa} />
            <YesNo label="Exceptional Case" value={exception} onChange={setException} />
            <YesNo label="Venwind Travel Request" value={venwind} onChange={setVenwind} />
          </div>
        </div>
      </section>

      {multi === 'No' && (
        <section className="card">
          <h2>Route</h2>
          <div className="grid3">
            <PlaceField label="Boarding (From)" value={from} onChange={setFrom} required />
            <PlaceField label="Destination (To)" value={to} onChange={setTo} required />
            <label className="field">
              <span>City Class</span>
              <input value={region === 'International' ? 'International' : 'Metro'} readOnly />
            </label>
          </div>
          <div className="grid4">
            <label className="field">
              <span>Departure Date *</span>
              <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} />
            </label>
            <label className="field">
              <span>Return Date{tripType === 'roundTrip' ? ' *' : ''}</span>
              <input type="date" value={retDate} onChange={(e) => setRetDate(e.target.value)} />
            </label>
            <label className="field">
              <span>Number of travel days</span>
              <input value={travelDays || '—'} readOnly />
            </label>
            <label className="field">
              <span>Boarding From</span>
              <input value={from?.city || ''} readOnly />
            </label>
          </div>
          <div className="grid3">
            <label className="field">
              <span>Preferred Departure Time *</span>
              <select value={prefDep} onChange={(e) => setPrefDep(e.target.value)}>
                {TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Preferred Return Time{tripType === 'roundTrip' ? ' *' : ''}</span>
              <select value={prefRet} onChange={(e) => setPrefRet(e.target.value)}>
                {TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>After work time</span>
              <input value={prefDep === 'Evening' || prefDep === 'Night' ? 'Yes' : 'No'} readOnly />
            </label>
          </div>
          <div className="yn-row">
            <YesNo label="Cab arrangement?" value={cab} onChange={setCab} />
            <YesNo label="Accommodation?" value={hotel} onChange={setHotel} />
            <YesNo label="Group travel?" value={group} onChange={setGroup} />
            <YesNo label="Travel Desk booking?" value={desk} onChange={setDesk} />
          </div>
        </section>
      )}

      {multi === 'Yes' && (
        <section className="card">
          <h2>Multiple Cities Travel Details — {region}</h2>
          <div className="table-wrap">
            <table className="legs">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Travel Date *</th>
                  <th>To Date *</th>
                  <th>Boarding (From) *</th>
                  <th>Destination (To) *</th>
                  <th>Preferred time</th>
                </tr>
              </thead>
              <tbody>
                {legs.map((l, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <input type="date" value={l.travelDate} onChange={(e) => updateLeg(i, 'travelDate', e.target.value)} />
                    </td>
                    <td>
                      <input type="date" value={l.toDate} onChange={(e) => updateLeg(i, 'toDate', e.target.value)} />
                    </td>
                    <td>
                      <input value={l.from} onChange={(e) => updateLeg(i, 'from', e.target.value)} placeholder="From" />
                    </td>
                    <td>
                      <input value={l.to} onChange={(e) => updateLeg(i, 'to', e.target.value)} placeholder="To" />
                    </td>
                    <td>
                      <select value={l.preferred} onChange={(e) => updateLeg(i, 'preferred', e.target.value)}>
                        {TIMES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => setLegs((p) => [...p, { travelDate: '', toDate: '', from: '', to: '', preferred: 'Morning' }])}
          >
            Add leg
          </button>
        </section>
      )}

      {cab === 'Yes' && (
        <section className="card">
          <h2>Cab arrangement</h2>
          <div className="grid3">
            <label className="field">
              <span>Pickup Location *</span>
              <input value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </label>
            <label className="field">
              <span>Drop Location *</span>
              <input value={drop} onChange={(e) => setDrop(e.target.value)} />
            </label>
            <label className="field">
              <span>Pickup Time *</span>
              <input type="datetime-local" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
            </label>
            <label className="field">
              <span>Drop Time</span>
              <input type="datetime-local" value={dropTime} onChange={(e) => setDropTime(e.target.value)} />
            </label>
          </div>
        </section>
      )}

      {hotel === 'Yes' && (
        <section className="card">
          <h2>Accommodation</h2>
          <div className="grid3">
            <label className="field">
              <span>City *</span>
              <input value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} />
            </label>
            <label className="field">
              <span>Check-in *</span>
              <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
            </label>
            <label className="field">
              <span>Check-out *</span>
              <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
            </label>
          </div>
        </section>
      )}

      {mode === 'Air' && multi === 'No' && (
        <section className="card search">
          <div className="search-head">
            <h2>
              <i className="ri-flight-takeoff-line" /> Search Flights
            </h2>
            <span className="policy">Policy: book flights 15 days before departure</span>
          </div>
          <div className="trip-toggle">
            <button type="button" className={tripType === 'oneWay' ? 'on' : ''} onClick={() => setTripType('oneWay')}>
              One Way
            </button>
            <button type="button" className={tripType === 'roundTrip' ? 'on' : ''} onClick={() => setTripType('roundTrip')}>
              Round Trip
            </button>
          </div>
          <div className="route-row">
            <div className="airport">
              <small>FROM</small>
              <strong>{from?.city || 'From'}</strong>
              <em>
                {from?.code} · {from?.name}
              </em>
            </div>
            <button type="button" className="swap" onClick={swap} aria-label="Swap">
              <i className="ri-arrow-left-right-line" />
            </button>
            <div className="airport">
              <small>TO</small>
              <strong>{to?.city || 'To'}</strong>
              <em>
                {to?.code} · {to?.name}
              </em>
            </div>
            <label className="airport">
              <small>DEPARTURE</small>
              <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} />
            </label>
            {tripType === 'roundTrip' && (
              <label className="airport">
                <small>RETURN</small>
                <input type="date" value={retDate} onChange={(e) => setRetDate(e.target.value)} />
              </label>
            )}
            <button type="button" className="btn primary" onClick={search} disabled={searching}>
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
          {breached && lead != null && (
            <p className="warn">
              This booking breaches the 15-day advance booking policy by {Math.max(0, 15 - lead)} days. Fare impact
              tracking should be initiated for Finance/Admin review.
            </p>
          )}

          <div className="search-body">
            <aside className="filters">
              <h3>Filters</h3>
              <div>
                <strong>Stops</strong>
                <label>
                  <input type="radio" checked={stopFilter === 'all'} onChange={() => setStopFilter('all')} /> All
                </label>
                <label>
                  <input type="radio" checked={stopFilter === '0'} onChange={() => setStopFilter('0')} /> Non-stop
                </label>
                <label>
                  <input type="radio" checked={stopFilter === '1'} onChange={() => setStopFilter('1')} /> 1+ stop
                </label>
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
                {!airlines.length && <em>Search flights to load filters.</em>}
              </div>
            </aside>

            <div className="results">
              <div className="results-meta">
                <span>
                  {from?.code || '—'} → {to?.code || '—'} · {filtered.length} options · INR
                </span>
                {filtered.length > 0 && (
                  <span>
                    Showing {page * PAGE + 1}-{Math.min(filtered.length, (page + 1) * PAGE)} of {filtered.length} · Page{' '}
                    {page + 1} of {pages}
                  </span>
                )}
              </div>

              {!flights.length && !searching && <p className="empty">Search flights to view available options.</p>}

              <ul className="flights">
                {pageItems.map((f) => (
                  <li key={f.id}>
                    <div className={selected?.id === f.id ? 'flight on' : 'flight'}>
                      <div className="f-air">
                        <span className="logo">{(f.airlineCode || f.airline || '?').slice(0, 2)}</span>
                        <div>
                          <strong>
                            {f.airline} {f.flightNo}
                          </strong>
                          <button type="button" className="link" onClick={() => setSelected(f)}>
                            View Flight Details
                          </button>
                        </div>
                      </div>
                      <div className="f-path">
                        <div>
                          <b>{f.depart}</b>
                          <small>{from?.code}</small>
                        </div>
                        <div className="mid">
                          <span>{f.duration}</span>
                          <i />
                          <span>{f.stops === 0 ? 'Non-stop' : `${f.stops} stop`}</span>
                        </div>
                        <div>
                          <b>{f.arrive}</b>
                          <small>{to?.code}</small>
                        </div>
                      </div>
                      <div className="f-fare">
                        <b>{formatMoney(f.total, f.currency)}</b>
                        <button type="button" className="btn select" onClick={() => setSelected(f)}>
                          Select
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {filtered.length > PAGE && (
                <div className="pager">
                  <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </button>
                  <span>
                    Page {page + 1} of {pages}
                  </span>
                  <button type="button" className="btn primary" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </button>
                </div>
              )}

              {selected && (
                <div className="picked">
                  <div>
                    <strong>
                      {selected.airline} {selected.flightNo} · {formatMoney(selected.total)}
                    </strong>
                    <small>
                      {from?.code} {selected.depart} → {to?.code} {selected.arrive} ·{' '}
                      {selected.stops === 0 ? 'Non-stop' : `${selected.stops} stop`} · {selected.duration}
                    </small>
                  </div>
                  {breached && <em className="badge">BREACHED</em>}
                  {breached && (
                    <p className="stored">{filtered.length || flights.length} stored search options restored for Finance review.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="card">
        <h2>Comments</h2>
        <div className="grid3">
          <label className="field span2">
            <span>L1 Manager comments</span>
            <textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} />
          </label>
          <div className="stack">
            <label className="field">
              <span>Business Line</span>
              <select value={line} onChange={(e) => setLine(e.target.value)}>
                <option value="">Select</option>
                {LINES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Entity</span>
              <select value={entity} onChange={(e) => setEntity(e.target.value)}>
                <option value="">Select</option>
                {ENTITIES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {errors.length > 0 && (
        <ul className="errors">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {status && <p className="status">{status}</p>}

      <footer className="actions">
        <button type="button" className="btn" disabled={busy} onClick={() => save(false)}>
          Save
        </button>
        <button type="button" className="btn" onClick={() => setErrors([])}>
          Discard
        </button>
        <button type="button" className="btn primary" disabled={busy} onClick={() => save(true)}>
          Submit
        </button>
      </footer>
    </div>
  )
}
