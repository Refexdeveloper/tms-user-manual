import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import CompactRequesterStrip from '../components/CompactRequesterStrip'

export default function NewAdvancePage() {
  const navigate = useNavigate()
  const [travels, setTravels] = useState([])
  const [travelId, setTravelId] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [purpose, setPurpose] = useState('')
  const [paymentMode, setPaymentMode] = useState('Bank')
  const [travelDays, setTravelDays] = useState('1')
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api('/requests')
      .then((d) => {
        const approved = (d.requests || []).filter(
          (r) =>
            ['booked', 'boarding_pass_uploaded', 'closed', 'pending_travel_desk', 'travel_desk_suggested'].includes(
              r.status
            ) || ['booked', 'boarding_pass', 'travel_desk', 'closed'].includes(r.current_stage)
        )
        setTravels(approved.length ? approved : d.requests || [])
      })
      .catch((e) => setError(e.message))
  }, [])

  const filtered = travels.filter((t) => {
    if (!q) return true
    const s = q.toLowerCase()
    return (
      t.request_number?.toLowerCase().includes(s) ||
      t.from_location?.toLowerCase().includes(s) ||
      t.to_location?.toLowerCase().includes(s) ||
      t.purpose?.toLowerCase().includes(s)
    )
  })

  const selected = travels.find((t) => t.id === travelId)

  async function submit(action) {
    if (!travelId) {
      setError('Link an approved Travel Request')
      return
    }
    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid advance amount')
      return
    }
    setSaving(true)
    setError('')
    try {
      const created = await api('/advances', {
        method: 'POST',
        body: {
          travel_request_id: travelId,
          travel_request_number: selected?.request_number,
          amount: Number(amount),
          purpose: purpose || selected?.purpose,
          remarks,
          payment_mode: paymentMode,
          travel_days: Number(travelDays) || 1,
        },
      })
      let adv = created.advance
      if (action === 'submit') {
        const res = await api(`/advances/${adv.id}/actions`, {
          method: 'POST',
          body: { action: 'submit', comment: 'Submitted for L1 approval' },
        })
        adv = res.advance
      }
      navigate(`/advances/${adv.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="advance-flow">
      <div className="expense-hero anim-fade-up">
        <p className="pill mint">Travel Advance</p>
        <h2>Advance Request</h2>
      </div>

      <CompactRequesterStrip />

      <div className="card expense-card anim-fade-up" style={{ padding: 20, marginBottom: 14 }}>
        <h3 className="expense-section-title">Travel Advance Request Form</h3>

        <div className="field">
          <label>Link to travel</label>
          <input
            placeholder="Search Travel Request ID / route…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="expense-travel-picks" style={{ marginTop: 10 }}>
          {filtered.slice(0, 10).map((t) => (
            <button
              key={t.id}
              type="button"
              className={`user-pick${travelId === t.id ? ' picked' : ''}`}
              onClick={() => {
                setTravelId(t.id)
                setPurpose(t.purpose || '')
              }}
            >
              <span>
                <strong>{t.request_number}</strong>
                <br />
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {t.from_location} → {t.to_location} · {t.departure_date || '—'}
                </span>
              </span>
              <span className="pill">{t.status}</span>
            </button>
          ))}
          {filtered.length === 0 && <p style={{ color: 'var(--muted)' }}>No travel requests found.</p>}
        </div>
      </div>

      {selected && (
        <div className="card expense-card anim-fade-up" style={{ padding: 16, marginBottom: 14, overflowX: 'auto' }}>
          <table className="advance-summary-table">
            <thead>
              <tr>
                <th>Travel Request ID</th>
                <th>From date</th>
                <th>To date</th>
                <th>From</th>
                <th>To</th>
                <th>Travel Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selected.request_number}</td>
                <td>{selected.departure_date || '—'}</td>
                <td>{selected.return_date || '—'}</td>
                <td>{selected.from_location || '—'}</td>
                <td>{selected.to_location || '—'}</td>
                <td>{selected.purpose || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="card expense-card anim-fade-up" style={{ padding: 20 }}>
        <div className="grid-2">
          <div className="field">
            <label>No. of Travel days</label>
            <input type="number" min="1" value={travelDays} onChange={(e) => setTravelDays(e.target.value)} />
          </div>
          <div className="field">
            <label>Advance amount *</label>
            <div className="amount-with-suffix">
              <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              <span>INR</span>
            </div>
          </div>
          <div className="field">
            <label>Payment mode</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              <option>Bank</option>
              <option>Cheque</option>
              <option>In-person</option>
            </select>
          </div>
          <div className="field">
            <label>Purpose</label>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
          </div>
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <div className="sticky-actions">
          <Link className="btn btn-ghost" to="/">
            Discard
          </Link>
          <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => submit('draft')}>
            Save
          </button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={() => submit('submit')}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
