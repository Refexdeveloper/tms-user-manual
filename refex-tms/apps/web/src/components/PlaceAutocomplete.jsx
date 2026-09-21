import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

/**
 * Debounced place lookup.
 * source: 'airports' | 'locations' | 'places' (Google Maps–ready)
 */
export default function PlaceAutocomplete({
  label,
  value,
  onChange,
  source = 'airports',
  placeholder,
  compact = false,
}) {
  const [term, setTerm] = useState(value?.display || value?.label || '')
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    setTerm(value?.display || value?.label || '')
  }, [value])

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function handleType(nextTerm) {
    setTerm(nextTerm)
    onChange?.(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (nextTerm.trim().length < 2) {
      setOptions([])
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        let path
        if (source === 'airports') {
          path = `/flights/airports?term=${encodeURIComponent(nextTerm)}&limit=8`
        } else if (source === 'places') {
          path = `/places/search?term=${encodeURIComponent(nextTerm)}&limit=8`
        } else {
          path = `/locations/search?term=${encodeURIComponent(nextTerm)}`
        }
        const data = await api(path)
        const results =
          source === 'airports'
            ? (data.results || []).map((a) => ({
                id: a.code,
                main: `${a.city} (${a.code})`,
                sub: a.name,
                code: a.code,
                city: a.city,
                display: `${a.city} (${a.code})`,
              }))
            : (data.results || []).map((l) => ({
                id: l.id || l.place_id || l.code || l.label,
                main: l.main || l.label || l.description,
                sub: l.sub || l.subLabel || l.formatted_address || l.secondary,
                code: l.code,
                city: l.city || l.main || l.label,
                display: l.display || l.label || l.main || l.description,
                place_id: l.place_id,
                lat: l.lat,
                lng: l.lng,
                source: l.source || source,
              }))
        setOptions(results)
        setOpen(true)
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 280)
  }

  return (
    <div className={`field autocomplete${compact ? ' compact' : ''}`} ref={boxRef}>
      {label && <label>{label}</label>}
      <input
        placeholder={placeholder}
        value={term}
        onChange={(e) => handleType(e.target.value)}
        onFocus={() => options.length && setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <div className="autocomplete-list">
          {loading && <div className="autocomplete-item ac-sub">Searching places…</div>}
          {!loading && options.length === 0 && (
            <div className="autocomplete-item ac-sub">No matches</div>
          )}
          {options.map((opt) => (
            <div
              key={opt.id}
              className="autocomplete-item"
              onClick={() => {
                onChange(opt)
                setTerm(opt.display)
                setOpen(false)
              }}
            >
              <div className="ac-main">{opt.main}</div>
              {opt.sub && <div className="ac-sub">{opt.sub}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
