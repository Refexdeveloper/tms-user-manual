import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

const PRIMARY = [
  {
    id: 'air',
    label: 'Flight',
    subtitle: 'Domestic & International',
    to: '/new?mode=air',
    icon: 'ri-flight-takeoff-line',
    tone: '#1E88E5',
    soft: '#EFF6FF',
  },
  {
    id: 'train',
    label: 'Train',
    subtitle: 'Across India',
    to: '/new?mode=train',
    icon: 'ri-train-line',
    tone: '#0084AD',
    soft: '#E0F7FA',
  },
  {
    id: 'bus',
    label: 'Bus',
    subtitle: 'Pan India Travel',
    to: '/new?mode=bus',
    icon: 'ri-bus-line',
    tone: '#F97316',
    soft: '#FFF7ED',
  },
  {
    id: 'flight-hotel',
    label: 'Flight + Hotel',
    subtitle: 'Complete Travel',
    to: '/new?mode=air&addon=hotel',
    icon: 'ri-hotel-bed-line',
    tone: '#2B5AED',
    soft: '#EEF2FF',
  },
]

const SECONDARY = [
  { id: 'hotel', label: 'Hotel', subtitle: 'Stay with comfort', to: '/new?mode=accommodation', icon: 'ri-building-line' },
  { id: 'cab', label: 'Cab', subtitle: 'Airport & Local', to: '/new?mode=cab', icon: 'ri-taxi-line' },
  { id: 'visa', label: 'Visa & Other', subtitle: 'Coming soon', to: '#', icon: 'ri-passport-line', soon: true },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function statusClass(status) {
  if (status?.includes('reject')) return 'badge-delayed'
  if (status === 'closed' || status === 'booked') return 'badge-completed'
  if (status?.includes('pending') || status?.includes('approval')) return 'badge-open'
  return 'badge-active'
}

export default function MyTripPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/requests')
      .then((d) => setRequests(d.requests || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const first = (user?.name || 'Traveller').split(' ')[0]
  const total = requests.length
  const active = requests.filter((r) => !['closed', 'rejected'].includes(r.status)).length
  const booked = requests.filter((r) => r.status === 'booked' || r.status === 'closed').length
  const pending = requests.filter((r) => String(r.status || '').includes('pending')).length

  return (
    <div className="pm-page anim-fade-up">
      <section className="pm-hero-card">
        <div>
          <p className="pm-kicker">
            <i className="ri-suitcase-2-line" /> My Trip
          </p>
          <h1>
            {greeting()}, {first}!
          </h1>
          <p className="pm-hero-sub">Plan your next business trip with RefexOne Travel Management.</p>
        </div>
        <Link className="btn btn-primary" to="/new?mode=air">
          <i className="ri-add-line" /> New request
        </Link>
      </section>

      <section className="pm-kpi-grid">
        {[
          { label: 'Total requests', value: total, color: 'var(--status-total)', icon: 'ri-file-list-3-line' },
          { label: 'Active', value: active, color: 'var(--status-active)', icon: 'ri-refresh-line' },
          { label: 'Booked / closed', value: booked, color: 'var(--status-completed)', icon: 'ri-checkbox-circle-line' },
          { label: 'Pending', value: pending, color: 'var(--status-open)', icon: 'ri-time-line' },
        ].map((k) => (
          <div key={k.label} className="pm-kpi-card">
            <span className="pm-kpi-ico" style={{ color: k.color, background: `${k.color}14` }}>
              <i className={k.icon} />
            </span>
            <div>
              <div className="pm-kpi-label">{k.label}</div>
              <div className="pm-kpi-value tabular-nums" style={{ color: k.color }}>
                {loading ? '—' : k.value}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="pm-card">
        <div className="pm-card-head">
          <h2>Book your travel</h2>
          <span className="pm-chip">Flight · Train · Bus · Stay</span>
        </div>
        <div className="pm-mode-grid">
          {PRIMARY.map((c) => (
            <Link
              key={c.id}
              to={c.to}
              className="pm-mode-card"
              style={{ '--tone': c.tone, '--soft': c.soft }}
            >
              <span className="pm-mode-ico">
                <i className={c.icon} />
              </span>
              <div>
                <strong>{c.label}</strong>
                <span>{c.subtitle}</span>
              </div>
              <i className="ri-arrow-right-s-line pm-mode-go" />
            </Link>
          ))}
        </div>
        <div className="pm-secondary-row">
          {SECONDARY.map((s) =>
            s.soon ? (
              <div key={s.id} className="pm-mini soon">
                <i className={s.icon} />
                <div>
                  <strong>{s.label}</strong>
                  <span>{s.subtitle}</span>
                </div>
              </div>
            ) : (
              <Link key={s.id} to={s.to} className="pm-mini">
                <i className={s.icon} />
                <div>
                  <strong>{s.label}</strong>
                  <span>{s.subtitle}</span>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="pm-card">
        <div className="pm-card-head">
          <h2>Recent travel requests</h2>
          <Link className="pm-link" to="/dashboard">
            View all <i className="ri-arrow-right-line" />
          </Link>
        </div>
        {error && <p className="pm-err">{error}</p>}
        {loading && (
          <div className="pm-skeleton-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pm-skeleton-row" />
            ))}
          </div>
        )}
        {!loading && requests.length === 0 && (
          <div className="pm-empty">
            <i className="ri-flight-takeoff-line" />
            <p>No trips yet — start with Flight, Train or Bus above.</p>
          </div>
        )}
        <div className="pm-request-list">
          {requests.slice(0, 6).map((r) => (
            <Link key={r.id} to={`/requests/${r.id}`} className="pm-request-row">
              <span className="pm-req-ico">
                <i className="ri-route-line" />
              </span>
              <div className="pm-req-main">
                <div className="pm-req-id tabular-nums">{r.request_number}</div>
                <div className="pm-req-route">
                  {r.from_location || '—'} → {r.to_location || '—'}
                </div>
                <div className="pm-req-meta">
                  {r.departure_date || 'Date TBD'}
                  {r.purpose ? ` · ${r.purpose}` : ''}
                </div>
              </div>
              <span className={`pm-badge ${statusClass(r.status)}`}>{r.current_stage_label || r.status}</span>
              <span className="btn btn-ghost pm-view">View</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
