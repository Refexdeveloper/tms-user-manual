/**
 * Google Places Autocomplete adapter.
 * - With GOOGLE_MAPS_API_KEY: live Places Autocomplete
 * - Without key: Google-style mock place results (swap key later, same response shape)
 */

const MOCK_PLACES = [
  { main: 'Chennai', sub: 'Tamil Nadu, India', place_id: 'mock-chennai', lat: 13.0827, lng: 80.2707 },
  { main: 'Chennai Central', sub: 'Railway station · Chennai, TN', place_id: 'mock-mas', lat: 13.082, lng: 80.275 },
  { main: 'Chennai International Airport', sub: 'MAA · Meenambakkam', place_id: 'mock-maa', lat: 12.9941, lng: 80.1709 },
  { main: 'Coimbatore', sub: 'Tamil Nadu, India', place_id: 'mock-cbe', lat: 11.0168, lng: 76.9558 },
  { main: 'Coimbatore Junction', sub: 'Railway station · Coimbatore', place_id: 'mock-cbe-j', lat: 10.998, lng: 76.978 },
  { main: 'Bengaluru', sub: 'Karnataka, India', place_id: 'mock-blr', lat: 12.9716, lng: 77.5946 },
  { main: 'Kempegowda International Airport', sub: 'BLR · Devanahalli', place_id: 'mock-blr-a', lat: 13.1989, lng: 77.7069 },
  { main: 'Hyderabad', sub: 'Telangana, India', place_id: 'mock-hyd', lat: 17.385, lng: 78.4867 },
  { main: 'Mumbai', sub: 'Maharashtra, India', place_id: 'mock-bom', lat: 19.076, lng: 72.8777 },
  { main: 'Pune', sub: 'Maharashtra, India', place_id: 'mock-pnq', lat: 18.5204, lng: 73.8567 },
  { main: 'Delhi', sub: 'India', place_id: 'mock-del', lat: 28.6139, lng: 77.209 },
  { main: 'New Delhi Railway Station', sub: 'NDLS · Delhi', place_id: 'mock-ndls', lat: 28.642, lng: 77.219 },
  { main: 'Koyambedu Bus Terminus', sub: 'Chennai CMBT', place_id: 'mock-cmbt', lat: 13.0674, lng: 80.1986 },
  { main: 'Madurai', sub: 'Tamil Nadu, India', place_id: 'mock-mdu', lat: 9.9252, lng: 78.1198 },
  { main: 'Tiruchirappalli', sub: 'Tamil Nadu, India', place_id: 'mock-trz', lat: 10.7905, lng: 78.7047 },
]

export async function searchPlaces(term, limit = 8) {
  const q = String(term || '').trim()
  if (q.length < 2) return { results: [], source: 'none' }

  const key = process.env.GOOGLE_MAPS_API_KEY || ''
  if (key) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&components=country:in&key=${key}`
      const res = await fetch(url)
      const data = await res.json()
      const results = (data.predictions || []).slice(0, limit).map((p) => ({
        id: p.place_id,
        place_id: p.place_id,
        label: p.description,
        display: p.structured_formatting?.main_text || p.description,
        main: p.structured_formatting?.main_text || p.description,
        sub: p.structured_formatting?.secondary_text || '',
        source: 'google',
      }))
      return { results, source: 'google', status: data.status }
    } catch (err) {
      return { results: [], source: 'google_error', error: err.message }
    }
  }

  const lower = q.toLowerCase()
  const results = MOCK_PLACES.filter(
    (p) => p.main.toLowerCase().includes(lower) || p.sub.toLowerCase().includes(lower)
  )
    .slice(0, limit)
    .map((p) => ({
      id: p.place_id,
      place_id: p.place_id,
      label: p.main,
      display: p.main,
      main: p.main,
      sub: p.sub,
      lat: p.lat,
      lng: p.lng,
      source: 'google_mock',
    }))

  return {
    results,
    source: 'google_mock',
    hint: 'Set GOOGLE_MAPS_API_KEY for live Google Places Autocomplete',
  }
}
