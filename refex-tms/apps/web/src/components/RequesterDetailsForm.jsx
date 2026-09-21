import { useAuth } from '../auth'

export default function RequesterDetailsForm({ value, onChange }) {
  const { user } = useAuth()
  const v = value || {}

  function set(patch) {
    onChange({ ...v, ...patch })
  }

  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <p className="pill" style={{ marginBottom: 12 }}>Auto-populated</p>
        <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--display)' }}>Requester Details</h3>
        <div className="grid-3">
          <ReadField label="Employee Name" value={user.name} />
          <ReadField label="Employee ID" value={user.employee_id} />
          <ReadField label="Designation" value={user.designation} />
          <ReadField label="Department" value={user.department} />
          <ReadField label="Email" value={user.email} />
          <ReadField label="Cost Centre" value={user.cost_centre} />
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--display)' }}>Travel Purpose</h3>
        <div className="grid-2">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Purpose of Travel *</label>
            <input
              placeholder="e.g. Client meeting, site visit, training…"
              value={v.purpose || ''}
              onChange={(e) => set({ purpose: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Domestic / International *</label>
            <select
              value={v.domestic_international || 'Domestic'}
              onChange={(e) => set({ domestic_international: e.target.value })}
            >
              <option>Domestic</option>
              <option>International</option>
            </select>
          </div>
          <div className="field">
            <label>Travelling For</label>
            <select value={v.beneficiary || 'Self'} onChange={(e) => set({ beneficiary: e.target.value })}>
              <option>Self</option>
              <option>Internal</option>
              <option>External</option>
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label>Should the Travel Desk book this for you?</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className={`btn ${v.travel_desk_booking !== false ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => set({ travel_desk_booking: true })}
            >
              Yes
            </button>
            <button
              type="button"
              className={`btn ${v.travel_desk_booking === false ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => set({ travel_desk_booking: false })}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReadField({ label, value }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div
        style={{
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '12px 14px',
          background: '#f5f7fb',
          color: 'var(--ink)',
        }}
      >
        {value || '—'}
      </div>
    </div>
  )
}
