import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { HERO_PLANE, MODE_CARDS } from '../travelMedia'

const PRIMARY = [
  {
    id: 'air',
    label: 'Flight',
    subtitle: 'Domestic & International',
    to: '/new?mode=air',
    icon: 'ri-flight-takeoff-line',
    tone: '#1E88E5',
    soft: '#EFF6FF',
    image: MODE_CARDS.air,
  },
  {
    id: 'train',
    label: 'Train',
    subtitle: 'Across India',
    to: '/new?mode=train',
    icon: 'ri-train-line',
    tone: '#0084AD',
    soft: '#E0F7FA',
    image: MODE_CARDS.train,
  },
  {
    id: 'bus',
    label: 'Bus',
    subtitle: 'Pan India Travel',
    to: '/new?mode=bus',
    icon: 'ri-bus-line',
    tone: '#F97316',
    soft: '#FFF7ED',
    image: MODE_CARDS.bus,
  },
  {
    id: 'flight-hotel',
    label: 'Flight + Hotel',
    subtitle: 'Complete Travel',
    to: '/new?mode=air&addon=hotel',
    icon: 'ri-hotel-bed-line',
    tone: '#2B5AED',
    soft: '#EEF2FF',
    image: MODE_CARDS.flightHotel,
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
    <div className="pm-page travel-home anim-fade-up">
      <section className="travel-editorial-hero">
        <img src={HERO_PLANE} alt="" className="travel-editorial-bg" />
        <div className="travel-editorial-overlay" />
        <div className="travel-editorial-content">
          <p className="travel-eyebrow">
            <span /> Refex business travel
          </p>
          <h1>{greeting()}, {first}.</h1>
          <p>Where will business take you next?</p>
          <div className="travel-hero-actions">
            <Link className="btn travel-primary-btn" to="/new?mode=air">
              Plan a journey <i className="ri-arrow-right-line" />
            </Link>
            <Link className="travel-quiet-link" to="/dashboard">
              View your trips <i className="ri-arrow-right-up-line" />
            </Link>
          </div>
        </div>
        <div className="travel-hero-note">
          <i className="ri-shield-check-line" />
          <span><strong>Policy-aware booking</strong> every step of the way</span>
        </div>
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
          <div>
            <p className="section-kicker">Explore your options</p>
            <h2>Choose how you travel</h2>
          </div>
          <span className="pm-chip">One request, every journey</span>
        </div>
        <div className="premium-mode-grid">
          {PRIMARY.map((c) => (
            <Link
              key={c.id}
              to={c.to}
              className="premium-mode-card"
              style={{ '--tone': c.tone, '--soft': c.soft }}
            >
              <img src={c.image} alt="" />
              <span className="premium-mode-shade" />
              <div className="premium-mode-copy">
                <span className="premium-mode-icon"><i className={c.icon} /></span>
                <div>
                  <strong>{c.label}</strong>
                  <span>{c.subtitle}</span>
                </div>
              </div>
              <i className="ri-arrow-right-up-line premium-mode-go" />
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
          <div>
            <p className="section-kicker">Your activity</p>
            <h2>Recent travel requests</h2>
          </div>
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
