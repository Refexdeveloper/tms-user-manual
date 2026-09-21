import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

export default function InboxPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('travel')
  const [travel, setTravel] = useState([])
  const [advance, setAdvance] = useState([])
  const [expense, setExpense] = useState([])

  useEffect(() => {
    Promise.all([
      api('/requests'),
      api('/advances?scope=team'),
      api('/expenses?scope=team'),
    ]).then(([t, a, e]) => {
      setTravel(t.requests || [])
      setAdvance(a.advances || [])
      setExpense(e.expenses || [])
    })
  }, [])

  const rows =
    tab === 'travel'
      ? travel.filter((r) =>
          ['l1_approval', 'travel_desk', 'travel_desk_options', 'modification_l1', 'modification_travel_desk'].includes(
            r.current_stage
          )
        )
      : tab === 'advance'
        ? advance.filter((r) => ['l1_approval', 'finance_approval', 'advance_release'].includes(r.current_stage))
        : expense.filter((r) => ['l1_approval', 'finance_validation', 'settlement'].includes(r.current_stage))

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--display)', marginTop: 0 }}>
        {user.role === 'finance' ? 'Finance inbox' : user.role === 'travel_desk' ? 'Travel Desk inbox' : 'Approval inbox'}
      </h2>
      <div className="pending-tabs" style={{ marginBottom: 14 }}>
        {[
          ['travel', 'Travel'],
          ['advance', 'Advance'],
          ['expense', 'Expense'],
        ].map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map((r) => {
          const href =
            tab === 'travel' ? `/requests/${r.id}` : tab === 'advance' ? `/advances/${r.id}` : `/expenses/${r.id}`
          return (
            <Link key={r.id} to={href} className="card" style={{ padding: 16, display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <strong>{r.request_number}</strong>
                  <div style={{ color: 'var(--muted)' }}>
                    {tab === 'travel'
                      ? `${r.from_location} → ${r.to_location}`
                      : tab === 'advance'
                        ? r.travel_request_number || 'Advance'
                        : (r.expense_types || []).join(', ') || 'Expense'}
                  </div>
                </div>
                <span className="pill">{r.current_stage_label || r.current_stage}</span>
              </div>
            </Link>
          )
        })}
        {rows.length === 0 && (
          <div className="card" style={{ padding: 20, color: 'var(--muted)' }}>
            No items in this inbox tab.
          </div>
        )}
      </div>
    </div>
  )
}
