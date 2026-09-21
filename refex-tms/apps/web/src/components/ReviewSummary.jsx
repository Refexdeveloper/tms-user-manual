import { useAuth } from '../auth'
import { modeMeta, formatDate, formatMoney } from '../lib/constants'
import AirlineLogo from './AirlineLogo'
import { ModePhotoThumb } from './TravelModeCards'
import { IconCab, IconHotel } from './TravelIcons'

function FlightPick({ f, label }) {
  if (!f) {
    return (
      <p className="review-empty">
        {label ? <strong>{label} </strong> : null}Not selected
      </p>
    )
  }
  return (
    <div className="review-flight-row">
      <AirlineLogo code={f.airlineCode} name={f.airlineName} size={36} />
      <div>
        {label && <div className="review-flight-label">{label}</div>}
        <strong>
          {f.airlineName || f.airlineCode} {f.flightNumber || ''}
        </strong>
        <div className="muted-sm">
          {f.sourceCityCode} {f.departureTime || ''} → {f.destinationCityCode} {f.arrivalTime || ''} ·{' '}
          {formatMoney(f.totalFare, f.currencyCode)}
        </div>
      </div>
    </div>
  )
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <div className="review-card">
      <div className="review-card-head">
        <h3>{title}</h3>
        {onEdit && (
          <button type="button" className="btn btn-ghost review-edit" onClick={onEdit}>
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default function ReviewSummary({ mode, form, onEditStep }) {
  const { user } = useAuth()
  const meta = modeMeta(mode)
  const air = mode === 'air' ? form.air : null
  const addons = form.addons || form.trip?.addons || {}

  return (
    <div className="review-mobile">
      <ReviewCard title="Requester details" onEdit={onEditStep ? () => onEditStep(0) : undefined}>
        <div className="grid-2 review-grid">
          <Row label="Name" value={user.name} />
          <Row label="Employee ID" value={user.employee_id} />
          <Row label="Department" value={user.department} />
          <Row label="Designation" value={user.designation} />
        </div>
      </ReviewCard>

      <ReviewCard title="Travel details" onEdit={onEditStep ? () => onEditStep(0) : undefined}>
        <div className="grid-2 review-grid">
          <Row
            label="Mode"
            value={
              <span className="review-mode">
                <ModePhotoThumb mode={mode} size={28} /> {meta.label}
              </span>
            }
          />
          <Row label="Purpose" value={form.purpose} />
          <Row label="Type" value={form.domestic_international} />
          <Row label="Travelling For" value={form.beneficiary} />
          <Row
            label="Travel Desk"
            value={form.travel_desk_booking === false ? 'No — self-arranged' : 'Yes'}
          />
        </div>
      </ReviewCard>

      {mode === 'air' && air && (
        <ReviewCard title="Flight details" onEdit={onEditStep ? () => onEditStep(1) : undefined}>
          {air.tripType === 'oneWay' && <FlightPick f={air.selectedOption?.flight} />}
          {air.tripType === 'roundTrip' && (
            <>
              <FlightPick label="Onward" f={air.selectedOption?.onward} />
              <FlightPick label="Return" f={air.selectedOption?.return} />
            </>
          )}
          {air.tripType === 'multiCity' &&
            (air.selectedOption?.legs || []).map((leg, i) => (
              <FlightPick key={i} label={`Leg ${i + 1}`} f={leg} />
            ))}
          {!air.selectedOption && <p className="review-empty">No flight selected yet.</p>}
        </ReviewCard>
      )}

      {mode !== 'air' && form.trip && (
        <ReviewCard title={`${meta.label} details`} onEdit={onEditStep ? () => onEditStep(1) : undefined}>
          <div className="grid-2 review-grid">
            {form.trip.from && <Row label="From" value={form.trip.from.display || form.trip.from.main} />}
            {form.trip.to && <Row label="To" value={form.trip.to.display || form.trip.to.main} />}
            {form.trip.city && <Row label="City" value={form.trip.city.display || form.trip.city.main} />}
            <Row label={mode === 'accommodation' ? 'Check-in' : 'Date'} value={formatDate(form.trip.date)} />
            {form.trip.endDate && <Row label="Check-out" value={formatDate(form.trip.endDate)} />}
          </div>
        </ReviewCard>
      )}

      {(addons.withHotel || addons.withCab) && (
        <ReviewCard title="Add-ons" onEdit={onEditStep ? () => onEditStep(1) : undefined}>
          <div className="review-addons">
            {addons.withHotel && (
              <span className="review-addon-chip">
                <IconHotel size={16} /> Hotel / Stay requested
              </span>
            )}
            {addons.withCab && (
              <span className="review-addon-chip">
                <IconCab size={16} /> Cab / Airport transfer
              </span>
            )}
          </div>
        </ReviewCard>
      )}

      {form.remarks && (
        <ReviewCard title="Remarks">
          <p style={{ margin: 0 }}>{form.remarks}</p>
        </ReviewCard>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <div className="review-row-label">{label}</div>
      <div className="review-row-value">{value || '—'}</div>
    </div>
  )
}
