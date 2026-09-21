/**
 * Airline logo helper — tiny logos for flight cards (Google Flights / Kiwi / AVS).
 */
const NAME_TO_CODE = {
  indigo: '6E',
  'indi go': '6E',
  'air india': 'AI',
  airindia: 'AI',
  'air india express': 'IX',
  vistara: 'UK',
  spicejet: 'SG',
  'spice jet': 'SG',
  goair: 'G8',
  'go air': 'G8',
  gofirst: 'G8',
  akasa: 'QP',
  'akasa air': 'QP',
  emirates: 'EK',
  etihad: 'EY',
  qatar: 'QR',
  'qatar airways': 'QR',
  'singapore airlines': 'SQ',
  lufthansa: 'LH',
}

export function resolveAirlineCode(airlineCode, airlineName) {
  const raw = String(airlineCode || '').trim().toUpperCase()
  if (/^[A-Z0-9]{2}$/.test(raw)) return raw
  const fromNum = raw.match(/^([A-Z0-9]{2})/)
  if (fromNum) return fromNum[1]
  const name = String(airlineName || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!name) return ''
  if (NAME_TO_CODE[name]) return NAME_TO_CODE[name]
  for (const [key, code] of Object.entries(NAME_TO_CODE)) {
    if (name.includes(key) || key.includes(name)) return code
  }
  return ''
}

export function airlineLogoUrls(code) {
  if (!code) return []
  const c = code.toUpperCase()
  return [
    `https://www.gstatic.com/flights/airline_logos/70px/${c}.png`,
    `https://images.kiwi.com/airlines/64/${c}.png`,
    `https://pics.avs.io/64/64/${c}.png`,
  ]
}
