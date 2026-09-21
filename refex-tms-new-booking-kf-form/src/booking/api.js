import { CLOUD_RUN } from './constants.js'

const CITIES = [
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', display: 'Chennai (MAA)', country: 'IN' },
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', display: 'New Delhi (DEL)', country: 'IN' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', display: 'Mumbai (BOM)', country: 'IN' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', display: 'Bengaluru (BLR)', country: 'IN' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', display: 'Hyderabad (HYD)', country: 'IN' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport', display: 'Kolkata (CCU)', country: 'IN' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport', display: 'Pune (PNQ)', country: 'IN' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', display: 'Kochi (COK)', country: 'IN' },
  { code: 'GOI', city: 'Goa', name: 'Goa International Airport', display: 'Goa (GOI)', country: 'IN' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport', display: 'Ahmedabad (AMD)', country: 'IN' },
]

export const DEFAULT_FROM = CITIES[0]
export const DEFAULT_TO = CITIES[1]

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function formatMoney(n, currency = 'INR') {
  const num = Number(n || 0)
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(num)
  } catch {
    return `₹${num.toLocaleString('en-IN')}`
  }
}

export function searchCities(q) {
  const s = String(q || '').trim().toLowerCase()
  if (!s) return CITIES.slice(0, 8)
  return CITIES.filter(
    (c) => c.city.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)
  ).slice(0, 8)
}

export async function searchAirports(q) {
  if (!q || String(q).trim().length < 2) return []
  try {
    const res = await fetch(`${CLOUD_RUN}/api/airports?q=${encodeURIComponent(q.trim())}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return searchCities(q)
    const data = await res.json()
    const list = data.airports || data.results || data || []
    return Array.isArray(list) && list.length ? list : searchCities(q)
  } catch {
    return searchCities(q)
  }
}

/** Same schema as refex-tms / flightsearch-kf-component */
export function buildFlightSearchPayload({
  tripType = 'oneWay',
  from,
  to,
  depDate,
  arrDate,
  fareClass = 'Economy',
  domesticInternational = 'Domestic',
}) {
  const fromCode = String(from?.code || '').toUpperCase()
  const toCode = String(to?.code || '').toUpperCase()
  const isInternational =
    domesticInternational === 'International' ||
    (from?.country && to?.country && from.country !== to.country)

  const payload = {
    tripType: tripType === 'roundTrip' ? 'roundTrip' : 'oneWay',
    isInternational: Boolean(isInternational),
    fareClass,
    fromCity: fromCode,
    toCity: toCode,
    depDate,
    noOfAdults: 1,
    noOfChildren: 0,
    noOfInfant: 0,
    limit: 50,
    maxResults: 50,
    segments: [{ fromCity: fromCode, toCity: toCode, depDate }],
  }
  if (payload.tripType === 'roundTrip' && arrDate) payload.arrDate = arrDate
  return payload
}

export async function searchFlights(params) {
  const body = buildFlightSearchPayload(params)
  const res = await fetch(`${CLOUD_RUN}/api/flights/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    const err = data.error
    throw new Error(
      typeof err === 'string' ? err : err ? JSON.stringify(err) : `Flight search failed (${res.status})`
    )
  }
  const result = data.result || {}
  if (String(result.status || '').toLowerCase() === 'failed') {
    throw new Error('Provider returned Failed — no fare options')
  }
  const opts = (result.options || []).map((o, i) => ({
    ...o,
    id: o.id || `${o.airlineCode}-${o.flightNumber}-${i}`,
    airlineName: o.airlineName || o.airline,
    airlineCode: o.airlineCode,
    departureTime: o.departureTime || o.depTime,
    arrivalTime: o.arrivalTime || o.arrTime,
    sourceCityCode: o.sourceCityCode || body.fromCity,
    destinationCityCode: o.destinationCityCode || body.toCity,
    totalFare: o.totalFare ?? o.fare ?? 0,
    currencyCode: o.currencyCode || result.currencyCode || 'INR',
    stops: o.stops ?? o.stopCount ?? 0,
  }))
  return { options: opts, meta: { uuid: result.uuid || '', request: body } }
}
