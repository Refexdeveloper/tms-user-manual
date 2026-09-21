import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ModePhotoThumb } from '../components/TravelModeCards'

function inr(n) {
  return `₹ ${Number(n || 0).toLocaleString('en-IN')}`
}

function useCountUp(value, duration = 700) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const target = Number(value || 0)
    const start = performance.now()
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(target * (0.5 - Math.cos(Math.PI * p) / 2)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return n
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const canTeam = user.role !== 'employee'
  const [scope, setScope] = useState('me')
  const [data, setData] = useState(null)
  const [pendingTab, setPendingTab] = useState('travel')
  const [error, setError] = useState('')

  async function load(nextScope = scope) {
    try {
      const d = await api(`/dashboard?scope=${nextScope}`)
      setData(d)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load(scope)
  }, [scope])

  const cards = data?.cards
  const travelTotal = useCountUp(cards?.travel?.totalCount)
  const travelBookedAmt = useCountUp(cards?.travel?.bookedAmount)
  const advSubAmt = useCountUp(cards?.advance?.submittedAmount)
  const advClaimAmt = useCountUp(cards?.advance?.claimedAmount)
  const expSubAmt = useCountUp(cards?.expense?.submittedAmount)
  const expClaimAmt = useCountUp(cards?.expense?.claimedAmount)

  const pendingRows = useMemo(() => {
    if (!data) return []
    return data.pending?.[pendingTab] || []
  }, [data, pendingTab])

  const maxTrend = Math.max(
    1,
    ...(data?.trends || []).flatMap((m) => [m.travel, m.advance, m.expense])
  )

  return (
    <div className="dash-page">
      <section className="dash-hero anim-fade-up">
        <div>
          <div className="dash-date-chip">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <h2>
            {greeting()}, {user.name.split(' ')[0]}!
          </h2>
          <p>Refex Holding Private Limited · KPIs & approvals</p>
        </div>
        <div className="dash-hero-actions">
          <div className="scope-toggle">
            <button
              type="button"
              className={scope === 'me' ? 'active' : ''}
              onClick={() => setScope('me')}
            >
              Me
            </button>
            {canTeam && (
              <button
                type="button"
                className={scope === 'team' ? 'active' : ''}
                onClick={() => setScope('team')}
              >
                My Team
              </button>
            )}
          </div>
        </div>
      </section>

      {error && <div className="banner warn">{error}</div>}

      <section className="kpi-grid anim-fade-up anim-delay-1">
        <article className="kpi-card travel">
          <div className="kpi-head">
            <span>✈</span> Travel Booking
          </div>
          <div className="kpi-body">
            <div>
              <div className="kpi-label">Total</div>
              <div className="kpi-value">{travelTotal}</div>
              <div className="kpi-sub">{cards?.travel?.totalCount || 0} Requests</div>
            </div>
            <div>
              <div className="kpi-label">Booked</div>
              <div className="kpi-value">{inr(travelBookedAmt)}</div>
              <div className="kpi-sub">{cards?.travel?.bookedCount || 0} Requests</div>
            </div>
          </div>
        </article>

        <article className="kpi-card advance">
          <div className="kpi-head">
            <span>💳</span> Travel Advance
          </div>
          <div className="kpi-body">
            <div>
              <div className="kpi-label">Submitted</div>
              <div className="kpi-value">{inr(advSubAmt)}</div>
              <div className="kpi-sub">{cards?.advance?.submittedCount || 0} Requests</div>
            </div>
            <div>
              <div className="kpi-label">Claimed</div>
              <div className="kpi-value">{inr(advClaimAmt)}</div>
              <div className="kpi-sub">{cards?.advance?.claimedCount || 0} Requests</div>
            </div>
          </div>
        </article>

        <article className="kpi-card expense">
          <div className="kpi-head">
            <span>🧾</span> Travel Expense
          </div>
          <div className="kpi-body">
            <div>
              <div className="kpi-label">Submitted</div>
              <div className="kpi-value">{inr(expSubAmt)}</div>
              <div className="kpi-sub">{cards?.expense?.submittedCount || 0} Requests</div>
            </div>
            <div>
              <div className="kpi-label">Claimed</div>
              <div className="kpi-value">{inr(expClaimAmt)}</div>
              <div className="kpi-sub">{cards?.expense?.claimedCount || 0} Requests</div>
            </div>
          </div>
        </article>
      </section>

      {scope === 'team' && (
        <section className="approver-strip anim-fade-up">
          <div className="pill">Pending Travel · {data?.approver?.pending?.travel || 0}</div>
          <div className="pill mint">Pending Advance · {data?.approver?.pending?.advance || 0}</div>
          <div className="pill orange">Pending Expense · {data?.approver?.pending?.expense || 0}</div>
        </section>
      )}

      <section className="dash-split anim-fade-up anim-delay-2">
        <div className="card dash-panel">
          <div className="panel-head">
            <h3>Monthly Trends</h3>
            <div className="legend">
              <span className="lg travel">Travel Booking</span>
              <span className="lg advance">Travel Advance</span>
              <span className="lg expense">Travel Expense</span>
            </div>
          </div>
          <div className="trend-chart">
            {(data?.trends || []).map((m) => (
              <div key={m.key} className="trend-col">
                <div className="bars">
                  <div className="bar travel" style={{ height: `${(m.travel / maxTrend) * 100}%` }} title={inr(m.travel)} />
                  <div className="bar advance" style={{ height: `${(m.advance / maxTrend) * 100}%` }} title={inr(m.advance)} />
                  <div className="bar expense" style={{ height: `${(m.expense / maxTrend) * 100}%` }} title={inr(m.expense)} />
                </div>
                <div className="trend-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card dash-panel">
          <div className="panel-head">
            <h3>My Upcoming Trips</h3>
            <Link to="/" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
              Full list
            </Link>
          </div>
          {(data?.upcoming || []).length === 0 ? (
            <div className="empty-trips">
              <div className="plane">✈</div>
              <p>No upcoming departures</p>
            </div>
          ) : (
            <div className="trip-list">
              {data.upcoming.map((t) => (
                <Link key={t.id} to={`/requests/${t.id}`} className="trip-row trip-row-photo">
                  <ModePhotoThumb mode={t.travel_mode} size={44} alt={t.travel_mode} />
                  <div className="trip-row-body">
                    <strong>{t.request_number}</strong>
                    <span>
                      {t.from_location} → {t.to_location}
                    </span>
                  </div>
                  <span className="muted">{t.departure_date}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card dash-panel anim-fade-up anim-delay-3" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <h3>{scope === 'team' ? 'Pending Approvals' : 'Pending Requests'}</h3>
          <div className="pending-tabs">
            {[
              ['travel', 'Travel Booking', data?.pending?.travel?.length],
              ['advance', 'Travel Advance', data?.pending?.advance?.length],
              ['expense', 'Travel Expense', data?.pending?.expense?.length],
            ].map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                className={pendingTab === id ? 'active' : ''}
                onClick={() => setPendingTab(id)}
              >
                {label} ({count || 0})
              </button>
            ))}
          </div>
        </div>
        <div className="pending-table">
          {pendingRows.length === 0 && (
            <p className="muted" style={{ padding: 12 }}>
              No pending items in this tab.
            </p>
          )}
          {pendingRows.map((row) => {
            const href =
              row.type === 'travel'
                ? `/requests/${row.id}`
                : row.type === 'advance'
                  ? `/advances/${row.id}`
                  : `/expenses/${row.id}`
            return (
              <Link key={row.id} to={href} className="pending-row pending-row-photo">
                {row.type === 'travel' ? (
                  <ModePhotoThumb mode={row.travel_mode} size={42} alt={row.travel_mode} />
                ) : (
                  <ModePhotoThumb
                    mode={row.type === 'advance' ? 'cab' : 'accommodation'}
                    size={42}
                    alt={row.type}
                  />
                )}
                <div className="pending-row-body">
                  <strong>{row.request_number}</strong>
                  <span>
                    {row.type === 'travel'
                      ? `${row.from_location || '—'} → ${row.to_location || '—'}`
                      : row.type === 'advance'
                        ? row.travel_request_number || 'Advance'
                        : row.expense_date || 'Expense'}
                  </span>
                </div>
                <span>{inr(row.amount)}</span>
                <span className="pill">{row.current_stage}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
