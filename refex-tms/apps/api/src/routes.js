import { Router } from 'express'
import { authRequired, requireRoles, signToken } from './middleware/auth.js'
import {
  addTravelDeskOptions,
  applyAction,
  createDraft,
  getEvents,
  getRequest,
  getUser,
  listRequests,
  listTravelDeskOptions,
  listUsers,
  selectTravelDeskOption,
  updateDraft,
} from './services/requests.js'
import {
  advanceAction,
  createAdvance,
  createExpense,
  expenseAction,
  getActivity,
  getAdvance,
  getDashboard,
  getExpense,
  listAdvances,
  listExpenses,
  updateAdvance,
  updateExpense,
} from './services/finance.js'

import multer from 'multer'
import { nanoid } from 'nanoid'
import { storage } from './storage/index.js'
import { getDb, nowIso } from './db/index.js'
import { searchPlaces } from './services/places.js'
import { config } from './config.js'
import {
  actionTravelItem,
  createAndSubmitTravel,
  createTravelItem,
  getTravelItem,
  kissflowStatus,
  listTravelItems,
  submitTravelItem,
  extractInstanceIds,
} from './services/kissflow.js'
import { toKissflowTravelFields } from './services/kissflowTravel.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } })

export const authRouter = Router()
export const apiRouter = Router()

authRouter.get('/users', (_req, res) => {
  res.json({
    users: listUsers().map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      department: u.department,
      designation: u.designation,
    })),
  })
})

authRouter.post('/login', (req, res) => {
  const { userId } = req.body || {}
  const user = getUser(userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const token = signToken(user)
  res.json({ token, user })
})

authRouter.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})

apiRouter.use(authRequired)

apiRouter.get('/requests', (req, res) => {
  res.json({ requests: listRequests(req.user, req.query) })
})

