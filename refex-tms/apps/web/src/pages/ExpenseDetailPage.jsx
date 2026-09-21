import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

export default function ExpenseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [expense, setExpense] = useState(null)
  const [events, setEvents] = useState([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const d = await api(`/expenses/${id}`)
    setExpense(d.expense)
    setEvents(d.events || [])
  }

  useEffect(() => {
    load().catch((e) => setError(e.message))
  }, [id])

  async function act(action) {
    setBusy(true)
    setError('')
    try {
      await api(`/expenses/${id}/actions`, { method: 'POST', body: { action, comment } })
      setComment('')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!expense) return <p>{error || 'Loading…'}</p>
  const stage = expense.current_stage

  return (
    <div className="detail-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--display)' }}>{expense.request_number}</h2>
            <p style={{ color: 'var(--muted)' }}>
              {(expense.expense_types || []).join(', ')} · {expense.expense_date || '—'}
              {expense.travel_request_number ? ` · ${expense.travel_request_number}` : ''}
            </p>
          </div>
          <div>
            <span className="pill orange">{expense.current_stage_label}</span>
            <div className="fare-amount" style={{ marginTop: 8 }}>
              ₹{Number(expense.claimable_amount || expense.amount || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: '0.8rem' }}>
              <th style={{ padding: 8 }}>Description</th>
              <th style={{ padding: 8 }}>Bill #</th>
              <th style={{ padding: 8 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(expense.lines || []).map((l, i) => (
              <tr key={i}>
                <td style={{ padding: 8 }}>{l.description || '—'}</td>
                <td style={{ padding: 8 }}>{l.bill_number || '—'}</td>
                <td style={{ padding: 8 }}>₹{Number(l.amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="field" style={{ marginTop: 16 }}>
          <label>Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {stage === 'draft' && user.id === expense.requester_id && (
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
          {stage === 'finance_validation' && (user.role === 'finance' || user.role === 'l1_manager') && (
            <>
              <button className="btn btn-success" type="button" disabled={busy} onClick={() => act('approve')}>
                Finance validate
              </button>
              <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => act('reject')}>
                Reject
              </button>
            </>
          )}
          {stage === 'settlement' && (user.role === 'finance' || user.role === 'travel_desk') && (
            <button className="btn btn-accent" type="button" disabled={busy} onClick={() => act('settle')}>
              Final settlement & close
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
            <div key={e.id} style={{ borderLeft: '3px solid var(--pastel-peach)', paddingLeft: 10 }}>
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
