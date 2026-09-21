import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import ModeSelector from '../components/ModeSelector'
import Stepper from '../components/Stepper'
import CompactRequesterStrip from '../components/CompactRequesterStrip'
import FlightSearchStep from '../components/FlightSearchStep'
import SimpleTripForm from '../components/SimpleTripForm'
import GroundSearchForm from '../components/GroundSearchForm'
import TripAddOns from '../components/TripAddOns'
import ReviewSummary from '../components/ReviewSummary'
import { MODE_VISUAL } from '../components/TravelIcons'
import { ModePhotoThumb } from '../components/TravelModeCards'

/** Requester is auto-filled — start on trip details */
const STEPS = ['Trip Details', 'Review']

function emptyForm() {
  return {
    purpose: '',
    domestic_international: 'Domestic',
    beneficiary: 'Self',
    travel_desk_booking: true,
    remarks: '',
    exception_flag: false,
    exception_reason: '',
    air: null,
    trip: null,
    addons: { withHotel: false, withCab: false },
  }
}

function locationsForPayload(mode, form) {
  if (mode === 'air' && form.air) {
    const segs = form.air.segments || []
    const from = segs[0]?.from
    const to = form.air.tripType === 'multiCity' ? segs[segs.length - 1]?.to : segs[0]?.to
    return { from: from?.display || null, to: to?.display || null }
  }
  if (form.trip) {
    if (mode === 'accommodation') {
      return { from: null, to: form.trip.city?.display || null }
    }
    return { from: form.trip.from?.display || null, to: form.trip.to?.display || null }
  }
  return { from: null, to: null }
}

function datesForPayload(mode, form) {
  if (mode === 'air' && form.air) {
    const dep = form.air.segments?.[0]?.date || null
    const ret = form.air.tripType === 'roundTrip' ? form.air.returnDate || null : null
    return { departure_date: dep, return_date: ret }
  }
  if (form.trip) {
    return { departure_date: form.trip.date || null, return_date: form.trip.endDate || null }
  }
  return { departure_date: null, return_date: null }
}

function estimateAmount(mode, form) {
  if (mode !== 'air' || !form.air?.selectedOption) return null
  const sel = form.air.selectedOption
  if (sel.type === 'oneWay') return sel.flight?.totalFare ?? null
  if (sel.type === 'roundTrip') return (sel.onward?.totalFare || 0) + (sel.return?.totalFare || 0) || null
  if (sel.type === 'multiCity') {
    const total = (sel.legs || []).reduce((sum, f) => sum + (f?.totalFare || 0), 0)
    return total || null
  }
  return null
}

function buildPayload(mode, form) {
  const { from, to } = locationsForPayload(mode, form)
  const { departure_date, return_date } = datesForPayload(mode, form)
  return {
    travel_mode: mode,
    purpose: form.purpose || null,
    trip_type: mode === 'air' ? form.air?.tripType || null : null,
    domestic_international: form.domestic_international,
    beneficiary: form.beneficiary,
    travel_desk_booking: form.travel_desk_booking !== false,
    from_location: from,
    to_location: to,
    departure_date,
    return_date,
    fare_class: mode === 'air' ? form.air?.fareClass || null : null,
    amount: estimateAmount(mode, form),
    currency: 'INR',
    selected_option: mode === 'air' ? form.air?.selectedOption || null : null,
    flight_search_snapshot: mode === 'air' ? form.air : null,
    cab: mode === 'cab' ? form.trip : null,
    accommodation: mode === 'accommodation' ? form.trip : null,
    train: mode === 'train' ? form.trip : null,
    bus: mode === 'bus' ? form.trip : null,
    exception_flag: !!form.exception_flag,
    exception_reason: form.exception_reason || null,
    remarks: form.remarks || null,
    cab_json_extra: undefined,
  }
}

function enrichPayloadWithAddons(payload, form, mode) {
  const addons = form.addons || form.trip?.addons || {}
  const notes = []
  if (addons.withHotel) notes.push('ADDON: Flight+Hotel / Stay requested')
  if (addons.withCab) notes.push('ADDON: Cab requested')
  if (!notes.length) return payload
  return {
    ...payload,
    remarks: [payload.remarks, ...notes].filter(Boolean).join('\n'),
    accommodation:
      mode !== 'accommodation' && addons.withHotel
        ? payload.accommodation || { requested_with_trip: true }
        : payload.accommodation,
    cab:
      mode !== 'cab' && addons.withCab
        ? payload.cab || { requested_with_trip: true }
        : payload.cab,
  }
}

