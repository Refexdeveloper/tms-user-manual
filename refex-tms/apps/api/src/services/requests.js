import { nanoid } from 'nanoid'
import { getDb, nowIso } from '../db/index.js'
import {
  canRaiseAirModification,
  initialStage,
  isAirMode,
  stageLabel,
  timelineFor,
  transition,
} from '../workflow/engine.js'

function nextRequestNumber(db) {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c FROM travel_requests`
    )
    .get()
  const n = (row?.c || 0) + 1
  return `TR${String(n).padStart(4, '0')}`
}

function parseJson(value, fallback = null) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function serializeRequest(row) {
  if (!row) return null
  return {
    ...row,
    travel_desk_booking: Boolean(row.travel_desk_booking),
    exception_flag: Boolean(row.exception_flag),
    selected_option: parseJson(row.selected_option_json),
    flight_search_snapshot: parseJson(row.flight_search_snapshot),
    cab: parseJson(row.cab_json),
    accommodation: parseJson(row.accommodation_json),
    train: parseJson(row.train_json),
    bus: parseJson(row.bus_json),
    selected_option_json: undefined,
    cab_json: undefined,
    accommodation_json: undefined,
    train_json: undefined,
    bus_json: undefined,
    current_stage_label: stageLabel(row.current_stage),
    timeline: timelineFor(row.travel_mode, row.current_stage, row.status),
    can_modify: canRaiseAirModification(row),
  }
}

function logEvent(db, { requestId, stage, action, actor, comment, meta }) {
  db.prepare(
    `INSERT INTO workflow_events
      (id, request_id, stage, action, actor_id, actor_name, comment, meta_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    nanoid(),
    requestId,
    stage,
    action,
    actor?.id || null,
    actor?.name || null,
    comment || null,
    meta ? JSON.stringify(meta) : null,
    nowIso()
  )
}

export function listUsers() {
  return getDb().prepare('SELECT * FROM users ORDER BY role, name').all()
}

export function getUser(id) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id)
}

export function createDraft(user, body) {
  const db = getDb()
  const id = nanoid()
  const ts = nowIso()
  const mode = body.travel_mode || 'air'
  const requestNumber = nextRequestNumber(db)

  db.prepare(
    `INSERT INTO travel_requests (
      id, request_number, version, requester_id, travel_mode, status, current_stage,
      purpose, trip_type, travel_desk_booking, domestic_international, beneficiary,
      from_location, to_location, departure_date, return_date, fare_class,
      amount, currency, selected_option_json, flight_search_snapshot,
      cab_json, accommodation_json, train_json, bus_json,
      exception_flag, exception_reason, remarks, created_at, updated_at
    ) VALUES (
      @id, @request_number, 1, @requester_id, @travel_mode, @status, @current_stage,
      @purpose, @trip_type, @travel_desk_booking, @domestic_international, @beneficiary,
      @from_location, @to_location, @departure_date, @return_date, @fare_class,
      @amount, @currency, @selected_option_json, @flight_search_snapshot,
      @cab_json, @accommodation_json, @train_json, @bus_json,
      @exception_flag, @exception_reason, @remarks, @created_at, @updated_at
    )`
  ).run({
    id,
    request_number: requestNumber,
    requester_id: user.id,
    travel_mode: mode,
    status: 'draft',
    current_stage: initialStage(mode),
    purpose: body.purpose || null,
    trip_type: body.trip_type || null,
    travel_desk_booking: body.travel_desk_booking === false ? 0 : 1,
    domestic_international: body.domestic_international || 'Domestic',
    beneficiary: body.beneficiary || 'Self',
    from_location: body.from_location || null,
    to_location: body.to_location || null,
    departure_date: body.departure_date || null,
    return_date: body.return_date || null,
    fare_class: body.fare_class || 'Economy',
    amount: body.amount ?? null,
    currency: body.currency || 'INR',
    selected_option_json: body.selected_option
      ? JSON.stringify(body.selected_option)
      : null,
    flight_search_snapshot: body.flight_search_snapshot
      ? JSON.stringify(body.flight_search_snapshot)
      : null,
    cab_json: body.cab ? JSON.stringify(body.cab) : null,
    accommodation_json: body.accommodation
      ? JSON.stringify(body.accommodation)
      : null,
    train_json: body.train ? JSON.stringify(body.train) : null,
    bus_json: body.bus ? JSON.stringify(body.bus) : null,
    exception_flag: body.exception_flag ? 1 : 0,
    exception_reason: body.exception_reason || null,
    remarks: body.remarks || null,
    created_at: ts,
    updated_at: ts,
  })

  logEvent(db, {
    requestId: id,
    stage: initialStage(mode),
    action: 'draft_created',
    actor: user,
    comment: 'Draft created',
  })

  return getRequest(id)
}

