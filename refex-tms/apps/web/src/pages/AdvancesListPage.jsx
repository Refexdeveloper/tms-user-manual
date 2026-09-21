import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function AdvancesListPage() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    api('/advances').then((d) => setRows(d.advances || [])).catch(() => {})
  }, [])
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--display)', margin: 0 }}>Travel Advance</h2>
        <Link className="btn btn-primary" to="/advances/new">
          + New Advance
        </Link>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map((r) => (
          <Link key={r.id} to={`/advances/${r.id}`} className="card request-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{r.request_number}</strong>
                <div style={{ color: 'var(--muted)' }}>{r.travel_request_number || 'No travel link'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="pill mint">{r.current_stage_label}</span>
                <div className="fare-amount" style={{ marginTop: 6 }}>
                  ₹{Number(r.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {rows.length === 0 && <div className="card" style={{ padding: 24, color: 'var(--muted)' }}>No advances yet.</div>}
      </div>
    </div>
  )
}
