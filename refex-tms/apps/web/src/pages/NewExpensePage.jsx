import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import CompactRequesterStrip from '../components/CompactRequesterStrip'

const TYPES = [
  { id: 'Food', label: 'Food' },
  { id: 'Accommodation', label: 'Accommodation' },
  { id: 'Travel Ticket', label: 'Travel Ticket' },
  { id: 'Local Conveyance', label: 'Local Conveyance' },
]

const emptyLine = () => ({
  restaurant: '',
  expense_type: 'Food',
  bill_number: '',
  amount: '',
  claimable: '',
  attachment_name: '',
})

export default function NewExpensePage() {
  const navigate = useNavigate()
  const [travels, setTravels] = useState([])
  const [types, setTypes] = useState(['Food'])
  const [expenseDate, setExpenseDate] = useState('')
  const [travelId, setTravelId] = useState('')
  const [travelQ, setTravelQ] = useState('')
  const [bulk, setBulk] = useState({
    Food: false,
    Accommodation: false,
    'Local Conveyance': false,
    'Travel Ticket': false,
  })
  const [lines, setLines] = useState([emptyLine()])
  const [addCount, setAddCount] = useState(1)
  const [totalFoodBill, setTotalFoodBill] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api('/requests')
      .then((d) => setTravels(d.requests || []))
      .catch((e) => setError(e.message))
  }, [])

  const selected = travels.find((t) => t.id === travelId)
  const filteredTravels = useMemo(() => {
    if (!travelQ) return travels.slice(0, 8)
    const s = travelQ.toLowerCase()
    return travels
      .filter(
        (t) =>
          t.request_number?.toLowerCase().includes(s) ||
          t.from_location?.toLowerCase().includes(s) ||
          t.to_location?.toLowerCase().includes(s)
      )
      .slice(0, 8)
  }, [travels, travelQ])

  const total = lines.reduce((s, l) => s + Number(l.claimable || l.amount || 0), 0)
  const anyBulk = types.some((t) => bulk[t])

  function toggleType(id) {
    setTypes((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      return next.length ? next : prev
    })
  }

  function setLine(i, patch) {
    setLines((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  function addRows(n = 1) {
    const count = Math.max(1, Math.min(20, Number(n) || 1))
    setLines((l) => [...l, ...Array.from({ length: count }, () => emptyLine())])
  }

  function removeLine(i) {
    setLines((rows) => (rows.length <= 1 ? rows : rows.filter((_, idx) => idx !== i)))
  }

  async function submit(action) {
    if (!types.length) {
      setError('Select at least one expense type')
      return
    }
    if (!expenseDate) {
      setError('Expense date is required')
      return
    }
    if (total <= 0 && !(bulk.Food && Number(totalFoodBill) > 0)) {
      setError('Add at least one line with amount')
      return
    }
    setSaving(true)
    setError('')
    try {
      const amount = total || Number(totalFoodBill || 0)
      const created = await api('/expenses', {
        method: 'POST',
        body: {
          travel_request_id: travelId || null,
          travel_request_number: selected?.request_number || null,
          expense_types: types,
          expense_date: expenseDate,
          amount,
          claimable_amount: amount,
          bulk_food: !!bulk.Food,
          bulk_flags: bulk,
          consolidated_pdf: pdfName || null,
          total_food_bill: bulk.Food ? Number(totalFoodBill || amount) : null,
          lines: lines.map((l) => ({
            description: l.restaurant || l.expense_type,
            restaurant: l.restaurant,
            expense_type: l.expense_type,
            bill_number: l.bill_number,
            amount: Number(l.amount || 0),
            claimable_amount: Number(l.claimable || l.amount || 0),
            attachment_name: l.attachment_name || null,
          })),
          remarks,
        },
      })
      let exp = created.expense
      if (action === 'submit') {
        const res = await api(`/expenses/${exp.id}/actions`, {
          method: 'POST',
          body: { action: 'submit' },
        })
        exp = res.expense
      }
      navigate(`/expenses/${exp.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="expense-flow">
      <div className="expense-hero anim-fade-up">
        <p className="pill orange">Travel Expense</p>
        <h2>Expense claim</h2>
      </div>

      <CompactRequesterStrip />

      <div className="card expense-card anim-fade-up" style={{ padding: 20, marginBottom: 14 }}>
        <h3 className="expense-section-title">Expense Details</h3>
        <p className="expense-section-sub">Reimbursement</p>

        <div className="field">
          <label>Expense type(s)</label>
          <div className="expense-type-tags">
            {TYPES.map((t) => {
              const on = types.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`expense-tag${on ? ' on' : ''}`}
                  onClick={() => toggleType(t.id)}
                >
                  {t.label}
                  {on && <i className="ri-close-line" />}
                </button>
              )
            })}
          </div>
          <div className="expense-type-menu">
            {TYPES.map((t) => (
              <label key={t.id} className="expense-type-opt">
                <input type="checkbox" checked={types.includes(t.id)} onChange={() => toggleType(t.id)} />
                <span>{t.label}</span>
                {types.includes(t.id) && <i className="ri-check-line" style={{ color: '#70b62c' }} />}
              </label>
            ))}
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 14 }}>
          <div className="field">
            <label>Expense date</label>
            <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Link to Travel Request</label>
            <input
              placeholder="Search Travel Request ID / route…"
              value={travelQ}
              onChange={(e) => setTravelQ(e.target.value)}
            />
          </div>
        </div>

        {filteredTravels.length > 0 && (
          <div className="expense-travel-picks">
            {filteredTravels.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`user-pick${travelId === t.id ? ' picked' : ''}`}
                onClick={() => setTravelId(t.id === travelId ? '' : t.id)}
              >
                <span>
                  <strong>{t.request_number}</strong>
                  <br />
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {t.from_location} → {t.to_location}
                  </span>
                </span>
                {travelId === t.id && <i className="ri-check-line" style={{ color: 'var(--refex-green)' }} />}
              </button>
            ))}
          </div>
        )}

        <div className="bulk-toggle-card">
          {TYPES.filter((t) => types.includes(t.id)).map((t) => (
            <div key={t.id} className="bulk-toggle-row">
              <span>Do you want to raise {t.label.toLowerCase()} expenses in bulk?</span>
              <div className="yesno">
                <button
                  type="button"
                  className={bulk[t.id] ? 'on' : ''}
                  onClick={() => setBulk((b) => ({ ...b, [t.id]: true }))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={!bulk[t.id] ? 'on' : ''}
                  onClick={() => setBulk((b) => ({ ...b, [t.id]: false }))}
                >
                  No
                </button>
              </div>
            </div>
          ))}
          <p className="bulk-note">
            <strong>Note:</strong> Enter amounts in INR. For foreign currency bills, convert to Indian Rupees before
            submit.
          </p>
        </div>
      </div>

      {bulk.Food && (
        <div className="card expense-card anim-fade-up" style={{ padding: 20, marginBottom: 14 }}>
          <h3 className="expense-section-title">Bulk Food Expense</h3>
          <label className="pdf-drop">
            <i className="ri-file-pdf-2-line" />
            <span>Please consolidate all food bills into one PDF and upload.</span>
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => setPdfName(e.target.files?.[0]?.name || '')}
            />
          </label>
          {pdfName && (
            <div className="pdf-chip">
              <i className="ri-file-pdf-2-fill" style={{ color: '#e11d48' }} />
              {pdfName}
              <button type="button" className="btn btn-ghost" onClick={() => setPdfName('')}>
                Remove
              </button>
            </div>
          )}
          <div className="field" style={{ maxWidth: 280, marginTop: 12 }}>
            <label>Total Food Bill Amount</label>
            <div className="amount-with-suffix">
              <input
                type="number"
                min="0"
                value={totalFoodBill}
                onChange={(e) => setTotalFoodBill(e.target.value)}
                placeholder="0"
              />
              <span>INR</span>
            </div>
          </div>
        </div>
      )}

      <div className="card expense-card anim-fade-up" style={{ padding: 20, marginBottom: 14 }}>
        <div className="panel-head" style={{ marginBottom: 12 }}>
          <h3 className="expense-section-title" style={{ margin: 0 }}>
            {anyBulk ? 'Bulk Expense Table' : 'Bill lines'}
          </h3>
        </div>

        <div className="bulk-table-wrap">
          <table className="bulk-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>Restaurant / Description</th>
                <th>Expense Type</th>
                <th>Bill Number</th>
                <th>Bill Amount</th>
                <th>Claimable</th>
                <th>Attachment</th>
                <th style={{ width: 44 }} />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input
                      value={line.restaurant}
                      placeholder="Restaurant / vendor"
                      onChange={(e) => setLine(i, { restaurant: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      value={line.expense_type}
                      onChange={(e) => setLine(i, { expense_type: e.target.value })}
                    >
                      {TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={line.bill_number}
                      placeholder="Bill no."
                      onChange={(e) => setLine(i, { bill_number: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={line.amount}
                      placeholder="0"
                      onChange={(e) => {
                        const amount = e.target.value
                        setLine(i, {
                          amount,
                          claimable: line.claimable === '' || line.claimable === line.amount ? amount : line.claimable,
                        })
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={line.claimable}
                      placeholder="0"
                      onChange={(e) => setLine(i, { claimable: e.target.value })}
                    />
                  </td>
                  <td>
                    <label className="attach-btn">
                      <i className="ri-attachment-2" />
                      <input
                        type="file"
                        hidden
                        onChange={(e) => setLine(i, { attachment_name: e.target.files?.[0]?.name || '' })}
                      />
                      {line.attachment_name ? line.attachment_name.slice(0, 12) : 'Add'}
                    </label>
                  </td>
                  <td>
                    <button type="button" className="icon-x" onClick={() => removeLine(i)} aria-label="Remove row">
                      <i className="ri-delete-bin-line" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bulk-add-row">
          <button type="button" className="btn btn-primary" onClick={() => addRows(addCount)}>
            Add
          </button>
          <input
            type="number"
            min={1}
            max={20}
            value={addCount}
            onChange={(e) => setAddCount(e.target.value)}
            className="bulk-add-count"
          />
          <span>more rows</span>
          <div style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '1.05rem' }}>
            Total · ₹{total.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label>Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
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
