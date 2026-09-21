import { useEffect, useState } from 'react'
import { airlineLogoUrls, resolveAirlineCode } from '../lib/airlineLogos'

/**
 * Tiny real airline logo for flight results.
 */
export default function AirlineLogo({ code, name, size = 40, className = '' }) {
  const iata = resolveAirlineCode(code, name)
  const urls = airlineLogoUrls(iata)
  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(!iata)

  useEffect(() => {
    setIdx(0)
    setFailed(!iata)
  }, [iata, code, name])

  if (failed || !urls[idx]) {
    const label = (iata || name || '?').toString().slice(0, 2).toUpperCase()
    return (
      <span
        className={`airline-logo fallback ${className}`}
        style={{ width: size, height: size }}
        title={name || iata || 'Airline'}
      >
        {label}
      </span>
    )
  }

  return (
    <span className={`airline-logo-wrap ${className}`} style={{ width: size, height: size }}>
      <img
        className="airline-logo"
        src={urls[idx]}
        alt={name || iata}
        title={`${name || iata} (${iata})`}
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (idx + 1 < urls.length) setIdx((n) => n + 1)
          else setFailed(true)
        }}
      />
    </span>
  )
}
