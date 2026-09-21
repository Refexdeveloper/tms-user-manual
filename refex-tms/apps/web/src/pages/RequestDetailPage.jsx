import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import AirlineLogo from '../components/AirlineLogo'

export default function RequestDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [request, setRequest] = useState(null)
  const [events, setEvents] = useState([])
  const [options, setOptions] = useState([])
  const [comment, setComment] = useState('')
  const [optionLabel, setOptionLabel] = useState('')
  const [optionAmount, setOptionAmount] = useState('')
  const [optionRemarks, setOptionRemarks] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const data = await api(`/requests/${id}`)
    setRequest(data.request)
    setEvents(data.events || [])
    setOptions(data.options || [])
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [id])

  async function act(action, meta) {
    setBusy(true)
    setError('')
    try {
      await api(`/requests/${id}/actions`, {
        method: 'POST',
        body: { action, comment, meta },
      })
      setComment('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function shareOptions() {
    setBusy(true)
    setError('')
    try {
      await api(`/requests/${id}/options`, {
        method: 'POST',
        body: {
          comment: comment || 'Options shared',
          options: [
            {
              label: optionLabel || 'Option A',
              amount: Number(optionAmount || 0),
              remarks: optionRemarks,
            },
          ],
        },
      })
      setOptionLabel('')
      setOptionAmount('')
      setOptionRemarks('')
      setComment('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function selectOption(optionId) {
    setBusy(true)
    try {
      await api(`/requests/${id}/options/${optionId}/select`, { method: 'POST', body: {} })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function uploadBoardingPass(file) {
    if (!file) return
    setBusy(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('kind', 'boarding_pass')
      await api(`/requests/${id}/attachments`, { method: 'POST', body: form })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!request) {
    return <div className="card" style={{ padding: 24 }}>{error || 'Loading…'}</div>
  }

  const isAir = request.travel_mode === 'air'
  const stage = request.current_stage
  const needsModification = request.status === 'modification_required'
  const lastModificationComment = needsModification
    ? [...events].reverse().find((e) => e.action === 'modification_request')
    : null
  const canEdit = user.id === request.requester_id && ['draft', 'modification_required'].includes(request.status)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }} className="detail-layout">
      <div>
        {needsModification && (
          <div className="card" style={{ padding: 18, marginBottom: 14, borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <span className="pill" style={{ background: '#ffe1e1', color: 'var(--danger)', marginBottom: 8 }}>
                  Modification Requested
                </span>
                {lastModificationComment ? (
                  <>
                    <div style={{ fontWeight: 700 }}>{lastModificationComment.actor_name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 6 }}>
                      {new Date(lastModificationComment.created_at).toLocaleString('en-IN')}
                    </div>
                    <div>"{lastModificationComment.comment}"</div>
                  </>
                ) : (
                  <div>Your manager asked for changes to this request.</div>
                )}
              </div>
              {canEdit && (
                <Link className="btn btn-accent" to={`/requests/${id}/edit`}>
                  Edit Request
                </Link>
              )}
            </div>
          </div>
        )}
        <div className="card" style={{ padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--display)' }}>{request.request_number}</h2>
                <span className="pill">{request.travel_mode}</span>
                <span className="pill">{request.current_stage_label}</span>
              </div>
              <p style={{ color: 'var(--muted)', margin: '8px 0 0' }}>
                {request.from_location} → {request.to_location}
                {request.departure_date ? ` · ${request.departure_date}` : ''}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="pill">{request.status}</div>
              {request.amount != null && (
                <div style={{ marginTop: 8, fontWeight: 800, fontSize: '1.2rem' }}>
                  ₹{Number(request.amount).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 18 }}>
            <Info label="Purpose" value={request.purpose} />
            <Info label="Beneficiary" value={request.beneficiary} />
            <Info label="Trip type" value={request.trip_type} />
            <Info label="Travel Desk booking" value={request.travel_desk_booking ? 'Yes' : 'No'} />
            <Info label="Class" value={request.fare_class} />
            <Info label="Boarding" value={request.boarding_datetime || '—'} />
          </div>

          {request.selected_option?.selected && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-accent)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <AirlineLogo
                code={request.selected_option.selected.airlineCode}
                name={request.selected_option.selected.airlineName}
                size={40}
              />
              <div>
                <strong>Selected flight</strong>
                <div>
                  {request.selected_option.selected.airlineName}{' '}
                  {request.selected_option.selected.flightNumber || ''} · ₹
                  {Number(request.selected_option.selected.totalFare || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {request.cab && (
            <pre style={{ marginTop: 16, background: 'var(--bg)', padding: 12, borderRadius: 12, overflow: 'auto' }}>
              {JSON.stringify(request.cab, null, 2)}
            </pre>
          )}
          {request.accommodation && (
            <pre style={{ marginTop: 16, background: 'var(--bg)', padding: 12, borderRadius: 12, overflow: 'auto' }}>
              {JSON.stringify(request.accommodation, null, 2)}
            </pre>
          )}
        </div>

        {options.length > 0 && (
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <h3 style={{ marginTop: 0 }}>Travel Desk options</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {options.map((o) => (
                <div
                  key={o.id}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{o.option_label}</strong>
                    <div style={{ color: 'var(--muted)' }}>
                      ₹{Number(o.amount || 0).toLocaleString('en-IN')}
                      {o.remarks ? ` · ${o.remarks}` : ''}
                    </div>
                  </div>
                  {stage === 'employee_selection' && user.role === 'employee' && !o.selected && (
                    <button className="btn btn-accent" type="button" disabled={busy} onClick={() => selectOption(o.id)}>
                      Choose
                    </button>
                  )}
                  {o.selected && <span className="pill success">Selected</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Actions</h3>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          {stage === 'draft' && user.id === request.requester_id && !needsModification && (
            <button className="btn btn-primary" type="button" disabled={busy} onClick={() => act('submit')}>
              Submit to L1
            </button>
          )}

          {stage === 'draft' && needsModification && (
            <p style={{ color: 'var(--muted)', margin: 0 }}>
              Use <strong>Edit Request</strong> above to update the details, then resubmit from there.
            </p>
          )}

          {stage === 'l1_approval' && user.role === 'l1_manager' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-success" type="button" disabled={busy} onClick={() => act('approve')}>
                Approve
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={busy}
                onClick={() => act('modification_request')}
              >
                Request modification
              </button>
              <button className="btn" style={{ background: '#ffe1e1', color: 'var(--danger)' }} type="button" disabled={busy} onClick={() => act('reject')}>
                Reject
              </button>
            </div>
          )}

          {stage === 'travel_desk' && user.role === 'travel_desk' && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="grid-3">
                <div className="field">
                  <label>Suggestion label</label>
                  <input value={optionLabel} onChange={(e) => setOptionLabel(e.target.value)} />
                </div>
                <div className="field">
                  <label>Amount</label>
                  <input value={optionAmount} onChange={(e) => setOptionAmount(e.target.value)} />
                </div>
                <div className="field">
                  <label>Remarks</label>
                  <input value={optionRemarks} onChange={(e) => setOptionRemarks(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" type="button" disabled={busy} onClick={shareOptions}>
                  Add remark / suggestion
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    act('book', {
                      amount: request.amount,
                      boarding_datetime: request.boarding_datetime,
                    })
                  }
                >
                  Approve & book ticket
                </button>
              </div>
            </div>
          )}

          {stage === 'travel_desk_options' && user.role === 'travel_desk' && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="grid-3">
                <div className="field">
                  <label>Option label</label>
                  <input value={optionLabel} onChange={(e) => setOptionLabel(e.target.value)} />
                </div>
                <div className="field">
                  <label>Amount</label>
                  <input value={optionAmount} onChange={(e) => setOptionAmount(e.target.value)} />
                </div>
                <div className="field">
                  <label>Remarks</label>
                  <input value={optionRemarks} onChange={(e) => setOptionRemarks(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" type="button" disabled={busy} onClick={shareOptions}>
                Share options with employee
              </button>
            </div>
          )}

          {(stage === 'boarding_pass' || stage === 'booked') && (
            <div style={{ display: 'grid', gap: 10 }}>
              {isAir && (
                <div className="field">
                  <label>Upload boarding pass</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => uploadBoardingPass(e.target.files?.[0])}
                  />
                </div>
              )}
              {isAir && request.can_modify && user.id === request.requester_id && (
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled={busy}
                  onClick={() => act('request_modification')}
                >
                  Raise modification (≤ 8 hrs before boarding)
                </button>
              )}
              {(user.role === 'travel_desk' || user.role === 'l1_manager') && (
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={busy}
                  onClick={() => act(isAir ? 'close' : 'collect_amount', { amount: request.amount })}
                >
                  {isAir ? 'Close request' : 'Collect amount & close'}
                </button>
              )}
            </div>
          )}

          {stage === 'modification_travel_desk' && user.role === 'travel_desk' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary"
                type="button"
                disabled={busy}
                onClick={() => act('confirm_availability')}
              >
                Confirm availability
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={busy}
                onClick={() => act('reject_modification')}
              >
                Reject modification
              </button>
            </div>
          )}

          {stage === 'modification_l1' && user.role === 'l1_manager' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-success" type="button" disabled={busy} onClick={() => act('approve')}>
                Approve update & close
              </button>
              <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => act('reject')}>
                Reject modification
              </button>
            </div>
          )}

          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>
      </div>

      <aside>
        <div className="card" style={{ padding: 18, marginBottom: 14 }}>
          <h3 style={{ marginTop: 0 }}>Status</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {(request.timeline || []).map((step) => (
              <div key={step.stage} style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    marginTop: 4,
                    borderRadius: 99,
                    background:
                      step.state === 'done'
                        ? 'var(--success)'
                        : step.state === 'current'
                          ? 'var(--brand)'
                          : 'var(--line)',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{step.label}</div>
                  <span className="pill">{step.state.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Activity</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {events.map((e) => (
              <div key={e.id} style={{ borderLeft: '3px solid var(--brand-soft)', paddingLeft: 10 }}>
                <strong>{e.action}</strong>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {e.actor_name || 'System'} · {new Date(e.created_at).toLocaleString()}
                </div>
                {e.comment && <div style={{ marginTop: 4 }}>{e.comment}</div>}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontWeight: 600 }}>{value || '—'}</div>
    </div>
  )
}