export function updateDraft(user, id, body) {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(id)
  if (!existing) throw Object.assign(new Error('Not found'), { status: 404 })
  if (existing.requester_id !== user.id) {
    throw Object.assign(new Error('Only requester can edit'), { status: 403 })
  }
  if (!['draft', 'modification_required'].includes(existing.status) && existing.current_stage !== 'draft') {
    throw Object.assign(new Error('Request is not editable'), { status: 400 })
  }

  const ts = nowIso()
  db.prepare(
    `UPDATE travel_requests SET
      purpose = COALESCE(@purpose, purpose),
      trip_type = COALESCE(@trip_type, trip_type),
      travel_desk_booking = COALESCE(@travel_desk_booking, travel_desk_booking),
      domestic_international = COALESCE(@domestic_international, domestic_international),
      beneficiary = COALESCE(@beneficiary, beneficiary),
      from_location = COALESCE(@from_location, from_location),
      to_location = COALESCE(@to_location, to_location),
      departure_date = COALESCE(@departure_date, departure_date),
      return_date = COALESCE(@return_date, return_date),
      fare_class = COALESCE(@fare_class, fare_class),
      amount = COALESCE(@amount, amount),
      selected_option_json = COALESCE(@selected_option_json, selected_option_json),
      flight_search_snapshot = COALESCE(@flight_search_snapshot, flight_search_snapshot),
      cab_json = COALESCE(@cab_json, cab_json),
      accommodation_json = COALESCE(@accommodation_json, accommodation_json),
      train_json = COALESCE(@train_json, train_json),
      bus_json = COALESCE(@bus_json, bus_json),
      exception_flag = COALESCE(@exception_flag, exception_flag),
      exception_reason = COALESCE(@exception_reason, exception_reason),
      remarks = COALESCE(@remarks, remarks),
      boarding_datetime = COALESCE(@boarding_datetime, boarding_datetime),
      updated_at = @updated_at,
      version = version + 1
     WHERE id = @id`
  ).run({
    id,
    purpose: body.purpose ?? null,
    trip_type: body.trip_type ?? null,
    travel_desk_booking:
      body.travel_desk_booking === undefined
        ? null
        : body.travel_desk_booking
          ? 1
          : 0,
    domestic_international: body.domestic_international ?? null,
    beneficiary: body.beneficiary ?? null,
    from_location: body.from_location ?? null,
    to_location: body.to_location ?? null,
    departure_date: body.departure_date ?? null,
    return_date: body.return_date ?? null,
    fare_class: body.fare_class ?? null,
    amount: body.amount ?? null,
    selected_option_json: body.selected_option
      ? JSON.stringify(body.selected_option)
      : null,
    flight_search_snapshot: body.flight_search_snapshot
      ? JSON.stringify(body.flight_search_snapshot)
      : null,
    cab_json: body.cab ? JSON.stringify(body.cab) : null,
    accommodation_json: body.accommodation
      ? JSON.stringify(body.accommodation)
      : null,
    train_json: body.train ? JSON.stringify(body.train) : null,
    bus_json: body.bus ? JSON.stringify(body.bus) : null,
    exception_flag:
      body.exception_flag === undefined ? null : body.exception_flag ? 1 : 0,
    exception_reason: body.exception_reason ?? null,
    remarks: body.remarks ?? null,
    boarding_datetime: body.boarding_datetime ?? null,
    updated_at: ts,
  })

  logEvent(db, {
    requestId: id,
    stage: existing.current_stage,
    action: 'draft_updated',
    actor: user,
  })

  return getRequest(id)
}

export function getRequest(id) {
  const row = getDb().prepare('SELECT * FROM travel_requests WHERE id = ?').get(id)
  return serializeRequest(row)
}

export function listRequests(user, query = {}) {
  const db = getDb()
  let sql = `SELECT * FROM travel_requests WHERE 1=1`
  const params = []

  if (user.role === 'employee') {
    sql += ` AND requester_id = ?`
    params.push(user.id)
  } else if (user.role === 'l1_manager') {
    sql += ` AND (
      requester_id IN (SELECT id FROM users WHERE manager_id = ?)
      OR current_stage IN ('l1_approval', 'modification_l1')
    )`
    params.push(user.id)
  } else if (user.role === 'travel_desk') {
    sql += ` AND current_stage IN (
      'travel_desk', 'travel_desk_options', 'boarding_pass', 'booked',
      'modification_travel_desk', 'employee_selection'
    )`
  }

  if (query.status) {
    sql += ` AND status = ?`
    params.push(query.status)
  }
  if (query.mode) {
    sql += ` AND travel_mode = ?`
    params.push(query.mode)
  }
  if (query.q) {
    sql += ` AND (request_number LIKE ? OR from_location LIKE ? OR to_location LIKE ? OR purpose LIKE ?)`
    const like = `%${query.q}%`
    params.push(like, like, like, like)
  }

  sql += ` ORDER BY updated_at DESC`
  return db.prepare(sql).all(...params).map(serializeRequest)
}

