import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

export default function AdvanceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [advance, setAdvance] = useState(null)
  const [events, setEvents] = useState([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const d = await api(`/advances/${id}`)
    setAdvance(d.advance)
    setEvents(d.events || [])
  }

  useEffect(() => {
    load().catch((e) => setError(e.message))
  }, [id])

  async function act(action) {
    setBusy(true)
    setError('')
    try {
      await api(`/advances/${id}/actions`, { method: 'POST', body: { action, comment } })
      setComment('')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!advance) return <p>{error || 'Loading…'}</p>

  const stage = advance.current_stage

  return (
    <div className="detail-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--display)' }}>{advance.request_number}</h2>
            <p style={{ color: 'var(--muted)' }}>
              Linked · {advance.travel_request_number || '—'} · {advance.payment_mode}
            </p>
          </div>
          <div>
            <span className="pill mint">{advance.current_stage_label}</span>
            <div className="fare-amount" style={{ marginTop: 8 }}>
              ₹{Number(advance.amount || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        <p>{advance.purpose}</p>
        <p style={{ color: 'var(--muted)' }}>{advance.remarks}</p>

        <div className="field" style={{ marginTop: 16 }}>
          <label>Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {stage === 'draft' && user.id === advance.requester_id && (
            <button className="btn btn-primary" type="button" disabled={busy} onClick={() => act('submit')}>
              Submit
            </button>
          )}
          {stage === 'l1_approval' && user.role === 'l1_manager' && (
            <>
              <button className="btn btn-success" type="button" disabled={busy} onClick={() => act('approve')}>
                Approve
              </button>
              <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => act('reject')}>
                Reject
              </button>
            </>
          )}
          {stage === 'finance_approval' && (user.role === 'finance' || user.role === 'l1_manager') && (
            <>
              <button className="btn btn-success" type="button" disabled={busy} onClick={() => act('approve')}>
                Finance approve
              </button>
              <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => act('reject')}>
                Reject
              </button>
            </>
          )}
          {stage === 'advance_release' && (user.role === 'finance' || user.role === 'travel_desk') && (
            <button className="btn btn-primary" type="button" disabled={busy} onClick={() => act('release')}>
              Release advance & close
            </button>
          )}
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <p style={{ marginTop: 16 }}>
          <Link to="/">← Dashboard</Link>
        </p>
      </div>
      <aside className="card" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0 }}>Activity</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {events.map((e) => (
            <div key={e.id} style={{ borderLeft: '3px solid var(--pastel-mint)', paddingLeft: 10 }}>
              <strong>{e.action}</strong>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                {e.actor_name} · {new Date(e.created_at).toLocaleString()}
              </div>
              {e.comment && <div>{e.comment}</div>}
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
