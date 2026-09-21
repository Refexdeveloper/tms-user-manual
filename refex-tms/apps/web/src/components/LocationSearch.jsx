import { useState } from 'react'
import { api } from '../api'

export default function LocationSearch({ label, value, onChange }) {
  const [text, setText] = useState(value?.label || '')
  const [suggestions, setSuggestions] = useState([])

  async function search(term) {
    setText(term)
    if (term.length < 2) {
      setSuggestions([])
      onChange?.(null)
      return
    }
    try {
      const data = await api(`/locations/search?term=${encodeURIComponent(term)}`)
      setSuggestions(data.results || [])
    } catch {
      setSuggestions([])
    }
  }

  return (
    <div className="field" style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        value={text}
        onChange={(e) => search(e.target.value)}
        placeholder="Search city / location"
      />
      {suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid var(--line)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 0,
                background: 'white',
                padding: '10px 12px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setText(s.label)
                setSuggestions([])
                onChange?.(s)
              }}
            >
              <strong>{s.label}</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{s.subLabel}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