export function getEvents(requestId) {
  return getDb()
    .prepare(
      `SELECT * FROM workflow_events WHERE request_id = ? ORDER BY created_at ASC`
    )
    .all(requestId)
}

export function applyAction(user, id, { action, comment, meta }) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(id)
  if (!row) throw Object.assign(new Error('Not found'), { status: 404 })

  if (action === 'request_modification' && isAirMode(row.travel_mode)) {
    if (!canRaiseAirModification(row)) {
      throw Object.assign(
        new Error('Modification allowed only up to 8 hours before boarding'),
        { status: 400 }
      )
    }
  }

  if (['reject', 'modification_request'].includes(action) && !comment) {
    throw Object.assign(new Error('Comment is mandatory'), { status: 400 })
  }

  const { nextStage, nextStatus } = transition({
    mode: row.travel_mode,
    stage: row.current_stage,
    action,
    payload: meta || {},
  })

  const ts = nowIso()
  const patch = {
    current_stage: nextStage,
    status: nextStatus,
    updated_at: ts,
    submitted_at: action === 'submit' ? ts : row.submitted_at,
    booked_at:
      action === 'book' || action === 'select_option' ? ts : row.booked_at,
    boarding_datetime: meta?.boarding_datetime || row.boarding_datetime,
    amount: meta?.amount != null ? meta.amount : row.amount,
    selected_option_json: meta?.selected_option
      ? JSON.stringify(meta.selected_option)
      : row.selected_option_json,
    boarding_pass_path:
      action === 'upload_boarding_pass' && meta?.boarding_pass_path
        ? meta.boarding_pass_path
        : row.boarding_pass_path,
    closed_at:
      action === 'collect_amount' || action === 'close' || nextStage === 'closed'
        ? ts
        : row.closed_at,
  }

  db.prepare(
    `UPDATE travel_requests SET
      current_stage = @current_stage,
      status = @status,
      updated_at = @updated_at,
      submitted_at = @submitted_at,
      booked_at = @booked_at,
      boarding_datetime = @boarding_datetime,
      amount = @amount,
      selected_option_json = @selected_option_json,
      boarding_pass_path = @boarding_pass_path,
      closed_at = @closed_at
     WHERE id = @id`
  ).run({ id, ...patch })

  logEvent(db, {
    requestId: id,
    stage: row.current_stage,
    action,
    actor: user,
    comment,
    meta,
  })

  return getRequest(id)
}

export function addTravelDeskOptions(user, requestId, options) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(requestId)
  if (!row) throw Object.assign(new Error('Not found'), { status: 404 })

  const insert = db.prepare(
    `INSERT INTO travel_desk_options
      (id, request_id, option_label, amount, remarks, meta_json, selected, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
  )
  const ts = nowIso()
  const tx = () => {
    for (const opt of options) {
      insert.run(
        nanoid(),
        requestId,
        opt.label,
        opt.amount ?? null,
        opt.remarks || null,
        opt.meta ? JSON.stringify(opt.meta) : null,
        user.id,
        ts
      )
    }
  }
  db.exec('BEGIN')
  try {
    tx()
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }

  return listTravelDeskOptions(requestId)
}

export function listTravelDeskOptions(requestId) {
  return getDb()
    .prepare(
      `SELECT * FROM travel_desk_options WHERE request_id = ? ORDER BY created_at ASC`
    )
    .all(requestId)
    .map((o) => ({
      ...o,
      selected: Boolean(o.selected),
      meta: parseJson(o.meta_json),
      meta_json: undefined,
    }))
}

export function selectTravelDeskOption(user, requestId, optionId) {
  const db = getDb()
  const option = db
    .prepare(`SELECT * FROM travel_desk_options WHERE id = ? AND request_id = ?`)
    .get(optionId, requestId)
  if (!option) throw Object.assign(new Error('Option not found'), { status: 404 })

  db.prepare(`UPDATE travel_desk_options SET selected = 0 WHERE request_id = ?`).run(
    requestId
  )
  db.prepare(`UPDATE travel_desk_options SET selected = 1 WHERE id = ?`).run(optionId)

  return applyAction(user, requestId, {
    action: 'select_option',
    comment: `Selected option: ${option.option_label}`,
    meta: {
      amount: option.amount,
      selected_option: {
        id: option.id,
        label: option.option_label,
        amount: option.amount,
        remarks: option.remarks,
      },
    },
  })
}
