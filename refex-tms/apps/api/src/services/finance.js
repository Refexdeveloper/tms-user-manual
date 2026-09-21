import { nanoid } from 'nanoid'
import { getDb, nowIso } from '../db/index.js'

const ADV_STAGES = {
  DRAFT: 'draft',
  L1: 'l1_approval',
  FINANCE: 'finance_approval',
  RELEASE: 'advance_release',
  CLOSED: 'closed',
  REJECTED: 'rejected',
}

const EXP_STAGES = {
  DRAFT: 'draft',
  L1: 'l1_approval',
  FINANCE: 'finance_validation',
  SETTLEMENT: 'settlement',
  CLOSED: 'closed',
  REJECTED: 'rejected',
}

function log(db, { entityType, entityId, stage, action, actor, comment, meta }) {
  db.prepare(
    `INSERT INTO activity_log
      (id, entity_type, entity_id, stage, action, actor_id, actor_name, comment, meta_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    nanoid(),
    entityType,
    entityId,
    stage || null,
    action,
    actor?.id || null,
    actor?.name || null,
    comment || null,
    meta ? JSON.stringify(meta) : null,
    nowIso()
  )
}

function nextNumber(db, table, prefix) {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get()
  return `${prefix}${String((row?.c || 0) + 1).padStart(4, '0')}`
}

function parseJson(v, fb = null) {
  if (!v) return fb
  try {
    return JSON.parse(v)
  } catch {
    return fb
  }
}

function serializeAdvance(row) {
  if (!row) return null
  return {
    ...row,
    entity_type: 'advance',
    current_stage_label: stageLabelAdvance(row.current_stage),
  }
}

function serializeExpense(row) {
  if (!row) return null
  return {
    ...row,
    entity_type: 'expense',
    expense_types: parseJson(row.expense_types_json, []),
    lines: parseJson(row.lines_json, []),
    bulk_food: Boolean(row.bulk_food),
    expense_types_json: undefined,
    lines_json: undefined,
    current_stage_label: stageLabelExpense(row.current_stage),
  }
}

function stageLabelAdvance(s) {
  return (
    {
      draft: 'Draft',
      l1_approval: 'L1 Manager Approval',
      finance_approval: 'Finance Approval',
      advance_release: 'Advance Release',
      closed: 'Closed',
      rejected: 'Rejected',
    }[s] || s
  )
}

function stageLabelExpense(s) {
  return (
    {
      draft: 'Draft',
      l1_approval: 'L1 Manager Approval',
      finance_validation: 'Finance Validation',
      settlement: 'Settlement',
      closed: 'Closed',
      rejected: 'Rejected',
    }[s] || s
  )
}

export function createAdvance(user, body) {
  const db = getDb()
  const id = nanoid()
  const ts = nowIso()
  const num = nextNumber(db, 'advances', 'ADV')
  db.prepare(
    `INSERT INTO advances (
      id, request_number, requester_id, travel_request_id, travel_request_number,
      amount, currency, purpose, remarks, payment_mode, status, current_stage,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`
  ).run(
    id,
    num,
    user.id,
    body.travel_request_id || null,
    body.travel_request_number || null,
    Number(body.amount || 0),
    body.currency || 'INR',
    body.purpose || null,
    body.remarks || null,
    body.payment_mode || 'Bank',
    ADV_STAGES.DRAFT,
    ts,
    ts
  )
  log(db, {
    entityType: 'advance',
    entityId: id,
    stage: ADV_STAGES.DRAFT,
    action: 'draft_created',
    actor: user,
  })
  return getAdvance(id)
}

export function updateAdvance(user, id, body) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM advances WHERE id = ?').get(id)
  if (!row) throw Object.assign(new Error('Not found'), { status: 404 })
  if (row.requester_id !== user.id) throw Object.assign(new Error('Forbidden'), { status: 403 })
  if (row.current_stage !== 'draft') throw Object.assign(new Error('Not editable'), { status: 400 })
  db.prepare(
    `UPDATE advances SET
      travel_request_id = COALESCE(?, travel_request_id),
      travel_request_number = COALESCE(?, travel_request_number),
      amount = COALESCE(?, amount),
      purpose = COALESCE(?, purpose),
      remarks = COALESCE(?, remarks),
      payment_mode = COALESCE(?, payment_mode),
      updated_at = ?
     WHERE id = ?`
  ).run(
    body.travel_request_id ?? null,
    body.travel_request_number ?? null,
    body.amount != null ? Number(body.amount) : null,
    body.purpose ?? null,
    body.remarks ?? null,
    body.payment_mode ?? null,
    nowIso(),
    id
  )
  return getAdvance(id)
}

export function getAdvance(id) {
  return serializeAdvance(getDb().prepare('SELECT * FROM advances WHERE id = ?').get(id))
}

export function listAdvances(user, query = {}) {
  const db = getDb()
  let sql = 'SELECT * FROM advances WHERE 1=1'
  const params = []
  if (query.scope === 'team' || user.role === 'l1_manager' || user.role === 'finance') {
    if (user.role === 'employee') {
      sql += ' AND requester_id = ?'
      params.push(user.id)
    } else if (user.role === 'l1_manager') {
      sql += ` AND (requester_id IN (SELECT id FROM users WHERE manager_id = ?) OR current_stage = 'l1_approval')`
      params.push(user.id)
    } else if (user.role === 'finance') {
      sql += ` AND current_stage IN ('finance_approval', 'advance_release', 'closed')`
    }
  } else {
    sql += ' AND requester_id = ?'
    params.push(user.id)
  }
  sql += ' ORDER BY updated_at DESC'
  return db.prepare(sql).all(...params).map(serializeAdvance)
}

export function advanceAction(user, id, { action, comment }) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM advances WHERE id = ?').get(id)
  if (!row) throw Object.assign(new Error('Not found'), { status: 404 })

  let nextStage = row.current_stage
  let nextStatus = row.status
  const map = {
    [`${ADV_STAGES.DRAFT}:submit`]: [ADV_STAGES.L1, 'pending_l1'],
    [`${ADV_STAGES.L1}:approve`]: [ADV_STAGES.FINANCE, 'pending_finance'],
    [`${ADV_STAGES.L1}:reject`]: [ADV_STAGES.REJECTED, 'rejected'],
    [`${ADV_STAGES.FINANCE}:approve`]: [ADV_STAGES.RELEASE, 'pending_release'],
    [`${ADV_STAGES.FINANCE}:reject`]: [ADV_STAGES.REJECTED, 'rejected'],
    [`${ADV_STAGES.RELEASE}:release`]: [ADV_STAGES.CLOSED, 'closed'],
    [`${ADV_STAGES.RELEASE}:close`]: [ADV_STAGES.CLOSED, 'closed'],
  }
  const hit = map[`${row.current_stage}:${action}`]
  if (!hit) throw Object.assign(new Error(`Invalid advance action ${action}`), { status: 400 })
  if (['reject'].includes(action) && !comment) {
    throw Object.assign(new Error('Comment mandatory'), { status: 400 })
  }
  ;[nextStage, nextStatus] = hit
  const ts = nowIso()
  db.prepare(
    `UPDATE advances SET current_stage=?, status=?, updated_at=?,
      submitted_at=CASE WHEN ?='submit' THEN ? ELSE submitted_at END,
      closed_at=CASE WHEN ?= 'closed' THEN ? ELSE closed_at END
     WHERE id=?`
  ).run(nextStage, nextStatus, ts, action, ts, nextStatus, ts, id)

  log(db, {
    entityType: 'advance',
    entityId: id,
    stage: row.current_stage,
    action,
    actor: user,
    comment,
  })
  return getAdvance(id)
}

export function createExpense(user, body) {
  const db = getDb()
  const id = nanoid()
  const ts = nowIso()
  const num = nextNumber(db, 'expenses', 'EXP')
  const types = body.expense_types || []
  const lines = body.lines || []
  const amount = body.amount != null ? Number(body.amount) : lines.reduce((s, l) => s + Number(l.amount || 0), 0)
  db.prepare(
    `INSERT INTO expenses (
      id, request_number, requester_id, travel_request_id, travel_request_number,
      expense_types_json, expense_date, amount, claimable_amount, currency, lines_json,
      bulk_food, status, current_stage, remarks, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`
  ).run(
    id,
    num,
    user.id,
    body.travel_request_id || null,
    body.travel_request_number || null,
    JSON.stringify(types),
    body.expense_date || null,
    amount,
    body.claimable_amount != null ? Number(body.claimable_amount) : amount,
    body.currency || 'INR',
    JSON.stringify(lines),
    body.bulk_food ? 1 : 0,
    EXP_STAGES.DRAFT,
    body.remarks || null,
    ts,
    ts
  )
  log(db, {
    entityType: 'expense',
    entityId: id,
    stage: EXP_STAGES.DRAFT,
    action: 'draft_created',
    actor: user,
  })
  return getExpense(id)
}

export function updateExpense(user, id, body) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id)
  if (!row) throw Object.assign(new Error('Not found'), { status: 404 })
  if (row.requester_id !== user.id) throw Object.assign(new Error('Forbidden'), { status: 403 })
  if (row.current_stage !== 'draft') throw Object.assign(new Error('Not editable'), { status: 400 })
  const lines = body.lines || parseJson(row.lines_json, [])
  const amount =
    body.amount != null
      ? Number(body.amount)
      : lines.reduce((s, l) => s + Number(l.amount || 0), Number(row.amount || 0))
  db.prepare(
    `UPDATE expenses SET
      travel_request_id = COALESCE(?, travel_request_id),
      travel_request_number = COALESCE(?, travel_request_number),
      expense_types_json = COALESCE(?, expense_types_json),
      expense_date = COALESCE(?, expense_date),
      amount = ?,
      claimable_amount = COALESCE(?, claimable_amount),
      lines_json = COALESCE(?, lines_json),
      bulk_food = COALESCE(?, bulk_food),
      remarks = COALESCE(?, remarks),
      updated_at = ?
     WHERE id = ?`
  ).run(
    body.travel_request_id ?? null,
    body.travel_request_number ?? null,
    body.expense_types ? JSON.stringify(body.expense_types) : null,
    body.expense_date ?? null,
    amount,
    body.claimable_amount != null ? Number(body.claimable_amount) : null,
    body.lines ? JSON.stringify(body.lines) : null,
    body.bulk_food === undefined ? null : body.bulk_food ? 1 : 0,
    body.remarks ?? null,
    nowIso(),
    id
  )
  return getExpense(id)
}

export function getExpense(id) {
  return serializeExpense(getDb().prepare('SELECT * FROM expenses WHERE id = ?').get(id))
}

export function listExpenses(user, query = {}) {
  const db = getDb()
  let sql = 'SELECT * FROM expenses WHERE 1=1'
  const params = []
  if (query.scope === 'team' || user.role === 'l1_manager' || user.role === 'finance') {
    if (user.role === 'employee') {
      sql += ' AND requester_id = ?'
      params.push(user.id)
    } else if (user.role === 'l1_manager') {
      sql += ` AND (requester_id IN (SELECT id FROM users WHERE manager_id = ?) OR current_stage = 'l1_approval')`
      params.push(user.id)
    } else if (user.role === 'finance') {
      sql += ` AND current_stage IN ('finance_validation', 'settlement', 'closed')`
    }
  } else {
    sql += ' AND requester_id = ?'
    params.push(user.id)
  }
  sql += ' ORDER BY updated_at DESC'
  return db.prepare(sql).all(...params).map(serializeExpense)
}

export function expenseAction(user, id, { action, comment }) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id)
  if (!row) throw Object.assign(new Error('Not found'), { status: 404 })
  const map = {
    [`${EXP_STAGES.DRAFT}:submit`]: [EXP_STAGES.L1, 'pending_l1'],
    [`${EXP_STAGES.L1}:approve`]: [EXP_STAGES.FINANCE, 'pending_finance'],
    [`${EXP_STAGES.L1}:reject`]: [EXP_STAGES.REJECTED, 'rejected'],
    [`${EXP_STAGES.FINANCE}:approve`]: [EXP_STAGES.SETTLEMENT, 'pending_settlement'],
    [`${EXP_STAGES.FINANCE}:reject`]: [EXP_STAGES.REJECTED, 'rejected'],
    [`${EXP_STAGES.SETTLEMENT}:settle`]: [EXP_STAGES.CLOSED, 'closed'],
    [`${EXP_STAGES.SETTLEMENT}:close`]: [EXP_STAGES.CLOSED, 'closed'],
  }
  const hit = map[`${row.current_stage}:${action}`]
  if (!hit) throw Object.assign(new Error(`Invalid expense action ${action}`), { status: 400 })
  if (action === 'reject' && !comment) {
    throw Object.assign(new Error('Comment mandatory'), { status: 400 })
  }
  const [nextStage, nextStatus] = hit
  const ts = nowIso()
  db.prepare(
    `UPDATE expenses SET current_stage=?, status=?, updated_at=?,
      submitted_at=CASE WHEN ?='submit' THEN ? ELSE submitted_at END,
      closed_at=CASE WHEN ?= 'closed' THEN ? ELSE closed_at END
     WHERE id=?`
  ).run(nextStage, nextStatus, ts, action, ts, nextStatus, ts, id)
  log(db, {
    entityType: 'expense',
    entityId: id,
    stage: row.current_stage,
    action,
    actor: user,
    comment,
  })
  return getExpense(id)
}

export function getActivity(entityType, entityId) {
  return getDb()
    .prepare(
      `SELECT * FROM activity_log WHERE entity_type = ? AND entity_id = ? ORDER BY created_at ASC`
    )
    .all(entityType, entityId)
}

/** Unified dashboard stats matching Kissflow employee + approver cards */
export function getDashboard(user, scope = 'me') {
  const db = getDb()
  const isTeam = scope === 'team' && user.role !== 'employee'

  function travelFilter() {
    if (!isTeam) return { sql: 'requester_id = ?', params: [user.id] }
    if (user.role === 'l1_manager') {
      return {
        sql: 'requester_id IN (SELECT id FROM users WHERE manager_id = ?) OR requester_id = ?',
        params: [user.id, user.id],
      }
    }
    return { sql: '1=1', params: [] }
  }

  const tf = travelFilter()
  const travels = db
    .prepare(`SELECT * FROM travel_requests WHERE ${tf.sql}`)
    .all(...tf.params)
  const advances = db.prepare(`SELECT * FROM advances WHERE ${tf.sql}`).all(...tf.params)
  const expenses = db.prepare(`SELECT * FROM expenses WHERE ${tf.sql}`).all(...tf.params)

  const bookedStatuses = ['booked', 'boarding_pass_uploaded', 'closed']
  const travelTotal = travels.filter((t) => t.status !== 'draft').length
  const travelBooked = travels.filter((t) => bookedStatuses.includes(t.status) || t.current_stage === 'booked' || t.current_stage === 'boarding_pass' || t.current_stage === 'closed')
  const travelBookedAmount = travelBooked.reduce((s, t) => s + Number(t.amount || 0), 0)

  const advSubmitted = advances.filter((a) => a.status !== 'draft')
  const advClaimed = advances.filter((a) => a.status === 'closed' || a.current_stage === 'closed')
  const expSubmitted = expenses.filter((e) => e.status !== 'draft')
  const expClaimed = expenses.filter((e) => e.status === 'closed' || e.current_stage === 'closed')

  const upcoming = travels
    .filter((t) => t.departure_date && new Date(t.departure_date) >= new Date(new Date().toDateString()))
    .filter((t) => bookedStatuses.includes(t.status) || ['booked', 'boarding_pass', 'travel_desk'].includes(t.current_stage))
    .sort((a, b) => String(a.departure_date).localeCompare(String(b.departure_date)))
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      request_number: t.request_number,
      from_location: t.from_location,
      to_location: t.to_location,
      departure_date: t.departure_date,
      status: t.status,
      travel_mode: t.travel_mode,
    }))

  const pendingTravel = travels.filter((t) =>
    ['l1_approval', 'travel_desk', 'travel_desk_options', 'employee_selection', 'modification_l1', 'modification_travel_desk'].includes(
      t.current_stage
    )
  )
  const pendingAdvance = advances.filter((a) =>
    ['l1_approval', 'finance_approval', 'advance_release'].includes(a.current_stage)
  )
  const pendingExpense = expenses.filter((e) =>
    ['l1_approval', 'finance_validation', 'settlement'].includes(e.current_stage)
  )

  // Monthly trends last 6 months
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({
      key,
      label: d.toLocaleString('en-IN', { month: 'short' }),
      travel: 0,
      advance: 0,
      expense: 0,
    })
  }
  function bump(list, field, amountField = 'amount') {
    for (const row of list) {
      const dt = row.submitted_at || row.created_at
      if (!dt) continue
      const key = dt.slice(0, 7)
      const m = months.find((x) => x.key === key)
      if (m) m[field] += Number(row[amountField] || 0)
    }
  }
  bump(travels, 'travel')
  bump(advances, 'advance')
  bump(expenses, 'expense', 'claimable_amount')

  return {
    scope: isTeam ? 'team' : 'me',
    cards: {
      travel: {
        totalCount: travelTotal,
        bookedCount: travelBooked.length,
        bookedAmount: travelBookedAmount,
      },
      advance: {
        submittedCount: advSubmitted.length,
        submittedAmount: advSubmitted.reduce((s, a) => s + Number(a.amount || 0), 0),
        claimedCount: advClaimed.length,
        claimedAmount: advClaimed.reduce((s, a) => s + Number(a.amount || 0), 0),
      },
      expense: {
        submittedCount: expSubmitted.length,
        submittedAmount: expSubmitted.reduce((s, e) => s + Number(e.claimable_amount || e.amount || 0), 0),
        claimedCount: expClaimed.length,
        claimedAmount: expClaimed.reduce((s, e) => s + Number(e.claimable_amount || e.amount || 0), 0),
      },
    },
    approver: {
      pending: {
        travel: pendingTravel.length,
        advance: pendingAdvance.length,
        expense: pendingExpense.length,
      },
    },
    trends: months,
    upcoming,
    pending: {
      travel: pendingTravel.slice(0, 20).map((t) => ({
        id: t.id,
        request_number: t.request_number,
        type: 'travel',
        travel_mode: t.travel_mode,
        requestor_id: t.requester_id,
        from_location: t.from_location,
        to_location: t.to_location,
        departure_date: t.departure_date,
        amount: t.amount,
        current_stage: t.current_stage,
        status: t.status,
        updated_at: t.updated_at,
      })),
      advance: pendingAdvance.slice(0, 20).map((a) => ({
        id: a.id,
        request_number: a.request_number,
        type: 'advance',
        requestor_id: a.requester_id,
        travel_request_number: a.travel_request_number,
        amount: a.amount,
        current_stage: a.current_stage,
        status: a.status,
        updated_at: a.updated_at,
      })),
      expense: pendingExpense.slice(0, 20).map((e) => ({
        id: e.id,
        request_number: e.request_number,
        type: 'expense',
        requestor_id: e.requester_id,
        amount: e.claimable_amount || e.amount,
        expense_date: e.expense_date,
        current_stage: e.current_stage,
        status: e.status,
        updated_at: e.updated_at,
      })),
    },
  }
}