function hasCompleteSelection(mode, form) {
  if (mode !== 'air') return true
  const sel = form.air?.selectedOption
  if (!sel) return false
  if (sel.type === 'oneWay') return !!sel.flight
  if (sel.type === 'roundTrip') return !!sel.onward && !!sel.return
  if (sel.type === 'multiCity') {
    const legCount = form.air.segments?.length || 0
    return (sel.legs || []).filter(Boolean).length === legCount
  }
  return false
}

export default function NewRequestPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isEdit = Boolean(id)
  const [mode, setMode] = useState(searchParams.get('mode') || null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => {
    const base = emptyForm()
    if (searchParams.get('addon') === 'hotel') {
      base.addons = { ...base.addons, withHotel: true }
    }
    return base
  })
  const [requestId, setRequestId] = useState(id || null)
  const [loadingExisting, setLoadingExisting] = useState(isEdit)
  const [modBanner, setModBanner] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    let ignore = false
    async function load() {
      try {
        const data = await api(`/requests/${id}`)
        if (ignore) return
        const r = data.request
        if (!['draft', 'modification_required'].includes(r.status)) {
          navigate(`/requests/${id}`, { replace: true })
          return
        }
        setMode(r.travel_mode)
        setForm({
          purpose: r.purpose || '',
          domestic_international: r.domestic_international || 'Domestic',
          beneficiary: r.beneficiary || 'Self',
          travel_desk_booking: r.travel_desk_booking !== false,
          remarks: r.remarks || '',
          exception_flag: !!r.exception_flag,
          exception_reason: r.exception_reason || '',
          air: r.travel_mode === 'air' ? r.flight_search_snapshot : null,
          trip: r[r.travel_mode] || null,
          addons: {
            withHotel: Boolean(r.accommodation?.requested_with_trip || r.remarks?.includes('Flight+Hotel')),
            withCab: Boolean(r.cab?.requested_with_trip || r.remarks?.includes('Cab requested')),
          },
        })
        if (r.status === 'modification_required') {
          const events = data.events || []
          const lastComment = [...events].reverse().find((e) => e.action === 'modification_request')
          setModBanner(lastComment)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        if (!ignore) setLoadingExisting(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [id, isEdit, navigate])

  const visual = MODE_VISUAL[mode] || MODE_VISUAL.air

  async function persist() {
    setError('')
    const payload = enrichPayloadWithAddons(buildPayload(mode, form), form, mode)
    if (!requestId) {
      const res = await api('/requests', { method: 'POST', body: payload })
      setRequestId(res.request.id)
      return res.request
    }
    const res = await api(`/requests/${requestId}`, { method: 'PATCH', body: payload })
    return res.request
  }

  async function handleSaveDraft() {
    setSaving(true)
    try {
      const saved = await persist()
      navigate(`/requests/${saved.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    if (!form.purpose?.trim()) {
      setError('Please add a Travel Purpose before submitting.')
      setStep(0)
      return
    }
    if (!hasCompleteSelection(mode, form)) {
      setError('Please select a flight for every leg of your journey before submitting.')
      return
    }
    setSaving(true)
    try {
      const saved = await persist()
      await api(`/requests/${saved.id}/actions`, {
        method: 'POST',
        body: { action: 'submit', comment: modBanner ? 'Resubmitted after modification' : null },
      })

      // Option B: also CREATE + SUBMIT on Travel_Management_A02 via BFF
      try {
        const status = await api('/kissflow/status')
        if (status.enabled) {
          const payload = enrichPayloadWithAddons(buildPayload(mode, form), form, mode)
          const kf = await api('/kissflow/travel', {
            method: 'POST',
            body: { ...payload, submit: true },
          })
          if (kf.instanceId) {
            navigate(`/requests/${saved.id}?kf=${encodeURIComponent(kf.instanceId)}`)
            return
          }
        }
      } catch (kfErr) {
        setError(`Saved locally, but Kissflow submit failed: ${kfErr.message}`)
        navigate(`/requests/${saved.id}`)
        return
      }

      navigate(`/requests/${saved.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loadingExisting) {
    return <p style={{ color: 'var(--muted)' }}>Loading your request…</p>
  }

  if (!mode) {
    return (
      <div>
        <section className="booking-hero-soft anim-fade-up">
          <div className="booking-hero-copy">
            <p className="pill" style={{ background: 'rgba(45,123,191,0.12)', color: '#2d7bbf', display: 'inline-flex' }}>
              Travel Booking
            </p>
            <h2>What are you travelling by?</h2>
          </div>
        </section>
        <div className="booking-widget anim-fade-up anim-delay-1">
          <ModeSelector onSelect={(m) => setMode(m)} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }} className="anim-fade-up">
        <ModePhotoThumb
          mode={mode}
          withHotel={!!form.addons?.withHotel}
          size={40}
          alt={visual.label}
        />
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
            {isEdit ? 'Edit Travel Request' : 'New Travel Request'} ·{' '}
            {form.addons?.withHotel && mode === 'air' ? 'Flight + Hotel' : visual.label}
          </h2>
        </div>
        <button type="button" className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setMode(null)}>
          Change mode
        </button>
      </div>

      {modBanner && (
        <div className="banner danger">
          <span>⚠️</span>
          <span>
            <strong>{modBanner.actor_name}</strong> requested a modification on{' '}
            {new Date(modBanner.created_at).toLocaleString('en-IN')}:
            <br />
            "{modBanner.comment}"
            <br />
            Update the details below and resubmit — your Request ID stays the same.
          </span>
        </div>
      )}

      <CompactRequesterStrip
        purpose={form.purpose}
        onPurposeChange={(purpose) => setForm((f) => ({ ...f, purpose }))}
        extras={
          <>
            <div className="field">
              <label>Domestic / International</label>
              <select
                value={form.domestic_international}
                onChange={(e) => setForm((f) => ({ ...f, domestic_international: e.target.value }))}
              >
                <option>Domestic</option>
                <option>International</option>
              </select>
            </div>
            <div className="field">
              <label>Travelling for</label>
              <select
                value={form.beneficiary}
                onChange={(e) => setForm((f) => ({ ...f, beneficiary: e.target.value }))}
              >
                <option>Self</option>
                <option>Internal</option>
                <option>External</option>
              </select>
            </div>
          </>
        }
      />

      <Stepper steps={STEPS} activeIndex={step} onStepClick={setStep} />

      {error && <div className="banner warn">{error}</div>}

      {step === 0 && mode === 'air' && (
        <>
          <FlightSearchStep value={form.air} onChange={(v) => setForm((f) => ({ ...f, air: v }))} />
          <div style={{ marginTop: 14 }}>
            <TripAddOns
              showFlightHotel
              value={form.addons}
              onChange={(addons) => setForm((f) => ({ ...f, addons }))}
            />
          </div>
        </>
      )}
      {step === 0 && (mode === 'train' || mode === 'bus') && (
        <GroundSearchForm
          mode={mode}
          value={form.trip}
          onChange={(v) => setForm((f) => ({ ...f, trip: v, addons: v.addons || f.addons }))}
        />
      )}
      {step === 0 && (mode === 'cab' || mode === 'accommodation') && (
        <SimpleTripForm
          mode={mode}
          value={form.trip}
          onChange={(v) => setForm((f) => ({ ...f, trip: v, addons: v.addons || f.addons }))}
        />
      )}

      {step === 1 && (
        <>
          <ReviewSummary mode={mode} form={form} onEditStep={setStep} />
          <div className="card review-remarks" style={{ padding: 16, marginTop: 12 }}>
            <div className="field">
              <label>Remarks (optional)</label>
              <textarea
                placeholder="Anything your manager should know…"
                value={form.remarks}
                onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              />
            </div>
          </div>
        </>
      )}

      <div className="sticky-actions sticky-actions-mobile">
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={saving}>
            Back
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={handleSaveDraft} disabled={saving}>
          Save Draft
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => {
              if (!form.purpose?.trim()) {
                setError('Please add a Travel Purpose to continue.')
                return
              }
              setError('')
              setStep((s) => s + 1)
            }}
          >
            Next
          </button>
        ) : (
          <button type="button" className="btn btn-accent btn-submit-wide" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Submitting…' : modBanner ? 'Resubmit for Approval' : 'Submit Travel Request'}
          </button>
        )}
      </div>
    </div>
  )
}