apiRouter.post('/requests', (req, res) => {
  try {
    const created = createDraft(req.user, req.body || {})
    res.status(201).json({ request: created })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.get('/requests/:id', (req, res) => {
  const request = getRequest(req.params.id)
  if (!request) return res.status(404).json({ error: 'Not found' })
  res.json({
    request,
    events: getEvents(req.params.id),
    options: listTravelDeskOptions(req.params.id),
  })
})

apiRouter.patch('/requests/:id', (req, res) => {
  try {
    const updated = updateDraft(req.user, req.params.id, req.body || {})
    res.json({ request: updated })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.post('/requests/:id/actions', (req, res) => {
  try {
    const { action, comment, meta } = req.body || {}
    if (!action) return res.status(400).json({ error: 'action required' })
    const request = applyAction(req.user, req.params.id, { action, comment, meta })
    res.json({ request, events: getEvents(req.params.id) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.post(
  '/requests/:id/options',
  requireRoles('travel_desk'),
  (req, res) => {
    try {
      const options = req.body?.options || []
      if (!options.length) {
        return res.status(400).json({ error: 'options array required' })
      }
      const saved = addTravelDeskOptions(req.user, req.params.id, options)
      const request = applyAction(req.user, req.params.id, {
        action: 'suggest',
        comment: req.body?.comment || 'Travel Desk shared options',
        meta: { count: options.length },
      })
      res.json({ request, options: saved })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  }
)

apiRouter.post('/requests/:id/options/:optionId/select', (req, res) => {
  try {
    const request = selectTravelDeskOption(
      req.user,
      req.params.id,
      req.params.optionId
    )
    res.json({ request, options: listTravelDeskOptions(req.params.id) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.post(
  '/requests/:id/attachments',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'file required' })
      const kind = req.body?.kind || 'boarding_pass'
      const key = `requests/${req.params.id}/${kind}/${nanoid()}-${req.file.originalname}`
      await storage.put({
        key,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
      })

      getDb()
        .prepare(
          `INSERT INTO attachments
            (id, request_id, kind, storage_key, file_name, mime_type, size, uploaded_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          nanoid(),
          req.params.id,
          kind,
          key,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          req.user.id,
          nowIso()
        )

      let request = getRequest(req.params.id)
      if (kind === 'boarding_pass') {
        request = applyAction(req.user, req.params.id, {
          action: 'upload_boarding_pass',
          comment: 'Boarding pass uploaded',
          meta: { boarding_pass_path: key },
        })
      }

      res.status(201).json({ request, storageKey: key })
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  }
)

/** Proxy to existing Cloud Run flight search — Air only */
apiRouter.get('/flights/airports', async (req, res) => {
  try {
    const term = req.query.term || ''
    const limit = req.query.limit || 8
    const url = `${config.flightApiBase}/api/airports/search?term=${encodeURIComponent(term)}&limit=${limit}`
    const response = await fetch(url)
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

apiRouter.post('/flights/search', async (req, res) => {
  try {
    const response = await fetch(`${config.flightApiBase}/api/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

/** Location search for Train/Bus — uses airport city data as location source for now */
apiRouter.get('/locations/search', async (req, res) => {
  try {
    const term = req.query.term || ''
    if (term.length < 2) return res.json({ results: [] })
    const url = `${config.flightApiBase}/api/airports/search?term=${encodeURIComponent(term)}&limit=10`
    const response = await fetch(url)
    const data = await response.json()
    const results = (data.results || []).map((a) => ({
      id: a.code || a.city,
      label: a.city || a.name,
      subLabel: [a.code, a.name, a.country].filter(Boolean).join(' · '),
      city: a.city,
      code: a.code,
      country: a.country,
      lat: a.lat,
      lon: a.lon,
    }))
    res.json({ results })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

/** Google Places–ready location search for Train / Bus / Cab / Hotel */
apiRouter.get('/places/search', async (req, res) => {
  try {
    const data = await searchPlaces(req.query.term || '', Number(req.query.limit || 8))
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

apiRouter.get('/dashboard', (req, res) => {
  try {
    res.json(getDashboard(req.user, req.query.scope || 'me'))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

apiRouter.get('/advances', (req, res) => {
  res.json({ advances: listAdvances(req.user, req.query) })
})

apiRouter.post('/advances', (req, res) => {
  try {
    res.status(201).json({ advance: createAdvance(req.user, req.body || {}) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.get('/advances/:id', (req, res) => {
  const advance = getAdvance(req.params.id)
  if (!advance) return res.status(404).json({ error: 'Not found' })
  res.json({ advance, events: getActivity('advance', req.params.id) })
})

apiRouter.patch('/advances/:id', (req, res) => {
  try {
    res.json({ advance: updateAdvance(req.user, req.params.id, req.body || {}) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.post('/advances/:id/actions', (req, res) => {
  try {
    const advance = advanceAction(req.user, req.params.id, req.body || {})
    res.json({ advance, events: getActivity('advance', req.params.id) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.get('/expenses', (req, res) => {
  res.json({ expenses: listExpenses(req.user, req.query) })
})

apiRouter.post('/expenses', (req, res) => {
  try {
    res.status(201).json({ expense: createExpense(req.user, req.body || {}) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.get('/expenses/:id', (req, res) => {
  const expense = getExpense(req.params.id)
  if (!expense) return res.status(404).json({ error: 'Not found' })
  res.json({ expense, events: getActivity('expense', req.params.id) })
})

apiRouter.patch('/expenses/:id', (req, res) => {
  try {
    res.json({ expense: updateExpense(req.user, req.params.id, req.body || {}) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

apiRouter.post('/expenses/:id/actions', (req, res) => {
  try {
    const expense = expenseAction(req.user, req.params.id, req.body || {})
    res.json({ expense, events: getActivity('expense', req.params.id) })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

/** ——— Kissflow BFF (Option B): UI → BFF → Travel_Management_A02 ——— */

apiRouter.get('/kissflow/status', (_req, res) => {
  res.json(kissflowStatus())
})

apiRouter.get('/kissflow/travel', async (req, res) => {
  try {
    const data = await listTravelItems({
      pageNumber: Number(req.query.page || 1),
      pageSize: Number(req.query.pageSize || 50),
    })
    res.json({ items: data, status: kissflowStatus() })
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message, details: err.details })
  }
})

apiRouter.get('/kissflow/travel/:instanceId', async (req, res) => {
  try {
    const item = await getTravelItem(req.params.instanceId)
    res.json({ item })
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message, details: err.details })
  }
})

/**
 * Create (+ optional submit) Travel Request on Kissflow.
 * Body: same shape as local POST /requests, or { fields: {...}, submit: true }
 */
apiRouter.post('/kissflow/travel', async (req, res) => {
  try {
    const body = req.body || {}
    const fields = body.fields || toKissflowTravelFields(body, req.user)
    const shouldSubmit = body.submit !== false

    if (shouldSubmit) {
      const result = await createAndSubmitTravel(fields)
      return res.status(201).json({
        ok: true,
        mode: 'create_and_submit',
        instanceId: result.instanceId,
        activityInstanceId: result.activityInstanceId,
        warning: result.warning || null,
        created: result.created,
        submitted: result.submitted,
        fieldsWritten: Object.keys(fields),
      })
    }

    const created = await createTravelItem(fields)
    const ids = extractInstanceIds(created)
    res.status(201).json({
      ok: true,
      mode: 'create_draft',
      ...ids,
      created,
      fieldsWritten: Object.keys(fields),
    })
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message, details: err.details })
  }
})

/** Submit an existing draft instance */
apiRouter.post('/kissflow/travel/:instanceId/submit', async (req, res) => {
  try {
    const activityInstanceId =
      req.body?.activityInstanceId || req.body?.activity_instance_id
    const fields = req.body?.fields || toKissflowTravelFields(req.body || {}, req.user)
    const submitted = await submitTravelItem(req.params.instanceId, activityInstanceId, fields)
    res.json({ ok: true, submitted })
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message, details: err.details })
  }
})

/**
 * Approve / Reject / Send back — Kissflow keeps workflow ownership.
 * Body: { action: 'submit'|'approve'|'reject'|'sendback', activityInstanceId, comment?, fields? }
 */
apiRouter.post('/kissflow/travel/:instanceId/actions', async (req, res) => {
  try {
    const { action, activityInstanceId, activity_instance_id, comment, fields } = req.body || {}
    if (!action) return res.status(400).json({ error: 'action required' })
    const result = await actionTravelItem(
      req.params.instanceId,
      activityInstanceId || activity_instance_id,
      action,
      { ...(fields || {}), ...(comment ? { Comments: comment } : {}) }
    )
    res.json({ ok: true, result })
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message, details: err.details })
  }
})
