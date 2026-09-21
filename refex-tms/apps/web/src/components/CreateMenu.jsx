import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/** Tiny SVG icons matching approvers QuickActions */
function IcoFlight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3.5 14.5l6.2-1.3L14 6.2c.35-.5 1.05-.45 1.3.1l1.1 2.4 3.1.65c.55.12.7.85.25 1.15L15.2 13.2l.7 3.8c.1.55-.5.95-.95.6L11.2 15.2 6.5 16.3c-.55.12-1-.45-.7-.95l.7-.85z" fill="currentColor" />
    </svg>
  )
}
function IcoWallet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.5" cy="14.5" r="1.4" fill="currentColor" />
    </svg>
  )
}
function IcoReceipt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3.5h10v17l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const ACTIONS = [
  {
    path: '/new?mode=air',
    title: 'Create Travel Request',
    sub: 'Plan a business trip',
    Icon: IcoFlight,
    from: '#2879b6',
    toColor: '#3a9ad9',
    shadow: 'rgba(40,121,182,0.35)',
  },
  {
    path: '/advances/new',
    title: 'Request Travel Advance',
    sub: 'Get funds before your trip',
    Icon: IcoWallet,
    from: '#7dc244',
    toColor: '#a3d96a',
    shadow: 'rgba(125,194,68,0.35)',
  },
  {
    path: '/expenses/new',
    title: 'Submit Travel Expense',
    sub: 'Add a new expense claim',
    Icon: IcoReceipt,
    from: '#ee6a31',
    toColor: '#f5924e',
    shadow: 'rgba(238,106,49,0.35)',
  },
]

/**
 * Create FAB like employee / approvers dashboard — tiny icons, reliable navigate.
 */
export default function CreateMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function go(to) {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className={`create-fab${open ? ' open' : ''}`} ref={ref}>
      {open && (
        <div className="create-fab-menu" role="menu">
          {ACTIONS.map((a) => (
            <button
              key={a.path}
              type="button"
              role="menuitem"
              className="create-fab-item"
              style={{
                '--c-from': a.from,
                '--c-to': a.toColor,
                '--c-shadow': a.shadow,
              }}
              onClick={() => go(a.path)}
            >
              <span className="create-fab-ico">
                <a.Icon />
              </span>
              <span className="create-fab-txt">
                <strong>{a.title}</strong>
                <small>{a.sub}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="create-fab-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? 'Close create menu' : 'Create request'}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`create-fab-plus${open ? ' rot' : ''}`} aria-hidden>
          +
        </span>
      </button>
    </div>
  )
}
