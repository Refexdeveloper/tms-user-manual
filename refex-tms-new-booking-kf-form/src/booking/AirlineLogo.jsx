import { useState } from 'react'
import { airlineLogoUrls, resolveAirlineCode } from './airlineLogos.js'

export default function AirlineLogo({ code, name, size = 28 }) {
  const iata = resolveAirlineCode(code, name)
  const urls = airlineLogoUrls(iata)
  const [idx, setIdx] = useState(0)
  const initials = String(iata || name || '?').slice(0, 2).toUpperCase()

  if (!urls.length || idx >= urls.length) {
    return (
      <span className="alogo fallback" style={{ width: size, height: size, fontSize: size * 0.32 }}>
        {initials}
      </span>
    )
  }

  return (
    <span className="alogo-wrap" style={{ width: size, height: size }}>
      <img
        className="alogo"
        src={urls[idx]}
        alt={name || iata}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setIdx((i) => i + 1)}
      />
    </span>
  )
}
