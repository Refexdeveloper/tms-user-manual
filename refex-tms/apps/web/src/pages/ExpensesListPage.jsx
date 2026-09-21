import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function ExpensesListPage() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    api('/expenses').then((d) => setRows(d.expenses || [])).catch(() => {})
  }, [])
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--display)', margin: 0 }}>Travel Expense</h2>
        <Link className="btn btn-accent" to="/expenses/new">
          + New Expense
        </Link>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map((r) => (
          <Link key={r.id} to={`/expenses/${r.id}`} className="card request-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{r.request_number}</strong>
                <div style={{ color: 'var(--muted)' }}>
                  {(r.expense_types || []).join(', ') || 'Expense'} · {r.expense_date || '—'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="pill orange">{r.current_stage_label}</span>
                <div className="fare-amount" style={{ marginTop: 6 }}>
                  ₹{Number(r.claimable_amount || r.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {rows.length === 0 && <div className="card" style={{ padding: 24, color: 'var(--muted)' }}>No expenses yet.</div>}
      </div>
    </div>
  )
}
